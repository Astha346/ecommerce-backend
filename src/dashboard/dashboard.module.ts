 import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

import { User, UserSchema } from "../users/user.schema";
import { Product, ProductSchema } from "../products/product.schema";
import { Order, OrderSchema } from "../order/order.schema";

 @Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}