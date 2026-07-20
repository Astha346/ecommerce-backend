import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";

@Schema()
export class OrderItem {
  
  @Prop()
  productId!: number;

  @Prop()
  name!: string;

  @Prop()
  price!: number;

  @Prop()
  image!: string;

  @Prop()
  quantity!: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop()
  userId!: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  @Type(() => OrderItem)
  items!: OrderItem[];

  @Prop({ default: 0 })
  total!: number;

  @Prop({ default: "pending" })
  status!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);