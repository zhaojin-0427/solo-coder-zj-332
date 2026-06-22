import { Module } from '@nestjs/common';
import { StampsModule } from './stamps/stamps.module';
import { ThemesModule } from './themes/themes.module';
import { StoriesModule } from './stories/stories.module';
import { CirculationsModule } from './circulations/circulations.module';
import { StatsModule } from './stats/stats.module';
import { SetsModule } from './sets/sets.module';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { AudioPackagesModule } from './audio-packages/audio-packages.module';

@Module({
  imports: [StampsModule, ThemesModule, StoriesModule, CirculationsModule, StatsModule, SetsModule, ExhibitionsModule, AudioPackagesModule],
})
export class AppModule {}
