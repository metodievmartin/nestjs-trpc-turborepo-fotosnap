import path from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { getEnabledWorkerRoles } from './feed/worker-roles';

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

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  const roles = Array.from(getEnabledWorkerRoles());
  logger.log(`API listening on port ${port}`);
  logger.log(
    `Feed worker roles in this process: ${roles.length > 0 ? roles.join(',') : '(none)'}`,
  );
}
bootstrap();
