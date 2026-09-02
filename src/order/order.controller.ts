import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from "@nestjs/common";

import { OrderService } from "./order.service";

@Controller("orders")
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

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

  // ==========================================
  // DELETE ORDER
  // ==========================================

  @Delete(":id")
  deleteOrder(@Param("id") id: string) {
    return this.orderService.deleteOrder(id);
  }

  // ==========================================
  // CREATE ORDER
  // ==========================================

  @Post("create")
  create(@Body() body: any) {
    return this.orderService.create(body);
  }

  // ==========================================
  // CREATE ORDER FROM CART
  // ==========================================

  @Post("create-from-cart")
  createFromCart(
    @Body() body: { userId: string },
  ) {
    return this.orderService.createFromCart(
      body.userId,
    );
  }

  // ==========================================
  // GET ALL ORDERS
  // PAGINATION + SEARCH + STATUS
  // ==========================================

  @Get()
  getAllOrders(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
  ) {
    return this.orderService.getAllOrders(
      Number(page) || 1,
      Number(limit) || 10,
      search || "",
      status || "",
    );
  }

  // ==========================================
  // GET ORDERS BY USER
  // ==========================================

  @Get(":userId")
  findAll(
    @Param("userId") userId: string,
  ) {
    return this.orderService.findAll(userId);
  }
}