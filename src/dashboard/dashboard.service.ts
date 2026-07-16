import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User } from "../users/user.schema";
import { Product } from "../products/product.schema";
import { Order } from "../order/order.schema";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(Product.name)
    private productModel: Model<Product>,

    @InjectModel(Order.name)
    private orderModel: Model<Order>,
  ) {}

  async getStats() {
    const totalOrders =
      await this.orderModel.countDocuments();

    const totalProducts =
      await this.productModel.countDocuments();

    const totalCustomers =
      await this.userModel.countDocuments({
        role: "customer",
      });

    return {
      totalSales: totalOrders,
     revenue: 0,
     totalOrders,
     totalCustomers,
     totalProducts,
     pendingOrders: 0,
     lowStockProducts: 0,
    };
  }
}