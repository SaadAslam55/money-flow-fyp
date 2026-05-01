import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  async findAll(@Query('orgId') orgId: string) {
    return this.service.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Param('id') id: string, @Query('orgId') orgId: string) {
    return this.service.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  async create(@Query('orgId') orgId: string, @Body() data: any) {
    return this.service.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  async update(@Param('id') id: string, @Query('orgId') orgId: string, @Body() data: any) {
    return this.service.update(id, orgId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async remove(@Param('id') id: string, @Query('orgId') orgId: string) {
    return this.service.delete(id, orgId);
  }
}
