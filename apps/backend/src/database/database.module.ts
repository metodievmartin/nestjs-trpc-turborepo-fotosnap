import { Pool } from 'pg';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from '../auth/schema';

// Symbol used as the DI token — avoids magic strings when injecting the DB
// connection elsewhere (use @Inject(DATABASE_CONNECTION) in your providers).
import { DATABASE_CONNECTION } from './database-connection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        // pg Pool manages a pool of reusable TCP connections to Postgres.
        const pool = new Pool({
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        // Wraps the pool with Drizzle ORM — this is what gets injected
        // wherever DATABASE_CONNECTION is requested.
        return drizzle(pool, {
          schema: { ...authSchema },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
