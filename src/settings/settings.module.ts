import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import {
  Settings,
  SettingsSchema,
} from "./schemas/settings.schema";

import { RolePermissionsModule } from "../role-permissions/role-permissions.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Settings.name,
        schema: SettingsSchema,
      },
    ]),

    RolePermissionsModule,
  ],

  controllers: [SettingsController],

  providers: [SettingsService],
})
export class SettingsModule {}