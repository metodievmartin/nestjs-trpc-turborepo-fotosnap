import { Module } from '@nestjs/common';

import { CommentsRouter } from './comments.router';
import { CommentsService } from './comments.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CommentsService, CommentsRouter],
})
export class CommentsModule {}
