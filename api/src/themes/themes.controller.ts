import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { ThemesService } from './themes.service';

@Controller('themes')
export class ThemesController {
  constructor(@Inject(ThemesService) private readonly themesService: ThemesService) {}

  @Get()
  findAll() {
    return this.themesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.themesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.themesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.themesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.themesService.remove(Number(id));
  }

  @Post(':id/stamps')
  addStamp(@Param('id') id: string, @Body() body: { stampId: number }) {
    return this.themesService.addStamp(Number(id), body.stampId);
  }

  @Delete(':id/stamps/:stampId')
  removeStamp(@Param('id') id: string, @Param('stampId') stampId: string) {
    return this.themesService.removeStamp(Number(id), Number(stampId));
  }
}
