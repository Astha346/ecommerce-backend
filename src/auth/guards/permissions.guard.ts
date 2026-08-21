import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

import { RolePermissionsService } from "../../role-permissions/role-permissions.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    // ==========================================
    // GET REQUIRED PERMISSION
    // ==========================================

    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // If endpoint does not require permission
    if (
      !requiredPermissions ||
      requiredPermissions.length === 0
    ) {
      return true;
    }

    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    console.log("================================");
    console.log("PERMISSION CHECK");
    console.log("JWT USER =", user);
    console.log("REQUIRED =", requiredPermissions);

    if (!user) {
      throw new UnauthorizedException(
        "User not authenticated",
      );
    }

    // ==========================================
    // GET ROLE ID
    // ==========================================

    const roleId = user.roleId;

    if (!roleId) {
      throw new UnauthorizedException(
        "User does not have a valid role",
      );
    }

    console.log("ROLE ID =", roleId);

    // ==========================================
    // GET ROLE PERMISSIONS FROM DATABASE
    // ==========================================

    const rolePermissions =
      await this.rolePermissionsService
        .getPermissionsByRole(roleId);

    console.log(
      "ROLE PERMISSIONS =",
      rolePermissions,
    );

    // ==========================================
    // GET PERMISSION NAMES
    // ==========================================

    const userPermissions =
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
      "USER PERMISSIONS =",
      userPermissions,
    );

    // ==========================================
    // CHECK PERMISSION
    // ==========================================

    const hasPermission =
      requiredPermissions.some(
        (permission) =>
          userPermissions.includes(
            permission,
          ),
      );

    console.log(
      "HAS PERMISSION =",
      hasPermission,
    );

    console.log("================================");

    if (!hasPermission) {
      throw new ForbiddenException(
        "You do not have permission to perform this action",
      );
    }

    return true;
  }
}