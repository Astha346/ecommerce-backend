import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import {
  Category,
  CategorySchema,
} from "./category.schema";

import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";

import {
  RolePermissionsModule,
} from "../role-permissions/role-permissions.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),

    RolePermissionsModule,
  ],

  controllers: [
    CategoryController,
  ],

  providers: [
    CategoryService,
  ],
})
export class CategoryModule {}