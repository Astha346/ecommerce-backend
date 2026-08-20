import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { CategoryService } from "./category.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";

@Controller("categories")
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("categories.create")
  create(@Body() body: any) {
    return this.categoryService.create(body);
  }

  // ==========================================
  // GET ALL CATEGORIES
  // ==========================================

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("categories.view")
  findAll() {
    return this.categoryService.findAll();
  }

  // ==========================================
  // GET SINGLE CATEGORY
  // ==========================================

  @Get(":id")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("categories.view")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOne(id);
  }

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  @Patch(":id")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("categories.update")
  update(
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.categoryService.update(
      id,
      body,
    );
  }

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  @Delete(":id")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("categories.delete")
  remove(@Param("id") id: string) {
    return this.categoryService.remove(id);
  }
}