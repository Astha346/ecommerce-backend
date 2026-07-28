import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";

import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("products.view")

  // GET ALL PRODUCTS
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // GET SINGLE PRODUCT
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  // CREATE PRODUCT
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  // DELETE PRODUCT
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.productsService.delete(id);
  }

  // UPDATE PRODUCT
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  // 🔍 SEARCH SUGGESTIONS (IMPORTANT FOR YOUR AUTOCOMPLETE)
  @Get("suggestions")
  getSuggestions(@Query("q") q: string) {
    return this.productsService.getSuggestions(q);
  }
}