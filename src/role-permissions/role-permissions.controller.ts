import {
  Controller,
  Post,
  Body,
  Get,
  Param,
} from "@nestjs/common";

import { RolePermissionsService } from "./role-permissions.service";

@Controller("role-permissions")
export class RolePermissionsController {

  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.rolePermissionsService.create(body);
  }

  @Get(":roleId")
  getPermissionsByRole(
    @Param("roleId") roleId: string,
  ) {
    return this.rolePermissionsService.getPermissionsByRole(roleId);
  }
}