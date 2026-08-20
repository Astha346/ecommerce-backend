import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";

import { ProductsService } from "./products.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";

@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // ==========================================
  // GET ALL PRODUCTS
  // ==========================================

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.view")
  findAll() {
    return this.productsService.findAll();
  }

  // ==========================================
  // GET PRODUCTS BY CATEGORY
  // ==========================================

  @Get("by-category")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.view")
  getProductsByCategory() {
    return this.productsService.getProductsByCategory();
  }

  // ==========================================
  // SEARCH SUGGESTIONS
  // ==========================================

  @Get("suggestions")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.view")
  getSuggestions(
    @Query("q") q: string,
  ) {
    return this.productsService.getSuggestions(q);
  }

  // ==========================================
  // GET SINGLE PRODUCT
  // ==========================================

  @Get(":id")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.view")
  findOne(
    @Param("id") id: string,
  ) {
    return this.productsService.findOne(id);
  }

  // ==========================================
  // CREATE PRODUCT
  // ==========================================

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.create")
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  @Patch(":id")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.update")
  update(
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.productsService.update(
      id,
      body,
    );
  }

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  @Delete(":id")
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
  )
  @Permissions("products.delete")
  delete(
    @Param("id") id: string,
  ) {
    return this.productsService.delete(id);
  }
}