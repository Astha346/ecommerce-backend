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
// PHONE
// =====================================================

@Prop({
  default: "",
})
phone!: string;

// =====================================================
// PROFILE IMAGE
// =====================================================

@Prop({
  default: "",
})
profileImage!: string;

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

    // =====================================================
  // TWO-FACTOR AUTHENTICATION (OTP)
  // =====================================================

  @Prop({
    type: String,
    default: null,
  })
  twoFactorOtpHash?: string | null;

  @Prop({
    type: Date,
    default: null,
  })
  twoFactorOtpExpires?: Date | null;

  @Prop({
    type: String,
    default: null,
  })
  twoFactorChallengeId?: string | null;

  @Prop({
    type: Number,
    default: 0,
  })
  twoFactorOtpAttempts?: number;
  
}

export const UserSchema =
  SchemaFactory.createForClass(User);