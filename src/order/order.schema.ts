import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";

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


@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  customerName!: string;

  @Prop({
    type: [OrderItemSchema],
    default: [],
  })
  @Type(() => OrderItem)
  items!: OrderItem[];

  @Prop({
    required: true,
    default: 0,
  })
  total!: number;

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
}

export const OrderSchema =
  SchemaFactory.createForClass(Order);