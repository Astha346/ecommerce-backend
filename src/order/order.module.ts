import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Order, OrderSchema } from "./order.schema";
import { Cart, CartSchema } from "../cart/cart.schema";

import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema }, // ✅ ADD THIS
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}