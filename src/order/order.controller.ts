import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  BadRequestException,
} from "@nestjs/common";

import { OrderService } from "./order.service";

@Controller("orders")
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  // =========================================================
  // RETURN / REFUND REQUESTS
  // =========================================================

  @Get("return-refund")
  getReturnRefundRequests() {
    return this.orderService.getReturnRefundRequests();
  }

  // =========================================================
  // CREATE RETURN / REFUND REQUEST
  // =========================================================

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

  // =========================================================
  // REVIEW RETURN / REFUND
  // =========================================================

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

  // =========================================================
  // CREATE ORDER
  // =========================================================

  @Post("create")
  createOrder(
    @Body() body: any,
  ) {
    return this.orderService.create(
      body,
    );
  }

  // =========================================================
  // CREATE ORDER FROM CART
  //
  // POST:
  // /orders/create-from-cart/:userId
  // =========================================================

  @Post("create-from-cart/:userId")
  createFromCart(
    @Param("userId") userId: string,

    @Body()
    body: {
      deliveryAddress: string;

      latitude?: number;

      longitude?: number;

      paymentMethod?:
        | "cod"
        | "esewa"
        | "khalti";
    },
  ) {
    return this.orderService.createFromCart(
      userId,
      body,
    );
  }

  // =========================================================
  // GET ALL ORDERS
  //
  // GET:
  // /orders?page=1&limit=5&search=&status=
  //
  // Payment filters:
  // /orders?paymentMethod=esewa
  // /orders?paymentStatus=paid
  // =========================================================

  @Get()
  getAllOrders(
    @Query("page") page?: string,

    @Query("limit") limit?: string,

    @Query("search") search?: string,

    @Query("status") status?: string,

    @Query("paymentMethod") paymentMethod?: string,

    @Query("paymentStatus") paymentStatus?: string,
  ) {
    return this.orderService.getAllOrders(
      Number(page) || 1,
      Number(limit) || 5,
      search || "",
      status || "",
      paymentMethod || "",
      paymentStatus || "",
    );
  }

  // =========================================================
  // GET ORDERS BY USER
  //
  // GET:
  // /orders/:userId
  // =========================================================

  @Get(":userId")
  findAll(
    @Param("userId") userId: string,
  ) {
    return this.orderService.findAll(
      userId,
    );
  }

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

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

  // =========================================================
  // UPDATE PAYMENT
  //
  // PATCH:
  // /orders/:id/payment
  // =========================================================

  @Patch(":id/payment")
  updatePayment(
    @Param("id") id: string,

    @Body()
    body: {
      paymentMethod?:
        | "cod"
        | "esewa"
        | "khalti";

      paymentStatus?:
        | "paid"
        | "pending"
        | "failed";
    },
  ) {
    if (
      body.paymentMethod ===
        undefined &&
      body.paymentStatus ===
        undefined
    ) {
      throw new BadRequestException(
        "Payment method or payment status is required",
      );
    }

    return this.orderService.updatePayment(
      id,
      body,
    );
  }

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  @Patch(":id/cancel")
  cancelOrder(
    @Param("id") id: string,
  ) {
    return this.orderService.cancelOrder(
      id,
    );
  }

  // =========================================================
  // DELETE ORDER
  // =========================================================

  @Delete(":id")
  deleteOrder(
    @Param("id") id: string,
  ) {
    return this.orderService.deleteOrder(
      id,
    );
  }
}