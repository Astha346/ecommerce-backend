import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class UpdateSettingsDto {
  // =========================
  // GENERAL SETTINGS
  // =========================

  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsEmail()
  storeEmail?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  storeAddress?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  // =========================
  // NOTIFICATION SETTINGS
  // =========================

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  newOrderNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  lowStockNotifications?: boolean;

  // =========================
  // SYSTEM SETTINGS
  // =========================

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean()
  storeOpen?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  storeStartDate?: string;

  // =========================
  // DELIVERY SETTINGS
  // =========================

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryCharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryAbove?: number;

  // =========================
  // PAYMENT SETTINGS
  // =========================

  @IsOptional()
  @IsBoolean()
  codEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  esewaEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  khaltiEnabled?: boolean;
}