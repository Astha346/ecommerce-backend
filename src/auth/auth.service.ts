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

import { ForgotPasswordDto } from "./dto/forgot-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // REGISTER
  async register(body: any) {
    const {
      username,
      email,
      password,
      role,
    } = body;

    const existingUser =
      await this.usersService.findByEmail(
        email,
      );

    if (existingUser) {
      throw new BadRequestException(
        "Email already exists",
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    const user =
      await this.usersService.create({
        username,
        email,
        password:
          hashedPassword,
        role: role || "customer",
      });

    return {
      message:
        "Registration successful",
      user,
    };
  }

  // LOGIN
  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByEmail(
        email,
      );

    if (!user) {
      throw new UnauthorizedException(
        "User not found",
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isMatch) {
      throw new UnauthorizedException(
        "Wrong password",
      );
    }

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token:
        this.jwtService.sign(
          payload,
        ),

      user: {
        id: user._id,
        username:
          user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  // FORGOT PASSWORD
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

  // RESET PASSWORD
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