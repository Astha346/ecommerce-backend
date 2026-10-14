import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
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
  // VERIFY LOGIN OTP
  // ==========================================

  @Post("verify-otp")
  verifyOtp(
    @Body()
    body: {
      challengeId: string;
      otp: string;
    },
  ) {
    return this.authService.verifyOtp(
      body.challengeId,
      body.otp,
    );
  }

  // ==========================================
  // RESEND LOGIN OTP
  // ==========================================

  @Post("resend-otp")
  resendOtp(
    @Body()
    body: {
      challengeId: string;
    },
  ) {
    return this.authService.resendOtp(
      body.challengeId,
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
  
  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  changePassword(
    @Req() req: any,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        "Authenticated user ID not found",
      );
    }

    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

}