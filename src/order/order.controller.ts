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

  /* =========================================================
     RETURN / REFUND REQUESTS
  ========================================================= */

  @Get("return-refund")
  getReturnRefundRequests() {
    return this.orderService.getReturnRefundRequests();
  }

  /* =========================================================
     CREATE RETURN / REFUND REQUEST
     
     POST:
     /orders/:id/return-refund
  ========================================================= */

  @Post(":id/return-refund")
  requestReturnRefund(
    @Param("id") id: string,

    @Body()
    body: {
      itemIds: string[];
      customerNote?: string;
      reason?: string;
      refundMethod?: string;
      refundAmount?: number;
    },
  ) {
    return this.orderService.requestReturnRefund(
      id,
      body,
    );
  }

  /* =========================================================
     REVIEW RETURN / REFUND

     PATCH:
     /orders/:id/return-refund
  ========================================================= */

  @Patch(":id/return-refund")
  reviewReturnRefund(
    @Param("id") id: string,

    @Body()
    body: {
      status:
        | "approved"
        | "rejected"
        | "refunded";

      reviewNote?: string;

      refundAmount?: number;
    },
  ) {
    return this.orderService.reviewReturnRefund(
      id,
      body,
    );
  }

  /* =========================================================
     CREATE ORDER

     POST:
     /orders/create
  ========================================================= */

  @Post("create")
  createOrder(
    @Body() body: any,
  ) {
    return this.orderService.create(
      body,
    );
  }

  /* =========================================================
     CREATE ORDER FROM CART

     POST:
     /orders/create-from-cart/:userId
  ========================================================= */

  @Post("create-from-cart/:userId")
  createFromCart(
    @Param("userId") userId: string,
  ) {
    return this.orderService.createFromCart(
      userId,
    );
  }

  /* =========================================================
     GET ALL ORDERS

     GET:
     /orders?page=1&limit=5&search=&status=
  ========================================================= */

  @Get()
  getAllOrders(
    @Query("page") page?: string,

    @Query("limit") limit?: string,

    @Query("search") search?: string,

    @Query("status") status?: string,
  ) {
    return this.orderService.getAllOrders(
      Number(page) || 1,
      Number(limit) || 5,
      search || "",
      status || "",
    );
  }

  /* =========================================================
     GET ORDERS BY USER

     GET:
     /orders/:userId
  ========================================================= */

  @Get(":userId")
  findAll(
    @Param("userId") userId: string,
  ) {
    return this.orderService.findAll(
      userId,
    );
  }

  /* =========================================================
     UPDATE ORDER STATUS

     PATCH:
     /orders/:id/status
  ========================================================= */

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,

    @Body()
    body: {
      status: string;
    },
  ) {
    return this.orderService.updateStatus(
      id,
      body.status,
    );
  }

  /* =========================================================
     CANCEL ORDER

     PATCH:
     /orders/:id/cancel
  ========================================================= */

  @Patch(":id/cancel")
  cancelOrder(
    @Param("id") id: string,
  ) {
    return this.orderService.cancelOrder(
      id,
    );
  }

  /* =========================================================
     DELETE ORDER

     DELETE:
     /orders/:id
  ========================================================= */

  @Delete(":id")
  deleteOrder(
    @Param("id") id: string,
  ) {
    return this.orderService.deleteOrder(
      id,
    );
  }
}