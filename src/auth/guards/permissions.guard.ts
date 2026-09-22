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

    // If no permission is required
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

    // ==========================================
    // GET ROLE PERMISSIONS
    // ==========================================

    const rolePermissions =
      await this.rolePermissionsService.getPermissionsByRole(
        roleId,
      );

    // ==========================================
    // EXTRACT PERMISSION NAMES
    // ==========================================

    const userPermissions =
      rolePermissions
        .map((rolePermission: any) => {
          // Normal populated permission
          if (
            rolePermission.permission &&
            typeof rolePermission.permission === "object"
          ) {
            return rolePermission.permission.name;
          }

          return null;
        })
        .filter(Boolean);

    // ==========================================
    // CHECK REQUIRED PERMISSION
    // ==========================================

    const hasPermission =
      requiredPermissions.some(
        (permission) =>
          userPermissions.includes(permission),
      );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing permission: ${requiredPermissions.join(", ")}`,
      );
    }

    return true;
  }
}