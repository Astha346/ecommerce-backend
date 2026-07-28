import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";
import { RolePermissionsModule } from "../role-permissions/role-permissions.module";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
  imports: [
    UsersModule,
    RolesModule,
    RolePermissionsModule,

    PassportModule.register({
      defaultStrategy: "jwt",
    }),

    JwtModule.register({
      secret: "secretKey123",
      signOptions: {
        expiresIn: "1h",
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    PermissionsGuard,
  ],

  exports: [
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}