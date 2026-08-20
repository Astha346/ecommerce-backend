import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
} from "@nestjs/common";

import {
  RolePermissionsService,
} from "./role-permissions.service";

@Controller("role-permissions")
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  // Create permission
  @Post()
  create(@Body() body: any) {
    return this.rolePermissionsService.create(
      body,
    );
  }

  // Get permissions for role
  @Get(":roleId")
  getPermissionsByRole(
    @Param("roleId") roleId: string,
  ) {
    return this.rolePermissionsService.getPermissionsByRole(
      roleId,
    );
  }

  // Delete all permissions for role
  @Delete(":roleId")
  deleteByRole(
    @Param("roleId") roleId: string,
  ) {
    return this.rolePermissionsService.deleteByRole(
      roleId,
    );
  }
}