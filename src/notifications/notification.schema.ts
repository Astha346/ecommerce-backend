import {
  Prop,
  Schema,
  SchemaFactory,
} from "@nestjs/mongoose";

import {
  Document,
  Types,
} from "mongoose";

export type NotificationDocument =
  Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({
    required: true,
    enum: [
      "order",
      "stock",
      "payment",
      "return",
      "system",
    ],
  })
  type!: string;

  @Prop({ default: false })
  read!: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: "Order",
    default: null,
  })
  orderId?: Types.ObjectId | null;
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);