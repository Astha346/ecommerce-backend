import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";

/* =========================================================
   ORDER ITEM
========================================================= */

@Schema()
export class OrderItem {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: "" })
  image!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;
}

export const OrderItemSchema =
  SchemaFactory.createForClass(OrderItem);

/* =========================================================
   ORDER
========================================================= */

@Schema({ timestamps: true })
export class Order {
  /* =======================================================
     CUSTOMER
  ======================================================= */

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  customerName!: string;

  /* =======================================================
     ITEMS
  ======================================================= */

  @Prop({
    type: [OrderItemSchema],
    default: [],
  })
  @Type(() => OrderItem)
  items!: OrderItem[];

  /* =======================================================
     TOTAL
  ======================================================= */

  @Prop({
    required: true,
    default: 0,
  })
  total!: number;

  /* =======================================================
     ORDER STATUS
  ======================================================= */

  @Prop({
    required: true,
    default: "pending",
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
  })
  status!: string;

  /* =======================================================
     RETURN / REFUND STATUS
  ======================================================= */

  @Prop({
    default: "none",
    enum: [
      "none",
      "requested",
      "approved",
      "rejected",
      "refunded",
    ],
  })
  returnRefundStatus!: string;

  /* =======================================================
     SELECTED RETURN / REFUND ITEM IDS
  ======================================================= */

  @Prop({
    type: [String],
    default: [],
  })
  returnItemIds!: string[];

  /* =======================================================
     RETURN / REFUND REASON
  ======================================================= */

  @Prop({
    default: "",
  })
  returnReason!: string;

  /* =======================================================
     CUSTOMER NOTE
  ======================================================= */

  @Prop({
    default: "",
  })
  customerNote!: string;

  /* =======================================================
     REFUND METHOD
  ======================================================= */

  @Prop({
    default: "",
    enum: [
      "",
      "original",
      "esewa",
      "khalti",
      "bank",
      "cash",
    ],
  })
  refundMethod!: string;

  /* =======================================================
     REFUND AMOUNT
  ======================================================= */

  @Prop({
    default: 0,
    min: 0,
  })
  refundAmount!: number;

  /* =======================================================
     ADMIN REVIEW NOTE
  ======================================================= */

  @Prop({
    default: "",
  })
  refundReviewNote!: string;

  /* =======================================================
     RETURN / REFUND REQUEST DATE
  ======================================================= */

  @Prop()
  returnRequestedAt?: Date;

  /* =======================================================
     RETURN / REFUND REVIEW DATE
  ======================================================= */

  @Prop()
  returnReviewedAt?: Date;

  /* =======================================================
     REFUND COMPLETED DATE
  ======================================================= */

  @Prop()
  refundedAt?: Date;
}

/* =========================================================
   SCHEMA
========================================================= */

export const OrderSchema =
  SchemaFactory.createForClass(Order);