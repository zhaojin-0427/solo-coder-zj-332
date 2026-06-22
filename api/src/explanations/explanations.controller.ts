import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ExplanationsService } from './explanations.service';

@Controller('explanations')
export class ExplanationsController {
  constructor(@Inject(ExplanationsService) private readonly explanationsService: ExplanationsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.explanationsService.findAll(query);
  }

  @Get('pending-visits')
  findPendingVisits(@Query() query: Record<string, string>) {
    return this.explanationsService.findPendingVisits(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.explanationsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.explanationsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.explanationsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.explanationsService.remove(Number(id));
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.explanationsService.updateStatus(Number(id), body.status);
  }

  @Get(':id/stamps')
  findStamps(@Param('id') id: string) {
    return this.explanationsService.findStamps(Number(id));
  }

  @Post(':id/stamps')
  addStamp(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.explanationsService.addStamp(Number(id), body);
  }

  @Put(':id/stamps/:stampId')
  updateStamp(@Param('id') id: string, @Param('stampId') stampId: string, @Body() body: Record<string, any>) {
    return this.explanationsService.updateStamp(Number(id), Number(stampId), body);
  }

  @Delete(':id/stamps/:stampId')
  removeStamp(@Param('id') id: string, @Param('stampId') stampId: string) {
    return this.explanationsService.removeStamp(Number(id), Number(stampId));
  }

  @Get(':id/feedback')
  findFeedback(@Param('id') id: string) {
    return this.explanationsService.findFeedback(Number(id));
  }

  @Post(':id/feedback')
  addFeedback(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.explanationsService.addFeedback(Number(id), body);
  }

  @Delete(':id/feedback/:feedbackId')
  removeFeedback(@Param('id') id: string, @Param('feedbackId') feedbackId: string) {
    return this.explanationsService.removeFeedback(Number(id), Number(feedbackId));
  }

  @Post(':id/feedback/:feedbackId/convert-follow-up')
  convertFeedbackToFollowUp(
    @Param('id') id: string,
    @Param('feedbackId') feedbackId: string,
    @Body() body: Record<string, any>
  ) {
    return this.explanationsService.convertFeedbackToFollowUp(Number(id), Number(feedbackId), body);
  }

  @Post(':id/feedback/:feedbackId/append-story')
  appendFeedbackToStory(@Param('id') id: string, @Param('feedbackId') feedbackId: string, @Body() body: Record<string, any>) {
    return this.explanationsService.appendFeedbackToStory(Number(id), Number(feedbackId), body);
  }

  @Get(':id/follow-ups')
  findFollowUps(@Param('id') id: string) {
    return this.explanationsService.findFollowUps(Number(id));
  }

  @Post(':id/follow-ups')
  addFollowUp(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.explanationsService.addFollowUp(Number(id), body);
  }

  @Put(':id/follow-ups/:followUpId')
  updateFollowUp(@Param('id') id: string, @Param('followUpId') followUpId: string, @Body() body: Record<string, any>) {
    return this.explanationsService.updateFollowUp(Number(id), Number(followUpId), body);
  }

  @Put(':id/follow-ups/:followUpId/status')
  updateFollowUpStatus(@Param('id') id: string, @Param('followUpId') followUpId: string, @Body() body: { status: string }) {
    return this.explanationsService.updateFollowUpStatus(Number(id), Number(followUpId), body.status);
  }

  @Delete(':id/follow-ups/:followUpId')
  removeFollowUp(@Param('id') id: string, @Param('followUpId') followUpId: string) {
    return this.explanationsService.removeFollowUp(Number(id), Number(followUpId));
  }

  @Get(':id/visits')
  findVisits(@Param('id') id: string) {
    return this.explanationsService.findVisits(Number(id));
  }

  @Post(':id/visits')
  addVisit(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.explanationsService.addVisit(Number(id), body);
  }

  @Get('stamps/:stampId/explanations')
  findStampExplanations(@Param('stampId') stampId: string) {
    return this.explanationsService.findStampExplanations(Number(stampId));
  }
}
