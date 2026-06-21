import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ExhibitionsService } from './exhibitions.service';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(@Inject(ExhibitionsService) private readonly exhibitionsService: ExhibitionsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.exhibitionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exhibitionsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.exhibitionsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.exhibitionsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exhibitionsService.remove(Number(id));
  }

  @Get(':id/stamps')
  findExhibitionStamps(@Param('id') id: string) {
    return this.exhibitionsService.findExhibitionStamps(Number(id));
  }

  @Post(':id/stamps')
  addStamp(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.exhibitionsService.addStamp(Number(id), body);
  }

  @Put(':id/stamps/:stampId')
  updateStamp(@Param('id') id: string, @Param('stampId') stampId: string, @Body() body: Record<string, any>) {
    return this.exhibitionsService.updateStamp(Number(id), Number(stampId), body);
  }

  @Delete(':id/stamps/:stampId')
  removeStamp(@Param('id') id: string, @Param('stampId') stampId: string) {
    return this.exhibitionsService.removeStamp(Number(id), Number(stampId));
  }

  @Put(':id/stamps/:stampId/confirm')
  confirmStamp(@Param('id') id: string, @Param('stampId') stampId: string) {
    return this.exhibitionsService.updateStampStatus(Number(id), Number(stampId), '已确认');
  }

  @Put(':id/stamps/:stampId/defer')
  deferStamp(@Param('id') id: string, @Param('stampId') stampId: string) {
    return this.exhibitionsService.updateStampStatus(Number(id), Number(stampId), '暂缓');
  }

  @Put(':id/stamps/:stampId/replace')
  replaceStamp(@Param('id') id: string, @Param('stampId') stampId: string, @Body() body: { newStampId: number; displayRole?: string; keeper?: string }) {
    return this.exhibitionsService.replaceStamp(Number(id), Number(stampId), body);
  }

  @Put(':id/stamps/:stampId/remove')
  softRemoveStamp(@Param('id') id: string, @Param('stampId') stampId: string) {
    return this.exhibitionsService.updateStampStatus(Number(id), Number(stampId), '已移出');
  }

  @Get('stamps/:stampId/exhibitions')
  findStampExhibitions(@Param('stampId') stampId: string) {
    return this.exhibitionsService.findStampExhibitions(Number(stampId));
  }
}
