import { Module } from '@nestjs/common';
import { AudioPackagesController } from './audio-packages.controller';
import { AudioPackagesService } from './audio-packages.service';

@Module({
  controllers: [AudioPackagesController],
  providers: [AudioPackagesService],
})
export class AudioPackagesModule {}
