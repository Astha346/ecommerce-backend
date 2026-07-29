import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { RolePermissionsService } from "../../role-permissions/role-permissions.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolePermissionsService: RolePermissionsService,
  ) {}

  async canActivate(
  context: ExecutionContext,
): Promise<boolean> {

  const requiredPermissions =
    this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const request = context.switchToHttp().getRequest();
  const user = request.user;

  console.log("JWT USER =", user);

  if (!user) {
    return false;
  }

  console.log("ROLE ID =", user.roleId);

  const rolePermissions =
    await this.rolePermissionsService.getPermissionsByRole(
      user.roleId,
    );

  console.log("ROLE PERMISSIONS =", rolePermissions);

  const userPermissions = rolePermissions.map(
    (rp: any) => rp.permission.name,
  );

  console.log("USER PERMISSIONS =", userPermissions);
  console.log("REQUIRED PERMISSIONS =", requiredPermissions);

  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}}