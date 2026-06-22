import { Module } from '@nestjs/common';
import { RestorationsController } from './restorations.controller';
import { RestorationsService } from './restorations.service';

@Module({
  controllers: [RestorationsController],
  providers: [RestorationsService],
})
export class RestorationsModule {}
