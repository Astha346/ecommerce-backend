import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    console.log("========== JWT REQUEST ==========");

    console.log(
      "AUTH HEADER:",
      request.headers.authorization?.substring(0, 25)
    );

    console.log(
      "AUTH HEADER LENGTH:",
      request.headers.authorization?.length
    );

    console.log("=================================");

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    console.log("========== JWT RESULT ==========");

    console.log("ERROR:", err);
    console.log("USER:", user);
    console.log("INFO:", info);

    console.log("================================");

    if (err || !user) {
      throw err || new UnauthorizedException(
        "JWT authentication failed"
      );
    }

    return user;
  }
}