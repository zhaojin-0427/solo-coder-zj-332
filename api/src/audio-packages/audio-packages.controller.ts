import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { AudioPackagesService } from './audio-packages.service';

@Controller('audio-packages')
export class AudioPackagesController {
  constructor(@Inject(AudioPackagesService) private readonly audioPackagesService: AudioPackagesService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.audioPackagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.audioPackagesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.audioPackagesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.audioPackagesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.audioPackagesService.remove(Number(id));
  }

  @Get(':id/items')
  findItems(@Param('id') id: string) {
    return this.audioPackagesService.findItems(Number(id));
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.audioPackagesService.addItem(Number(id), body);
  }

  @Put(':id/items/:itemId')
  updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() body: Record<string, any>) {
    return this.audioPackagesService.updateItem(Number(id), Number(itemId), body);
  }

  @Put(':id/items/:itemId/status')
  updateItemStatus(@Param('id') id: string, @Param('itemId') itemId: string, @Body() body: { status: string }) {
    return this.audioPackagesService.updateItemStatus(Number(id), Number(itemId), body.status);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.audioPackagesService.removeItem(Number(id), Number(itemId));
  }

  @Get(':id/feedback')
  findFeedback(@Param('id') id: string) {
    return this.audioPackagesService.findFeedback(Number(id));
  }

  @Post(':id/feedback')
  addFeedback(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.audioPackagesService.addFeedback(Number(id), body);
  }

  @Delete(':id/feedback/:feedbackId')
  removeFeedback(@Param('id') id: string, @Param('feedbackId') feedbackId: string) {
    return this.audioPackagesService.removeFeedback(Number(id), Number(feedbackId));
  }

  @Get(':id/follow-ups')
  findFollowUps(@Param('id') id: string) {
    return this.audioPackagesService.findFollowUps(Number(id));
  }

  @Post(':id/follow-ups')
  addFollowUp(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.audioPackagesService.addFollowUp(Number(id), body);
  }

  @Put(':id/follow-ups/:followUpId')
  updateFollowUp(@Param('id') id: string, @Param('followUpId') followUpId: string, @Body() body: Record<string, any>) {
    return this.audioPackagesService.updateFollowUp(Number(id), Number(followUpId), body);
  }

  @Put(':id/follow-ups/:followUpId/status')
  updateFollowUpStatus(@Param('id') id: string, @Param('followUpId') followUpId: string, @Body() body: { status: string }) {
    return this.audioPackagesService.updateFollowUpStatus(Number(id), Number(followUpId), body.status);
  }

  @Delete(':id/follow-ups/:followUpId')
  removeFollowUp(@Param('id') id: string, @Param('followUpId') followUpId: string) {
    return this.audioPackagesService.removeFollowUp(Number(id), Number(followUpId));
  }

  @Get('stamps/:stampId/audio-packages')
  findStampAudioPackages(@Param('stampId') stampId: string) {
    return this.audioPackagesService.findStampAudioPackages(Number(stampId));
  }
}
