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

  // Dashboard overview cards
  async getStats() {
    const totalOrders =
      await this.orderModel.countDocuments();

    const totalProducts =
      await this.productModel.countDocuments();

    const totalCustomers =
      await this.userModel.countDocuments({
        role: "customer",
      });

    const pendingOrders =
      await this.orderModel.countDocuments({
        status: "pending",
      });

    const revenueResult =
      await this.orderModel.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$total",
            },
          },
        },
      ]);

    const revenue =
      revenueResult[0]?.totalRevenue || 0;

    return {
      totalSales: totalOrders,
      revenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts: 0,
    };
  }


  // Total orders each month
  async getSalesByMonth() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          sales: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);
  }


  // Revenue each month
  async getRevenueByMonth() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          revenue: {
            $sum: "$total",
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);
  }


  // Order status count
  async getOrdersByStatus() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);
  }


  // Customer growth monthly
  async getCustomerGrowth() {
    return this.userModel.aggregate([
      {
        $match: {
          role: "customer",
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          customers: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);
  }


  // Sales by product category
async getCategorySales() {
  return this.orderModel.aggregate([
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.name",
        sales: {
          $sum: "$items.quantity",
        },
      },
    },
    {
      $sort: {
        sales: -1,
      },
    },
  ]);
}
}