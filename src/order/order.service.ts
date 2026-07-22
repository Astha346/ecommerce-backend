import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Order } from "./order.schema";
import { Cart } from "../cart/cart.schema";
import { User } from "../users/user.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,

    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,

    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  // Manual order create
  create(data: any) {
    return this.orderModel.create(data);
  }

  // Get orders by user
  findAll(userId: string) {
    return this.orderModel.find({ userId });
  }

  // Create order from cart
  async createFromCart(userId: string) {
    console.log("userId =", userId);

    const user =
      await this.userModel.findById(userId);

    console.log("user =", user);

    if (!user) {
      throw new NotFoundException(
        "User not found",
      );
    }

    const cartItems =
      await this.cartModel.find({
        userId,
      });

    console.log(
      "cartItems =",
      cartItems,
    );

    if (!cartItems.length) {
      return {
        message: "Cart is empty",
      };
    }

    const total = cartItems.reduce(
      (sum, item: any) =>
        sum +
        item.price * item.quantity,
      0,
    );

    const order =
  await this.orderModel.create({
    userId,
    customerName: user.username,
    items: cartItems.map(
      (item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }),
    ),
    total,
    status: "pending",
  });
    return order;
  }

  async getAllOrders() {
    return this.orderModel
      .find()
      .sort({
        createdAt: -1,
      });
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