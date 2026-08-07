import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    default: "",
  })
  description!: string;

  @Prop({
    default: "",
  })
  image!: string;

  @Prop({
    default: null,
  })
  parentId?: string ;

  @Prop({
    default: 0,
  })
  productCount!: number;

  @Prop({
    enum: ["active", "inactive"],
    default: "active",
  })
  status!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);