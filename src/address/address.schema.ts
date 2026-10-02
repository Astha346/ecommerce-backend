import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  label!: string;

  @Prop({
    required: true,
    trim: true,
  })
  address!: string;

  @Prop({
    required: true,
  })
  latitude!: number;

  @Prop({
    required: true,
  })
  longitude!: number;

  @Prop({
    trim: true,
  })
  phone?: string;

  @Prop({
    default: false,
  })
  isDefault!: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);