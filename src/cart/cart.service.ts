import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart, CartDocument } from "./cart.schema";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>
  ) {}

  // ➕ ADD TO CART
  async addToCart(item: any) {
    const existing = await this.cartModel.findOne({
      userId: item.userId,
      productId: item.productId,
    });

    if (existing) {
      existing.quantity += 1;
      return existing.save();
    }

    const newItem = new this.cartModel(item);
    return newItem.save();
  }

  // 📥 GET CART
  async getCart(userId: string) {
    return this.cartModel.find({ userId });
  }

  // ❌ REMOVE SINGLE ITEM
  async removeFromCart(id: string) {
    return this.cartModel.findByIdAndDelete(id);
  }

  // 🧹 CLEAR CART
  async clearCart(userId: string) {
    return this.cartModel.deleteMany({ userId });
  }
}