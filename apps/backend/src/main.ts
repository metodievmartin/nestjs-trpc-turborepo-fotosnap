import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Required for Better Auth to read raw request bodies.
    // The nestjs-better-auth module re-adds body parsers automatically.
    bodyParser: false,
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
