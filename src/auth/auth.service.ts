
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { RolePermissionsService } from "../role-permissions/role-permissions.service";
import { RolesService } from "../roles/roles.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";

import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    private readonly rolePermissionsService: RolePermissionsService,
    private readonly configService: ConfigService,
  ) {}

  // =====================================================
  // SEND OTP EMAIL
  // =====================================================

  private async sendOtpEmail(
    email: string,
    otp: string,
  ): Promise<void> {
    const host = this.configService.get<string>("MAIL_HOST");
    const port = Number(
      this.configService.get<string>("MAIL_PORT") || 587,
    );
    const username = this.configService.get<string>("MAIL_USER");
    const password = this.configService.get<string>("MAIL_PASS");
    const from = this.configService.get<string>("MAIL_FROM");

    // Debug configuration without exposing credentials.
    console.log("MAIL SETTINGS:", {
      host,
      port,
      usernameConfigured: Boolean(username),
      passwordConfigured: Boolean(password),
      fromConfigured: Boolean(from),
    });

    if (
      !host ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535 ||
      !username ||
      !password ||
      !from
    ) {
      console.error(
        "Mail configuration is incomplete or invalid.",
      );

      throw new InternalServerErrorException(
        "Mail configuration is incomplete. Check your backend .env file.",
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: username,
        pass: password,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    try {
      console.log("Checking SMTP connection...");

      await transporter.verify();

      console.log("SMTP connection and authentication successful.");

      const info = await transporter.sendMail({
        from,
        to: email,
        subject: "ShopEase Login Verification Code",
        text: `Your ShopEase verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
      });

      console.log("OTP email submission result:", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });

      if (!info.accepted || info.accepted.length === 0) {
        throw new Error(
          "The SMTP server did not accept the recipient.",
        );
      }

      console.log("OTP email accepted by the SMTP server.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        const mailError = error as Error & {
          code?: string;
          response?: string;
          command?: string;
        };

        console.error("SMTP EMAIL ERROR:", {
          name: mailError.name,
          message: mailError.message,
          code: mailError.code,
          response: mailError.response,
          command: mailError.command,
        });
      } else {
        console.error("Unknown SMTP email error:", error);
      }

      throw error;
    } finally {
      transporter.close();
    }
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async register(body: any) {
    const { username, email, password, role } = body;

    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleName = role || "customer";

    const roleData = await this.rolesService.findByName(roleName);

    if (!roleData) {
      throw new BadRequestException(`Invalid role: ${roleName}`);
    }

    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      role: roleData._id,
    });

    return {
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: roleData.name,
      },
    };
  }

  // =====================================================
  // LOGIN — PASSWORD CHECK, THEN SEND OTP
  // =====================================================

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const role = user.role as any;

    if (!role?._id || !role?.name) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const challengeId = crypto.randomUUID();

    user.twoFactorOtpHash = await bcrypt.hash(otp, 10);
    user.twoFactorOtpExpires = new Date(
      Date.now() + 5 * 60 * 1000,
    );
    user.twoFactorChallengeId = challengeId;
    user.twoFactorOtpAttempts = 0;

    await user.save();

    try {
      await this.sendOtpEmail(user.email, otp);
    } catch (error: unknown) {
      // Keep the original cause visible in the backend terminal.
      console.error("OTP email delivery failed.");

      // Invalidate the challenge if email delivery fails.
      user.twoFactorOtpHash = null;
      user.twoFactorOtpExpires = null;
      user.twoFactorChallengeId = null;
      user.twoFactorOtpAttempts = 0;

      await user.save();

      throw new InternalServerErrorException(
        "Could not send the verification email. Check the backend terminal for the SMTP error and verify your Mailtrap configuration.",
      );
    }

    return {
      requiresTwoFactor: true,
      challengeId,
      message:
        "Verification code sent. Check your Mailtrap sandbox inbox.",
    };
  }

  // =====================================================
  // VERIFY LOGIN OTP
  // =====================================================

  async verifyOtp(challengeId: string, otp: string) {
    if (!challengeId || !otp) {
      throw new BadRequestException(
        "Challenge ID and verification code are required",
      );
    }

    const user =
      await this.usersService.findByTwoFactorChallenge(challengeId);

    if (!user || !user.twoFactorOtpHash) {
      throw new BadRequestException(
        "Invalid or expired verification request. Please log in again.",
      );
    }

    if (
      !user.twoFactorOtpExpires ||
      user.twoFactorOtpExpires.getTime() <= Date.now()
    ) {
      user.twoFactorOtpHash = null;
      user.twoFactorOtpExpires = null;
      user.twoFactorChallengeId = null;
      user.twoFactorOtpAttempts = 0;

      await user.save();

      throw new BadRequestException(
        "Verification code expired. Please log in again.",
      );
    }

    if ((user.twoFactorOtpAttempts || 0) >= 5) {
      user.twoFactorOtpHash = null;
      user.twoFactorOtpExpires = null;
      user.twoFactorChallengeId = null;
      user.twoFactorOtpAttempts = 0;

      await user.save();

      throw new BadRequestException(
        "Too many incorrect attempts. Please log in again.",
      );
    }

    const isValidOtp = await bcrypt.compare(
      String(otp),
      user.twoFactorOtpHash,
    );

    if (!isValidOtp) {
      user.twoFactorOtpAttempts =
        (user.twoFactorOtpAttempts || 0) + 1;

      if (user.twoFactorOtpAttempts >= 5) {
        user.twoFactorOtpHash = null;
        user.twoFactorOtpExpires = null;
        user.twoFactorChallengeId = null;
        user.twoFactorOtpAttempts = 0;
      }

      await user.save();

      throw new BadRequestException(
        user.twoFactorChallengeId
          ? "Incorrect verification code"
          : "Too many incorrect attempts. Please log in again.",
      );
    }

    user.twoFactorOtpHash = null;
    user.twoFactorOtpExpires = null;
    user.twoFactorChallengeId = null;
    user.twoFactorOtpAttempts = 0;

    await user.save();

    return this.issueLoginTokens(user);
  }

  // =====================================================
  // RESEND LOGIN OTP
  // =====================================================

  async resendOtp(challengeId: string) {
    if (!challengeId) {
      throw new BadRequestException("Challenge ID is required");
    }

    const user =
      await this.usersService.findByTwoFactorChallenge(challengeId);

    if (!user || !user.twoFactorChallengeId) {
      throw new BadRequestException(
        "Invalid verification request. Please log in again.",
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.twoFactorOtpHash = await bcrypt.hash(otp, 10);
    user.twoFactorOtpExpires = new Date(
      Date.now() + 5 * 60 * 1000,
    );
    user.twoFactorOtpAttempts = 0;

    await user.save();

    try {
      await this.sendOtpEmail(user.email, otp);
    } catch (error: unknown) {
      console.error("OTP resend email delivery failed.");

      user.twoFactorOtpHash = null;
      user.twoFactorOtpExpires = null;
      user.twoFactorChallengeId = null;
      user.twoFactorOtpAttempts = 0;

      await user.save();

      throw new InternalServerErrorException(
        "Could not resend the verification email. Check the backend terminal for the SMTP error.",
      );
    }

    return {
      message:
        "A new verification code has been sent to your Mailtrap sandbox inbox.",
    };
  }

  // =====================================================
  // ISSUE TOKENS AFTER SUCCESSFUL OTP VERIFICATION
  // =====================================================

  private async issueLoginTokens(user: any) {
    const role = user.role as any;

    if (!role?._id || !role?.name) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    const rolePermissions =
      await this.rolePermissionsService.getPermissionsByRole(
        role._id.toString(),
      );

    const permissions = rolePermissions
      .filter((rp: any) => rp.permission)
      .map((rp: any) => rp.permission.name);

    const payload = {
      id: user._id.toString(),
      email: user.email,
      roleId: role._id.toString(),
      role: role.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
    });

    const refreshToken = crypto.randomBytes(64).toString("hex");

    const refreshTokenExpires = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshTokenExpires;

    await user.save();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: role.name,
        permissions,
      },
    };
  }

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token required");
    }

    const user =
      await this.usersService.findByRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (
      !user.refreshTokenExpires ||
      user.refreshTokenExpires < new Date()
    ) {
      user.refreshToken = null;
      user.refreshTokenExpires = null;

      await user.save();

      throw new UnauthorizedException("Refresh token expired");
    }

    const role = user.role as any;

    if (!role?._id || !role?.name) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    const rolePermissions =
      await this.rolePermissionsService.getPermissionsByRole(
        role._id.toString(),
      );

    const permissions = rolePermissions
      .filter((rp: any) => rp.permission)
      .map((rp: any) => rp.permission.name);

    const payload = {
      id: user._id.toString(),
      email: user.email,
      roleId: role._id.toString(),
      role: role.name,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
    });

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenExpires = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpires = newRefreshTokenExpires;

    await user.save();

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: role.name,
        permissions,
      },
    };
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.refreshToken = null;
    user.refreshTokenExpires = null;

    await user.save();

    return {
      message: "Logout successful",
    };
  }

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000,
    );

    await user.save();

    return {
      message: "Reset link generated",
      resetLink: `http://localhost:3000/reset-password/${token}`,
    };
  }

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException("Invalid token");
    }

    if (
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException("Token expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.refreshToken = null;
    user.refreshTokenExpires = null;

    await user.save();

    return {
      message: "Password reset successful",
    };
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        "Current password and new password are required",
      );
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        "New password must be at least 8 characters long",
      );
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        "New password must be different from current password",
      );
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        "Current password is incorrect",
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.refreshToken = null;
    user.refreshTokenExpires = null;

    await user.save();

    return {
      message: "Password changed successfully. Please log in again.",
    };
  }
}
