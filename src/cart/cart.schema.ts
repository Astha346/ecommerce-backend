import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  productId!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  image!: string;

  @Prop({ default: 1 })
  quantity!: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);