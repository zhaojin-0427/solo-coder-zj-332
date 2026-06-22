import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { RestorationsService } from './restorations.service';

@Controller('restorations')
export class RestorationsController {
  constructor(@Inject(RestorationsService) private readonly restorationsService: RestorationsService) {}

  @Get('assessments')
  findAllAssessments(@Query() query: Record<string, string>) {
    return this.restorationsService.findAllAssessments(query);
  }

  @Get('assessments/:id')
  findOneAssessment(@Param('id') id: string) {
    return this.restorationsService.findOneAssessment(Number(id));
  }

  @Post('assessments')
  createAssessment(@Body() body: Record<string, any>) {
    return this.restorationsService.createAssessment(body);
  }

  @Put('assessments/:id')
  updateAssessment(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.restorationsService.updateAssessment(Number(id), body);
  }

  @Delete('assessments/:id')
  deleteAssessment(@Param('id') id: string) {
    return this.restorationsService.deleteAssessment(Number(id));
  }

  @Get('orders')
  findAllOrders(@Query() query: Record<string, string>) {
    return this.restorationsService.findAllOrders(query);
  }

  @Get('orders/:id')
  findOneOrder(@Param('id') id: string) {
    return this.restorationsService.findOneOrder(Number(id));
  }

  @Post('orders')
  createOrder(@Body() body: Record<string, any>) {
    return this.restorationsService.createOrder(body);
  }

  @Put('orders/:id')
  updateOrder(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.restorationsService.updateOrder(Number(id), body);
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.restorationsService.updateOrderStatus(Number(id), body.status);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) {
    return this.restorationsService.deleteOrder(Number(id));
  }

  @Get('stamps/:stampId/assessments')
  getStampAssessments(@Param('stampId') stampId: string) {
    return this.restorationsService.getStampAssessments(Number(stampId));
  }

  @Get('stamps/:stampId/orders')
  getStampOrders(@Param('stampId') stampId: string) {
    return this.restorationsService.getStampOrders(Number(stampId));
  }

  @Get('stats')
  getStats() {
    return this.restorationsService.getRestorationStats();
  }
}
