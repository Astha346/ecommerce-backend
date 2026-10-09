import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";

import {
  Notification,
  NotificationSchema,
} from "./notification.schema";

import {
  User,
  UserSchema,
} from "../users/user.schema";

import {
  NotificationController,
} from "./notification.controller";

import {
  NotificationService,
} from "./notification.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [
    NotificationController,
  ],

  providers: [
    NotificationService,
  ],

  exports: [
    NotificationService,
  ],
})
export class NotificationModule {}