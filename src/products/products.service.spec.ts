import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product, ProductDocument } from "./product.schema";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>
  ) {}

  create(product: any) {
    return this.productModel.create(product);
  }

  findAll() {
    return this.productModel.find();
  }

  findOne(id: string) {
    return this.productModel.findById(id);
  }

  delete(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }

  update(id: string, data: any) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true });
  }

  // 🔍 AUTOCOMPLETE (FIX)
  async getSuggestions(query: string) {
    if (!query) return [];

    const products = await this.productModel
      .find({
        name: { $regex: query, $options: "i" },
      })
      .limit(5)
      .select("name");

    return products.map((p) => p.name);
  }
}