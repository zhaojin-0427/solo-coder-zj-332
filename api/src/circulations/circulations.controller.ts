import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { CirculationsService } from './circulations.service';

@Controller('circulations')
export class CirculationsController {
  constructor(@Inject(CirculationsService) private readonly circulationsService: CirculationsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.circulationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.circulationsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.circulationsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.circulationsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.circulationsService.remove(Number(id));
  }
}
