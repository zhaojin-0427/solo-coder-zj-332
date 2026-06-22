import { Module } from '@nestjs/common';
import { StampsModule } from './stamps/stamps.module';
import { ThemesModule } from './themes/themes.module';
import { StoriesModule } from './stories/stories.module';
import { CirculationsModule } from './circulations/circulations.module';
import { StatsModule } from './stats/stats.module';
import { SetsModule } from './sets/sets.module';

@Module({
  imports: [StampsModule, ThemesModule, StoriesModule, CirculationsModule, StatsModule, SetsModule],
})
export class AppModule {}
