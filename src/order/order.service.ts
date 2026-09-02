import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

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
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 });
  }

  // Create order from cart
  async createFromCart(userId: string) {
    console.log("userId =", userId);

    const user = await this.userModel.findById(userId);

    console.log("user =", user);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const cartItems = await this.cartModel.find({
      userId,
    });

    console.log("cartItems =", cartItems);

    if (!cartItems.length) {
      return {
        message: "Cart is empty",
      };
    }

    const total = cartItems.reduce(
      (sum, item: any) =>
        sum + item.price * item.quantity,
      0,
    );

    const order = await this.orderModel.create({
      userId,

      customerName: user.username,

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

  // ==========================================
  // GET ALL ORDERS WITH PAGINATION
  // SEARCH + STATUS FILTER
  // ==========================================

  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "",
  ) {
    // Make sure page and limit are valid
    page = Math.max(Number(page) || 1, 1);
    limit = Math.max(Number(limit) || 10, 1);

    // Prevent extremely large requests
    limit = Math.min(limit, 100);

    const skip = (page - 1) * limit;

    // Build MongoDB filter
    const filter: any = {};

    // Search by order number/customer name/user ID
    if (search) {
      filter.$or = [
        {
          customerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          userId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      filter.status = status.toLowerCase();
    }

    // Get orders
    const orders = await this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count matching orders
    const total = await this.orderModel.countDocuments(
      filter,
    );

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      orders,

      pagination: {
        page,
        limit,
        total,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  async updateStatus(
    id: string,
    status: string,
  ) {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    status = status.toLowerCase();

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }

    const order =
      await this.orderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    return order;
  }

  // ==========================================
  // DELETE ORDER
  // ==========================================

  async deleteOrder(id: string) {
    const order =
      await this.orderModel.findByIdAndDelete(id);

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    return {
      message: "Order deleted successfully",
    };
  }
}