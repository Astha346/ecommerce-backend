import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  Settings,
  SettingsDocument,
} from "./schemas/settings.schema";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  async getSettings() {
    let settings = await this.settingsModel.findOne();

    if (!settings) {
      settings = await this.settingsModel.create({});
    }

    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    return this.settingsModel.findOneAndUpdate(
      {},
      { $set: updateSettingsDto },
      {
        new: true,
        upsert: true,
      },
    );
  }
}