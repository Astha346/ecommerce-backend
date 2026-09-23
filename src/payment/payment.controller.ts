import {
  Body,
  Controller,
  Post,
} from "@nestjs/common";

import { PaymentService } from "./payment.service";

@Controller("payment")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post("esewa")
  async createEsewaPayment(
    @Body()
    body: {
      amount: number;
      transactionUuid: string;
    },
  ) {
    return this.paymentService.createEsewaPayment(
      body.amount,
      body.transactionUuid,
    );
  }
}