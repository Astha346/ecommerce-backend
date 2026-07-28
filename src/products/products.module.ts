import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Product, ProductSchema } from "./product.schema";

import { AuthModule } from "../auth/auth.module";
import { RolePermissionsModule } from "../role-permissions/role-permissions.module";
import { PermissionsGuard } from "../auth/guards/permissions.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
    AuthModule,
    RolePermissionsModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    PermissionsGuard,
  ],
})
export class ProductsModule {}