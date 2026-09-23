
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Order } from "./order.schema";
import { Cart } from "../cart/cart.schema";
import { User } from "../users/user.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // =========================================================
  // CREATE ORDER
  // =========================================================

  async create(data: any) {
    return this.orderModel.create(data);
  }

  // =========================================================
  // GET ORDERS FOR USER
  // =========================================================

  async findAll(userId: string) {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 });
  }

  // =========================================================
  // CREATE ORDER FROM CART
  // =========================================================

  async createFromCart(
    userId: string,
    data?: {
      deliveryAddress?: string;
      latitude?: number;
      longitude?: number;
      paymentMethod?: "cod" | "esewa" | "khalti";
    },
  ) {
    // =======================================================
    // FIND USER
    // =======================================================

    const user =
      await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(
        "User not found",
      );
    }

    // =======================================================
    // GET CART
    // =======================================================

    const cartItems =
      await this.cartModel.find({
        userId,
      });

    if (!cartItems.length) {
      throw new BadRequestException(
        "Cart is empty",
      );
    }

    // =======================================================
    // DELIVERY ADDRESS
    // =======================================================

    const deliveryAddress =
      data?.deliveryAddress?.trim() || "";

    if (!deliveryAddress) {
      throw new BadRequestException(
        "Delivery address is required",
      );
    }

    // =======================================================
    // PAYMENT METHOD
    // =======================================================

    const allowedPaymentMethods = [
      "cod",
      "esewa",
      "khalti",
    ];

    const paymentMethod =
      data?.paymentMethod || "cod";

    if (
      !allowedPaymentMethods.includes(
        paymentMethod,
      )
    ) {
      throw new BadRequestException(
        "Invalid payment method",
      );
    }

    // =======================================================
    // LOCATION
    // =======================================================

    const latitude =
      data?.latitude !== undefined
        ? Number(data.latitude)
        : undefined;

    const longitude =
      data?.longitude !== undefined
        ? Number(data.longitude)
        : undefined;

    if (
      latitude !== undefined &&
      (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      )
    ) {
      throw new BadRequestException(
        "Invalid latitude",
      );
    }

    if (
      longitude !== undefined &&
      (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      )
    ) {
      throw new BadRequestException(
        "Invalid longitude",
      );
    }

    // =======================================================
    // CALCULATE TOTAL
    // =======================================================

    const total =
      cartItems.reduce(
        (
          sum: number,
          item: any,
        ) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0,
      );

    // =======================================================
    // PAYMENT STATUS
    // =======================================================

    const paymentStatus =
      "pending";

    // =======================================================
    // CREATE ORDER
    // =======================================================

    const order =
      await this.orderModel.create({
        // ===================================================
        // CUSTOMER
        // ===================================================

        userId,

        customerName:
          user.username,

        // ===================================================
        // DELIVERY
        // ===================================================

        deliveryAddress,

        latitude,

        longitude,

        // ===================================================
        // ITEMS
        // ===================================================

        items:
          cartItems.map(
            (item: any) => ({
              productId:
                item.productId,

              name:
                item.name,

              price:
                Number(item.price),

              image:
                item.image || "",

              quantity:
                Number(
                  item.quantity,
                ),
            }),
          ),

        // ===================================================
        // TOTAL
        // ===================================================

        total,

        // ===================================================
        // ORDER STATUS
        // ===================================================

        status:
          "pending",

        // ===================================================
        // PAYMENT
        // ===================================================

        paymentMethod,

        paymentStatus,

        // ===================================================
        // RETURN / REFUND
        // ===================================================

        returnRefundStatus:
          "none",

        returnItemIds: [],

        returnReason: "",

        customerNote: "",

        refundMethod: "",

        refundAmount: 0,

        refundReviewNote: "",
      });

    // =======================================================
    // RESPONSE
    // =======================================================

    return order;
  }

  // =========================================================
  // GET ALL ORDERS
  // PAGINATION + SEARCH + STATUS
  // CUSTOMER DETAILS
  // =========================================================

  async getAllOrders(
    page: number = 1,
    limit: number = 5,
    search: string = "",
    status: string = "",
  ) {
    page =
      Math.max(
        Number(page) || 1,
        1,
      );

    limit =
      Math.max(
        Number(limit) || 5,
        1,
      );

    limit =
      Math.min(
        limit,
        100,
      );

    const skip =
      (page - 1) * limit;

    const filter: any = {};

    // =======================================================
    // SEARCH
    // =======================================================

    const cleanSearch =
      search.trim();

    if (cleanSearch) {
      filter.$or = [
        {
          customerName: {
            $regex:
              cleanSearch,
            $options: "i",
          },
        },

        {
          userId: {
            $regex:
              cleanSearch,
            $options: "i",
          },
        },

        {
          orderNumber: {
            $regex:
              cleanSearch,
            $options: "i",
          },
        },
      ];
    }

    // =======================================================
    // STATUS FILTER
    // =======================================================

    const cleanStatus =
      status
        .toLowerCase()
        .trim();

    if (
      cleanStatus &&
      cleanStatus !== "all"
    ) {
      filter.status =
        cleanStatus;
    }

    // =======================================================
    // GET ORDERS + TOTAL
    // =======================================================

    const [
      orders,
      total,
    ] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.orderModel.countDocuments(
        filter,
      ),
    ]);

    // =======================================================
    // GET USER IDS
    // =======================================================

    const userIds = [
      ...new Set(
        orders
          .map(
            (order: any) =>
              order.userId?.toString(),
          )
          .filter(
            (id: any) =>
              id &&
              Types.ObjectId.isValid(
                id,
              ),
          ),
      ),
    ];

    // =======================================================
    // GET USERS
    // =======================================================

    let users: any[] = [];

    if (userIds.length > 0) {
      users =
        await this.userModel
          .find({
            _id: {
              $in: userIds,
            },
          })
          .select(
            "username email",
          )
          .lean();
    }

    // =======================================================
    // USER MAP
    // =======================================================

    const userMap =
      new Map<
        string,
        any
      >();

    users.forEach(
      (user: any) => {
        userMap.set(
          user._id.toString(),
          user,
        );
      },
    );

    // =======================================================
    // ADD CUSTOMER INFORMATION
    // =======================================================

    const ordersWithCustomer =
      orders.map(
        (order: any) => {
          const user =
            userMap.get(
              order.userId?.toString(),
            );

          return {
            ...order,

            customer: {
              name:
                user?.username ||
                order.customerName ||
                "Unknown Customer",

              email:
                user?.email ||
                "-",

              phone: "",
            },
          };
        },
      );

    // =======================================================
    // PAGINATION
    // =======================================================

    const totalPages =
      Math.ceil(
        total / limit,
      );

    const safeTotalPages =
      Math.max(
        totalPages,
        1,
      );

    // =======================================================
    // RESPONSE
    // =======================================================

    return {
      orders:
        ordersWithCustomer,

      pagination: {
        page,

        limit,

        total,

        totalPages:
          safeTotalPages,

        hasNextPage:
          page <
          safeTotalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

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

    status =
      status
        .toLowerCase()
        .trim();

    if (
      !allowedStatuses.includes(
        status,
      )
    ) {
      throw new BadRequestException(
        "Invalid order status",
      );
    }

    const order =
      await this.orderModel.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
        },
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    return order;
  }

  // =========================================================
  // UPDATE PAYMENT METHOD / PAYMENT STATUS
  // =========================================================

  async updatePayment(
    id: string,
    data: {
      paymentMethod?:
        | "cod"
        | "esewa"
        | "khalti";

      paymentStatus?:
        | "paid"
        | "pending"
        | "failed";
    },
  ) {
    const allowedPaymentMethods = [
      "cod",
      "esewa",
      "khalti",
    ];

    const allowedPaymentStatuses = [
      "paid",
      "pending",
      "failed",
    ];

    const updateData: {
      paymentMethod?:
        | "cod"
        | "esewa"
        | "khalti";

      paymentStatus?:
        | "paid"
        | "pending"
        | "failed";
    } = {};

    // =======================================================
    // PAYMENT METHOD
    // =======================================================

    if (
      data.paymentMethod !==
      undefined
    ) {
      if (
        !allowedPaymentMethods.includes(
          data.paymentMethod,
        )
      ) {
        throw new BadRequestException(
          "Invalid payment method",
        );
      }

      updateData.paymentMethod =
        data.paymentMethod;
    }

    // =======================================================
    // PAYMENT STATUS
    // =======================================================

    if (
      data.paymentStatus !==
      undefined
    ) {
      if (
        !allowedPaymentStatuses.includes(
          data.paymentStatus,
        )
      ) {
        throw new BadRequestException(
          "Invalid payment status",
        );
      }

      updateData.paymentStatus =
        data.paymentStatus;
    }

    // =======================================================
    // CHECK DATA
    // =======================================================

    if (
      Object.keys(
        updateData,
      ).length === 0
    ) {
      throw new BadRequestException(
        "Payment method or payment status is required",
      );
    }

    // =======================================================
    // UPDATE DATABASE
    // =======================================================

    const order =
      await this.orderModel.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    return {
      message:
        "Payment updated successfully",

      order,
    };
  }

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  async cancelOrder(
    id: string,
  ) {
    const order =
      await this.orderModel.findByIdAndUpdate(
        id,
        {
          status:
            "cancelled",
        },
        {
          new: true,
        },
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    return {
      message:
        "Order cancelled successfully",

      order,
    };
  }

  // =========================================================
  // REQUEST RETURN / REFUND
  // =========================================================

  async requestReturnRefund(
    id: string,
    data: {
      itemIds: string[];
      customerNote?: string;
      reason?: string;
      refundMethod?: string;
      refundAmount?: number;
    },
  ) {
    const order =
      await this.orderModel.findById(
        id,
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    if (
      order.status !==
      "delivered"
    ) {
      throw new BadRequestException(
        "Only delivered orders can be returned or refunded",
      );
    }

    if (
      order.returnRefundStatus ===
        "requested" ||
      order.returnRefundStatus ===
        "approved"
    ) {
      throw new BadRequestException(
        "A return/refund request already exists for this order",
      );
    }

    if (
      !Array.isArray(
        data.itemIds,
      ) ||
      data.itemIds.length ===
        0
    ) {
      throw new BadRequestException(
        "At least one item must be selected",
      );
    }

    const uniqueItemIds = [
      ...new Set(
        data.itemIds,
      ),
    ];

    const orderProductIds =
      order.items.map(
        (item) =>
          item.productId,
      );

    const invalidItemIds =
      uniqueItemIds.filter(
        (itemId) =>
          !orderProductIds.includes(
            itemId,
          ),
      );

    if (
      invalidItemIds.length >
      0
    ) {
      throw new BadRequestException(
        "One or more selected items do not belong to this order",
      );
    }

    const reason =
      data.reason
        ?.trim() || "";

    const customerNote =
      data.customerNote
        ?.trim() || "";

    if (
      !reason &&
      !customerNote
    ) {
      throw new BadRequestException(
        "Return/refund reason or customer note is required",
      );
    }

    const allowedRefundMethods = [
      "original",
      "esewa",
      "khalti",
      "bank",
      "cash",
    ];

    const refundMethod =
      data.refundMethod
        ?.toLowerCase()
        .trim() || "";

    if (
      refundMethod &&
      !allowedRefundMethods.includes(
        refundMethod,
      )
    ) {
      throw new BadRequestException(
        "Invalid refund method",
      );
    }

    const refundAmount =
      data.refundAmount !==
      undefined
        ? Number(
            data.refundAmount,
          )
        : Number(
            order.total,
          );

    if (
      Number.isNaN(
        refundAmount,
      ) ||
      refundAmount < 0 ||
      refundAmount >
        order.total
    ) {
      throw new BadRequestException(
        "Invalid refund amount",
      );
    }

    order.returnRefundStatus =
      "requested";

    order.returnItemIds =
      uniqueItemIds;

    order.returnReason =
      reason ||
      customerNote;

    order.customerNote =
      customerNote;

    order.refundMethod =
      refundMethod;

    order.refundAmount =
      refundAmount;

    order.refundReviewNote =
      "";

    order.returnRequestedAt =
      new Date();

    order.returnReviewedAt =
      undefined;

    order.refundedAt =
      undefined;

    await order.save();

    return {
      message:
        "Return/refund request submitted successfully",

      order,
    };
  }

  // =========================================================
  // REVIEW RETURN / REFUND
  // =========================================================

  async reviewReturnRefund(
    id: string,
    data: {
      status:
        | "approved"
        | "rejected"
        | "refunded";

      reviewNote?: string;

      refundAmount?: number;
    },
  ) {
    const order =
      await this.orderModel.findById(
        id,
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    const allowedStatuses = [
      "approved",
      "rejected",
      "refunded",
    ];

    if (
      !allowedStatuses.includes(
        data.status,
      )
    ) {
      throw new BadRequestException(
        "Invalid return/refund review status",
      );
    }

    if (
      order.returnRefundStatus ===
      "none"
    ) {
      throw new BadRequestException(
        "No return/refund request exists for this order",
      );
    }

    if (
      data.status ===
        "approved" &&
      order.returnRefundStatus !==
        "requested"
    ) {
      throw new BadRequestException(
        "Only requested return/refund can be approved",
      );
    }

    if (
      data.status ===
        "rejected" &&
      order.returnRefundStatus !==
        "requested"
    ) {
      throw new BadRequestException(
        "Only requested return/refund can be rejected",
      );
    }

    if (
      data.status ===
        "refunded" &&
      order.returnRefundStatus !==
        "approved"
    ) {
      throw new BadRequestException(
        "Return/refund must be approved before it can be refunded",
      );
    }

    if (
      data.refundAmount !==
      undefined
    ) {
      const amount =
        Number(
          data.refundAmount,
        );

      if (
        Number.isNaN(
          amount,
        ) ||
        amount < 0 ||
        amount >
          order.total
      ) {
        throw new BadRequestException(
          "Invalid refund amount",
        );
      }

      order.refundAmount =
        amount;
    }

    order.returnRefundStatus =
      data.status;

    order.refundReviewNote =
      data.reviewNote
        ?.trim() || "";

    order.returnReviewedAt =
      new Date();

    if (
      data.status ===
      "refunded"
    ) {
      order.refundedAt =
        new Date();
    }

    await order.save();

    return {
      message: `Return/refund ${data.status} successfully`,

      order,
    };
  }

  // =========================================================
  // GET RETURN / REFUND REQUESTS
  // =========================================================

  async getReturnRefundRequests() {
    return this.orderModel
      .find({
        returnRefundStatus: {
          $in: [
            "requested",
            "approved",
            "rejected",
            "refunded",
          ],
        },
      })
      .sort({
        returnRequestedAt:
          -1,
      });
  }

  // =========================================================
  // DELETE ORDER
  // =========================================================

  async deleteOrder(
    id: string,
  ) {
    const order =
      await this.orderModel.findByIdAndDelete(
        id,
      );

    if (!order) {
      throw new NotFoundException(
        "Order not found",
      );
    }

    return {
      message:
        "Order deleted successfully",
    };
  }
}


