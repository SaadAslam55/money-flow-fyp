import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  getRevenue(
    @Query('orgId') orgId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.service.getRevenueReport(orgId, new Date(startDate), new Date(endDate));
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoice summary' })
  getInvoiceSummary(@Query('orgId') orgId: string) {
    return this.service.getInvoiceSummary(orgId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer analytics' })
  getCustomerAnalytics(@Query('orgId') orgId: string) {
    return this.service.getCustomerAnalytics(orgId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product performance' })
  getProductPerformance(@Query('orgId') orgId: string) {
    return this.service.getProductPerformance(orgId);
  }
}
