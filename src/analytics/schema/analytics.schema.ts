import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AnalyticsDocument = Analytics & Document;

@Schema()
export class Analytics {
  @Prop({ required: true })
  productId!: string;

  @Prop({ default: 0 })
  clicks!: number;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);