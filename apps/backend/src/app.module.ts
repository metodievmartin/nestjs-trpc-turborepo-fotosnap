import { Module } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { APP_GUARD } from '@nestjs/core';
import { TRPCModule } from 'nestjs-trpc';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';

import { AppContext } from './app.context';
import { PostsModule } from './posts/posts.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './auth/users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthTrpcMiddleware } from './auth/auth-trpc.middleware';
import { DATABASE_CONNECTION } from './database/database-connection';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    TRPCModule.forRoot({ basePath: '/api/trpc', context: AppContext }),
    AuthModule.forRootAsync({
      imports: [DatabaseModule, ConfigModule],
      useFactory: (database: NodePgDatabase, configService: ConfigService) => ({
        auth: betterAuth({
          // drizzleAdapter bridges better-auth's internal DB calls to the
          // existing Drizzle instance - you must generate and run migrations
          database: drizzleAdapter(database, { provider: 'pg' }),
          // BETTER_AUTH_URL should be your API's public URL,
          // better-auth uses it to build callback and redirect URLs for OAuth flows and email links.
          baseURL: configService.get('BETTER_AUTH_URL'),

          // trusted origins for OAuth flows and email links
          trustedOrigins: [configService.getOrThrow('UI_URL')],

          // explicitly enable email and password sign-in
          emailAndPassword: {
            enabled: true,
          },
        }),
      }),
      // Tokens injected into useFactory in the same order as the factory params.
      inject: [DATABASE_CONNECTION, ConfigService],
    }),
    PostsModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [],
  providers: [
    AuthTrpcMiddleware,
    AppContext,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
