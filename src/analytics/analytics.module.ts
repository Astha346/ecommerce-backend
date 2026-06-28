import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Analytics, AnalyticsSchema } from "./schema/analytics.schema";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}