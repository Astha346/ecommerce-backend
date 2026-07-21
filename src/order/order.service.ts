import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./order.schema";
import { Cart } from "../cart/cart.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
  ) {}

  // manual order create
  create(data: any) {
    return this.orderModel.create(data);
  }

  // get orders by user
  findAll(userId: string) {
    return this.orderModel.find({ userId });
  }

  // ✅ CREATE ORDER FROM CART (MAIN LOGIC)
  async createFromCart(userId: string) {
    const cartItems = await this.cartModel.find({ userId });

    if (!cartItems.length) {
      return { message: "Cart is empty" };
    }

    const total = cartItems.reduce(
      (sum, item: any) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.orderModel.create({
      userId,
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      total,
      status: "pending",
    });

    return order;
  }
     async updateStatus(
    id: string,
    status: string,
  ) {
    return this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
  }
}