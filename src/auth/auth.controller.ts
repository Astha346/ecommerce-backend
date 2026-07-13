import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post("login")
  login(@Body() body: any) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }

  @Post("register")
  register(@Body() body: any) {
    return this.authService.register(
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Post("forgot-password")
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(
      dto,
    );
  }

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