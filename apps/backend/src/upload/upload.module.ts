import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { multerConfig } from './upload.config';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
