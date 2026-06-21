import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(@Inject(StoriesService) private readonly storiesService: StoriesService) {}

  @Get()
  findAll(@Query('stampId') stampId?: string) {
    return this.storiesService.findAll(stampId ? Number(stampId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storiesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.storiesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.storiesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storiesService.remove(Number(id));
  }
}
