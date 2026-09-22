import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
} from "@nestjs/common";

import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.rolesService.create(body);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Patch(":id/permissions")
  updatePermissions(
    @Param("id") id: string,
    @Body() body: { permissionIds: string[] },
  ) {
    return this.rolesService.updatePermissions(
      id,
      body.permissionIds,
    );
  }
}