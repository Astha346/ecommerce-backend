import {
  Prop,
  Schema,
  SchemaFactory,
} from "@nestjs/mongoose";

import {
  Document,
  Types,
} from "mongoose";

export type UserDocument =
  User & Document;

@Schema()
export class User {
  // =====================================================
  // USERNAME
  // =====================================================

  @Prop({
    required: true,
  })
  username!: string;

  // =====================================================
  // EMAIL
  // =====================================================

  @Prop({
    required: true,
    unique: true,
  })
  email!: string;

  // =====================================================
  // PASSWORD
  // =====================================================

  @Prop({
    required: true,
  })
  password!: string;

  // =====================================================
  // ROLE
  // =====================================================

  @Prop({
    type: Types.ObjectId,
    ref: "Role",
    required: true,
  })
  role!: Types.ObjectId;

  // =====================================================
  // REFRESH TOKEN
  // =====================================================

  @Prop({
    type: String,
    default: null,
  })
  refreshToken?: string | null;

  // =====================================================
  // REFRESH TOKEN EXPIRY
  // =====================================================

  @Prop({
    type: Date,
    default: null,
  })
  refreshTokenExpires?: Date | null;

  // =====================================================
  // FORGOT PASSWORD TOKEN
  // =====================================================

  @Prop({
    type: String,
    default: null,
  })
  resetPasswordToken?: string | null;

  // =====================================================
  // FORGOT PASSWORD TOKEN EXPIRY
  // =====================================================

  @Prop({
    type: Date,
    default: null,
  })
  resetPasswordExpires?: Date | null;
}

export const UserSchema =
  SchemaFactory.createForClass(User);