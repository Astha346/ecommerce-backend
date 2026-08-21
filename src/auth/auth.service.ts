import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

import { RolePermissionsService } from "../role-permissions/role-permissions.service";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";

import { RolesService } from "../roles/roles.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,

    private readonly rolesService: RolesService,

    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  // =====================================================
  // REGISTER
  // =====================================================

  async register(body: any) {
    const {
      username,
      email,
      password,
      role,
    } = body;

    // Check existing email
    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        "Email already exists",
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Default role
    const roleName =
      role || "customer";

    // Find role
    const roleData =
      await this.rolesService.findByName(
        roleName,
      );

    if (!roleData) {
      throw new BadRequestException(
        `Invalid role: ${roleName}`,
      );
    }

    // Create user
    const user =
      await this.usersService.create({
        username,
        email,
        password: hashedPassword,
        role: roleData._id,
      });

    return {
      message:
        "Registration successful",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: roleData.name,
      },
    };
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(
    email: string,
    password: string,
  ) {
    // Find user
    const user =
      await this.usersService.findByEmail(
        email,
      );

    if (!user) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    // Check password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isMatch) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    // =================================================
    // CHECK ROLE
    // =================================================

    const role = user.role as any;

    if (!role) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    if (
      !role._id ||
      !role.name
    ) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    console.log(
      "LOGIN USER =",
      user.email,
    );

    console.log(
      "ROLE ID =",
      role._id,
    );

    console.log(
      "ROLE NAME =",
      role.name,
    );

    // =================================================
    // GET ROLE PERMISSIONS
    // =================================================

    const rolePermissions =
      await this.rolePermissionsService
        .getPermissionsByRole(
          role._id.toString(),
        );

    // =================================================
    // GET PERMISSION NAMES
    // =================================================

    const permissions =
      rolePermissions
        .filter(
          (rp: any) =>
            rp.permission,
        )
        .map(
          (rp: any) =>
            rp.permission.name,
        );

    console.log(
      "PERMISSIONS =",
      permissions,
    );

    // =================================================
    // ACCESS TOKEN PAYLOAD
    // =================================================

    const payload = {
      id: user._id.toString(),

      email: user.email,

      roleId:
        role._id.toString(),

      role: role.name,
    };

    // =================================================
    // CREATE ACCESS TOKEN
    // =================================================

    const accessToken =
      this.jwtService.sign(
        payload,
        {
          expiresIn: "15m",
        },
      );

    // =================================================
    // CREATE REFRESH TOKEN
    // =================================================

    const refreshToken =
      crypto
        .randomBytes(64)
        .toString("hex");

    // Refresh token valid for 7 days
    const refreshTokenExpires =
      new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      );

    // Save refresh token in MongoDB
    user.refreshToken =
      refreshToken;

    user.refreshTokenExpires =
      refreshTokenExpires;

    await user.save();

    // =================================================
    // LOGIN RESPONSE
    // =================================================

    return {
      access_token:
        accessToken,

      refresh_token:
        refreshToken,

      user: {
        id: user._id.toString(),

        username:
          user.username,

        email:
          user.email,

        role:
          role.name,

        permissions,
      },
    };
  }

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

  async refreshToken(
    refreshToken: string,
  ) {
    // Check refresh token
    if (!refreshToken) {
      throw new UnauthorizedException(
        "Refresh token required",
      );
    }

    // Find user by refresh token
    const user =
      await this.usersService.findByRefreshToken(
        refreshToken,
      );

    if (!user) {
      throw new UnauthorizedException(
        "Invalid refresh token",
      );
    }

    // =================================================
    // CHECK EXPIRATION
    // =================================================

    if (
      !user.refreshTokenExpires ||
      user.refreshTokenExpires <
        new Date()
    ) {
      user.refreshToken = null;

      user.refreshTokenExpires = null;

      await user.save();

      throw new UnauthorizedException(
        "Refresh token expired",
      );
    }

    // =================================================
    // CHECK ROLE
    // =================================================

    const role = user.role as any;

    if (!role) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    if (
      !role._id ||
      !role.name
    ) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    // =================================================
    // GET ROLE PERMISSIONS
    // =================================================

    const rolePermissions =
      await this.rolePermissionsService
        .getPermissionsByRole(
          role._id.toString(),
        );

    const permissions =
      rolePermissions
        .filter(
          (rp: any) =>
            rp.permission,
        )
        .map(
          (rp: any) =>
            rp.permission.name,
        );

    // =================================================
    // CREATE NEW ACCESS TOKEN
    // =================================================

    const payload = {
      id: user._id.toString(),

      email: user.email,

      roleId:
        role._id.toString(),

      role: role.name,
    };

    const newAccessToken =
      this.jwtService.sign(
        payload,
        {
          expiresIn: "15m",
        },
      );

    // =================================================
    // CREATE NEW REFRESH TOKEN
    // =================================================

    const newRefreshToken =
      crypto
        .randomBytes(64)
        .toString("hex");

    const newRefreshTokenExpires =
      new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000,
      );

    // Replace old refresh token
    user.refreshToken =
      newRefreshToken;

    user.refreshTokenExpires =
      newRefreshTokenExpires;

    await user.save();

    // =================================================
    // RETURN NEW TOKENS
    // =================================================

    return {
      access_token:
        newAccessToken,

      refresh_token:
        newRefreshToken,

      user: {
        id: user._id.toString(),

        username:
          user.username,

        email:
          user.email,

        role:
          role.name,

        permissions,
      },
    };
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout(
    userId: string,
  ) {
    const user =
      await this.usersService.findById(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        "User not found",
      );
    }

    // Remove refresh token
    user.refreshToken = null;

    user.refreshTokenExpires = null;

    await user.save();

    return {
      message:
        "Logout successful",
    };
  }

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  async forgotPassword(
    dto: ForgotPasswordDto,
  ) {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new NotFoundException(
        "User not found",
      );
    }

    // Generate token
    const token =
      crypto
        .randomBytes(32)
        .toString("hex");

    user.resetPasswordToken =
      token;

    user.resetPasswordExpires =
      new Date(
        Date.now() +
          15 * 60 * 1000,
      );

    await user.save();

    return {
      message:
        "Reset link generated",

      resetLink:
        `http://localhost:3000/reset-password/${token}`,
    };
  }

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async resetPassword(
    token: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByResetToken(
        token,
      );

    if (!user) {
      throw new BadRequestException(
        "Invalid token",
      );
    }

    if (
      !user.resetPasswordExpires ||
      user.resetPasswordExpires <
        new Date()
    ) {
      throw new BadRequestException(
        "Token expired",
      );
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    user.password =
      hashedPassword;

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpires =
      undefined;

    await user.save();

    return {
      message:
        "Password reset successful",
    };
  }
}