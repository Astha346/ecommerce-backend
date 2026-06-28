import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  email!: string;

  @Prop()
  password!: string;

  @Prop()
  username!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);