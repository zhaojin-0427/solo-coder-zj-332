import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { StampsService } from './stamps.service';

@Controller('stamps')
export class StampsController {
  constructor(@Inject(StampsService) private readonly stampsService: StampsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.stampsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stampsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.stampsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.stampsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stampsService.remove(Number(id));
  }

  @Post('merge')
  merge(@Body() body: { stampIds: number[]; targetAlbumPage: string; setId?: number }) {
    return this.stampsService.merge(body.stampIds, body.targetAlbumPage, body.setId);
  }
}
