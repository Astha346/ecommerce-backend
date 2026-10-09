import {
  Controller,
  Get,
  Patch,
  Param,
  Request,
  UseGuards,
} from "@nestjs/common";

import {
  NotificationService,
} from "./notification.service";

import {
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService:
      NotificationService,
  ) {}

  @Get()
  async getNotifications(
    @Request() req: any,
  ) {
    return this.notificationService.findByUser(
      req.user.id,
    );
  }

  @Get("unread-count")
  async getUnreadCount(
    @Request() req: any,
  ) {
    return this.notificationService.getUnreadCount(
      req.user.id,
    );
  }

  @Patch(":id/read")
  async markAsRead(
    @Param("id") id: string,
    @Request() req: any,
  ) {
    return this.notificationService.markAsRead(
      id,
      req.user.id,
    );
  }

  @Patch("read-all")
  async markAllAsRead(
    @Request() req: any,
  ) {
    return this.notificationService.markAllAsRead(
      req.user.id,
    );
  }
}