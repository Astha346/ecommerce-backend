import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { OrderService } from "./order.service";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // create order directly (optional use)
  @Post("create")
  create(@Body() body: any) {
    return this.orderService.create(body);
  }

  // ✅ MAIN FIX: create order from cart
  @Post("create-from-cart")
  createFromCart(@Body() body: { userId: string }) {
    return this.orderService.createFromCart(body.userId);
  }

  // get orders by user
  @Get(":userId")
  findAll(@Param("userId") userId: string) {
    return this.orderService.findAll(userId);
  }
}