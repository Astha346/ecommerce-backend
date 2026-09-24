import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import {
  Category,
  CategorySchema,
} from "./category.schema";

import { Product, ProductSchema } from "../products/product.schema";

import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";

import { RolePermissionsModule } from "../role-permissions/role-permissions.module";
import { PermissionsModule } from "../permissions/permissions.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),

    RolePermissionsModule,
    PermissionsModule,
  ],

  controllers: [
    CategoryController,
  ],

  providers: [
    CategoryService,
  ],
})
export class CategoryModule {}