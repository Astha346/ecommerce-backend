import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get("stats")
  getStats() {
    return this.dashboardService.getStats();
  }


  @Get("sales-by-month")
   getSalesByMonth() {
  return this.dashboardService.getSalesByMonth();
}

 @Get("revenue-by-month")
getRevenueByMonth() {
  return this.dashboardService.getRevenueByMonth();
}

@Get("orders-by-status")
  getOrdersByStatus() {
    return this.dashboardService.getOrdersByStatus();
  }

  @Get("customer-growth")
  getCustomerGrowth() {
    return this.dashboardService.getCustomerGrowth();
  }

  @Get("category-sales")
  getCategorySales() {
    return this.dashboardService.getCategorySales();
  }
}
