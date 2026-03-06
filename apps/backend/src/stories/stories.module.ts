import { Module } from '@nestjs/common';

import { StoriesRouter } from './stories.router';
import { StoriesService } from './stories.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [StoriesService, StoriesRouter],
})
export class StoriesModule {}
