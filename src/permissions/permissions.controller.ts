import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from "@nestjs/common";

import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.permissionsService.create(body);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.permissionsService.update(id, body);
  }
}