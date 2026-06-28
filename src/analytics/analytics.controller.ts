import { Controller, Post, Body, Get } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("click")
  trackClick(@Body() body: { productId: number }) {
    console.log("CLICK RECEIVED:", body); // debugging line

    return this.analyticsService.trackClick(body.productId);
  }

  @Get("top")
  getTop() {
    return this.analyticsService.getTopProducts();
  }
}