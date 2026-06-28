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

  // Create product
  create(product: any) {
    return this.productModel.create(product);
  }

  // Get all products
  findAll() {
    return this.productModel.find();
  }

  // Get single product (IMPORTANT FOR CHECKOUT)
  findOne(id: string) {
    return this.productModel.findById(id);
  }

  // Optional: delete product
  delete(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }

  // Optional: update product
  update(id: string, data: any) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Search / Suggestions (Autocomplete)
  getSuggestions(q: string) {
    if (!q) {
      return [];
    }

    return this.productModel.find({
      name: { $regex: q, $options: "i" }
    }).limit(5);
  }
}