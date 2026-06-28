import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { CartModule } from "./cart/cart.module";
import { OrderModule } from "./order/order.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ProductsModule } from "./products/products.module";
import { AuthModule } from "./auth/auth.module"; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
      inject: [ConfigService],
    }),

    CartModule,
    OrderModule,
    AnalyticsModule,
    ProductsModule,
    AuthModule,
  ],
})
export class AppModule {}