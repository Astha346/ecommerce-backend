import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  price!: string;

  @Prop()
  image?: string;

  @Prop()
  description?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);