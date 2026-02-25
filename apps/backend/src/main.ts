import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Required for Better Auth to read raw request bodies.
    // The nestjs-better-auth module re-adds body parsers automatically.
    bodyParser: false,
  });
  const uploadDir = path.join(__dirname, '../../uploads');

  app.setGlobalPrefix('api');
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
