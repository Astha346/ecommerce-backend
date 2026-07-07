import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    UsersModule,

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
  ],

  exports: [
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}