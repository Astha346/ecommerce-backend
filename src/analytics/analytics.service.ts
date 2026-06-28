import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Analytics } from "./schema/analytics.schema";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name)
    private analyticsModel: Model<Analytics>
  ) {}

  async trackClick(productId: number) {
    return this.analyticsModel.findOneAndUpdate(
      { productId },
      { $inc: { clicks: 1 } },
      { upsert: true, new: true }
    );
  }

  async getTopProducts() {
    return this.analyticsModel.find().sort({ clicks: -1 }).limit(5);
  }
}