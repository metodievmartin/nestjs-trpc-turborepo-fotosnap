import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { getEnabledWorkerRoles } from './feed/worker-roles';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.createApplicationContext(AppModule);

  const roles = Array.from(getEnabledWorkerRoles());
  logger.log(
    `Feed worker process started with roles: ${roles.length > 0 ? roles.join(',') : '(none)'}`,
  );

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, draining workers and shutting down...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap();
