import { Module } from '@nestjs/common';

import { UsersRouter } from './users.router';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, UsersRouter],
  exports: [UsersService],
})
export class UsersModule {}
