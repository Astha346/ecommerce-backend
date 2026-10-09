import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import {
  User,
  UserSchema,
} from "../users/user.schema";

import {
  Order,
  OrderSchema,
} from "./order.schema";

import {
  Cart,
  CartSchema,
} from "../cart/cart.schema";

import {
  OrderController,
} from "./order.controller";

import {
  OrderService,
} from "./order.service";

import {
  NotificationModule,
} from "../notifications/notification.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),

    NotificationModule,
  ],

  controllers: [
    OrderController,
  ],

  providers: [
    OrderService,
  ],
})
export class OrderModule {}