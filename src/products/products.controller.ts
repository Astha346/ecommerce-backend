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

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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