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
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService,
    private rolePermissionsService : RolePermissionsService,
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

    const roleName = role || "customer";

    const roleData = await this.rolesService.findByName(roleName);

    if (!roleData) {
    throw new BadRequestException("Invalid role");
     }

  const user = await this.usersService.create({
  username,
  email,
  password: hashedPassword,
  role: roleData._id,
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

    const role = user.role as any;
    const rolePermissions =
    await this.rolePermissionsService.getPermissionsByRole(
    role._id.toString(),
  );

  const permissions = rolePermissions.map(
  (rp: any) => rp.permission.name,
);

   console.log("ROLE =", role);
console.log("ROLE ID =", role._id);
console.log("ROLE NAME =", role.name);
console.log("PERMISSIONS =", permissions);

const payload = {
  id: user.id,
  email: user.email,
  roleId: role._id,
  role: role.name,
};

return {
  access_token: this.jwtService.sign(payload),
    user: {
    id: user.id,
    username: user.username,
    email: user.email,
    role: role.name,
    permissions,
  },
   }
  };
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