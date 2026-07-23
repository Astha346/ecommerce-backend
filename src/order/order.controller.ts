import { Controller, Post, Body, Get, Param, Patch, Delete, } from "@nestjs/common";
import { OrderService } from "./order.service";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Patch(":id/status")
updateStatus(
  @Param("id") id: string,
  @Body("status") status: string,
) {
  return this.orderService.updateStatus(
    id,
    status,
  );
  
}
 @Delete(":id")
deleteOrder(@Param("id") id: string) {
  return this.orderService.deleteOrder(id);
}

  // create order direct
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

  @Get()
  getallOrders(){
    return this.orderService.getAllOrders();
  }
}