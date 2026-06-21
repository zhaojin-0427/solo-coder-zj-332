import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { SetsService } from './sets.service';

@Controller('sets')
export class SetsController {
  constructor(@Inject(SetsService) private readonly setsService: SetsService) {}

  @Get()
  findAll() {
    return this.setsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.setsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.setsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setsService.remove(Number(id));
  }
}
