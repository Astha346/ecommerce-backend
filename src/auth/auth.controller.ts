import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================================
  // LOGIN
  // ==========================================

  @Post("login")
  login(@Body() body: any) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  // ==========================================
  // REGISTER
  // ==========================================

  @Post("register")
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================

  @Post("refresh")
  refresh(@Body() body: any) {
    console.log("REFRESH BODY =", body);

    const refreshToken =
      body.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException(
        "Refresh token required",
      );
    }

    console.log(
      "REFRESH TOKEN RECEIVED =",
      refreshToken,
    );

    return this.authService.refreshToken(
      refreshToken,
    );
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  @Post("logout")
  logout(@Body() body: any) {
    console.log("LOGOUT BODY =", body);

    if (!body.userId) {
      throw new UnauthorizedException(
        "User ID required",
      );
    }

    return this.authService.logout(
      body.userId,
    );
  }

  // ==========================================
  // PROFILE
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: any) {
    return req.user;
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  @Post("forgot-password")
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(
      dto,
    );
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  @Post("reset-password")
  resetPassword(
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      dto.token,
      dto.password,
    );
  }
}