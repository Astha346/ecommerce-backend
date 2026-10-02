import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  Address,
  AddressDocument,
} from "./address.schema";

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  async create(data: {
    userId: string;
    label: string;
    address: string;
    latitude: number;
    longitude: number;
    phone?: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await this.addressModel.updateMany(
        { userId: data.userId },
        { $set: { isDefault: false } },
      );
    }

    const newAddress = new this.addressModel(data);

    return newAddress.save();
  }

  async findByUser(userId: string) {
    return this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    return this.addressModel.findOne({
      _id: id,
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{
      label: string;
      address: string;
      latitude: number;
      longitude: number;
      phone: string;
      isDefault: boolean;
    }>,
  ) {
    if (data.isDefault) {
      await this.addressModel.updateMany(
        { userId },
        { $set: { isDefault: false } },
      );
    }

    return this.addressModel.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      data,
      {
        new: true,
      },
    );
  }

  async remove(id: string, userId: string) {
    return this.addressModel.findOneAndDelete({
      _id: id,
      userId,
    });
  }
}