import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";

import {
  Model,
  Types,
} from "mongoose";

import {
  Notification,
  NotificationDocument,
} from "./notification.schema";

import {
  User,
  UserDocument,
} from "../users/user.schema";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel:
      Model<NotificationDocument>,

    @InjectModel(User.name)
    private readonly userModel:
      Model<UserDocument>,
  ) {}

  async findByUser(userId: string) {
    return this.notificationModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async getUnreadCount(userId: string) {
    const count =
      await this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        read: false,
      });

    return { count };
  }

  async createOrderNotification(
    orderId: string,
    customerName: string,
    total: number,
  ) {
    const users =
      await this.userModel
        .find()
        .populate("role")
        .lean();

    const notificationUsers =
      users.filter((user: any) => {
        const role = user.role;

        const roleName =
          typeof role === "object" &&
          role !== null
            ? role.name
            : "";

        return [
          "admin",
          "manager",
          "staff",
        ].includes(
          roleName?.toLowerCase(),
        );
      });

    if (notificationUsers.length === 0) {
      return [];
    }

    const notifications =
      notificationUsers.map((user: any) => ({
        userId: user._id,

        title: "New Order Received",

        message:
          `${customerName} placed a new order worth NPR ${total}`,

        type: "order",

        read: false,

        orderId: new Types.ObjectId(orderId),
      }));

    return this.notificationModel.insertMany(
      notifications,
    );
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ) {
    return this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          read: true,
        },
      },
      {
        new: true,
      },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        read: false,
      },
      {
        $set: {
          read: true,
        },
      },
    );

    return {
      message: "All notifications marked as read",
    };
  }
}