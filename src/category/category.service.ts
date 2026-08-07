import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Category, CategoryDocument } from "./category.schema";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(category: Partial<Category>) {
    return this.categoryModel.create(category);
  }

  async findAll() {
    return this.categoryModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    return this.categoryModel.findById(id);
  }

  async update(id: string, category: Partial<Category>) {
    return this.categoryModel.findByIdAndUpdate(id, category, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.categoryModel.findByIdAndDelete(id);
  }
}