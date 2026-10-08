import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true })
export class Settings {
  // =========================
  // GENERAL SETTINGS
  // =========================

  @Prop({ required: true, default: "ShopEase" })
  storeName!: string;

  @Prop({ default: "" })
  storeEmail!: string;

  @Prop({ default: "" })
  storePhone!: string;

  @Prop({ default: "" })
  storeAddress!: string;

  @Prop({ default: "English" })
  language!: string;

  @Prop({ default: "Asia/Kathmandu" })
  timeZone!: string;

  // =========================
  // NOTIFICATION SETTINGS
  // =========================

  @Prop({ default: true })
  emailNotifications!: boolean;

  @Prop({ default: true })
  newOrderNotifications!: boolean;

  @Prop({ default: true })
  lowStockNotifications!: boolean;

  // =========================
  // SYSTEM SETTINGS
  // =========================

  @Prop({ default: false })
  maintenanceMode!: boolean;

  @Prop({ default: true })
  storeOpen!: boolean;

  @Prop({ default: "NPR" })
  currency!: string;

  @Prop({ default: "" })
  storeStartDate!: string;

  // =========================
  // DELIVERY SETTINGS
  // =========================

  @Prop({ default: 0 })
  deliveryCharge!: number;

  @Prop({ default: 0 })
  freeDeliveryAbove!: number;

  // =========================
  // PAYMENT SETTINGS
  // =========================

  @Prop({ default: true })
  codEnabled!: boolean;

  @Prop({ default: true })
  esewaEnabled!: boolean;

  @Prop({ default: true })
  khaltiEnabled!: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);