import { Module } from '@nestjs/common';
import { CirculationsController } from './circulations.controller';
import { CirculationsService } from './circulations.service';

@Module({
  controllers: [CirculationsController],
  providers: [CirculationsService],
})
export class CirculationsModule {}
