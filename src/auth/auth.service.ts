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

    // Find role from Roles collection
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

        // IMPORTANT
        // Save Role ObjectId
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

    // User does not exist
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

    // If populate("role") failed
    if (!role) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    // Check populated role
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

    
    // GET ROLE PERMISSIONS
  

    const rolePermissions =
      await this.rolePermissionsService
        .getPermissionsByRole(
          role._id.toString(),
        );

    
    // GET PERMISSION NAMES
    

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

    
    // JWT PAYLOAD
    

    const payload = {
      id: user._id.toString(),

      email: user.email,

      roleId:
        role._id.toString(),

      role: role.name,
    };

    
    // RETURN LOGIN RESPONSE
    

    return {
      access_token:
        this.jwtService.sign(payload),

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