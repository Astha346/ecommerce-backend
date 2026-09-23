import { Injectable, BadRequestException } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class PaymentService {
  // eSewa UAT/Test details
  private readonly productCode = "EPAYTEST";

  // This is the official eSewa UAT test secret.
  // Keep this ONLY in the backend.
  private readonly secretKey = "8gBm/:&EnhH.1/q";

  private readonly paymentUrl =
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  /**
   * Generate eSewa HMAC-SHA256 signature
   */
  private generateSignature(
    totalAmount: string,
    transactionUuid: string,
  ): string {
    const signedMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${this.productCode}`;

    return crypto
      .createHmac("sha256", this.secretKey)
      .update(signedMessage)
      .digest("base64");
  }

  /**
   * Create eSewa payment data
   */
  createEsewaPayment(amount: number, transactionUuid: string) {
    if (!amount || amount <= 0) {
      throw new BadRequestException("Invalid payment amount");
    }

    if (!transactionUuid) {
      throw new BadRequestException("Transaction UUID is required");
    }

    const totalAmount = Number(amount).toFixed(2);

    const signature = this.generateSignature(
      totalAmount,
      transactionUuid,
    );

    return {
      paymentUrl: this.paymentUrl,

      fields: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: this.productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",

        success_url:
          "http://localhost:3000/payment/esewa/success",

        failure_url:
          "http://localhost:3000/payment/esewa/failure",

        signed_field_names:
          "total_amount,transaction_uuid,product_code",

        signature,
      },
    };
  }
}