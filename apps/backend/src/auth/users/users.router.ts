import { z } from 'zod';
import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';

import {
  userIdSchema,
  updateProfileSchema,
  userProfileSchema,
  type UserIdInput,
  type UpdateProfileInput,
  userPreviewSchema,
} from '@repo/contracts/users';

import { UsersService } from './users.service';
import { AuthTrpcMiddleware } from '../auth-trpc.middleware';
import type { TrpcSessionContext } from '../../app-context.interface';

@Router({ alias: 'users' })
@UseMiddlewares(AuthTrpcMiddleware)
export class UsersRouter {
  constructor(private readonly usersService: UsersService) {}

  @Mutation({ input: userIdSchema })
  async follow(
    @Input() input: UserIdInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.usersService.follow(context.user.id, input.userId);
  }

  @Mutation({ input: userIdSchema })
  async unfollow(
    @Input() input: UserIdInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.usersService.unfollow(context.user.id, input.userId);
  }

  @Query({ input: userIdSchema, output: z.array(userPreviewSchema) })
  async getFollowers(@Input() input: UserIdInput) {
    return this.usersService.getFollowers(input.userId);
  }

  @Query({ input: userIdSchema, output: z.array(userPreviewSchema) })
  async getFollowing(@Input() input: UserIdInput) {
    return this.usersService.getFollowing(input.userId);
  }

  @Query({ output: z.array(userPreviewSchema) })
  async getSuggestedUsers(@Ctx() context: TrpcSessionContext) {
    return this.usersService.getSuggestedUsers(context.user.id);
  }

  @Mutation({ input: updateProfileSchema })
  async updateProfile(
    @Input() input: UpdateProfileInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.usersService.updateProfile(context.user.id, input);
  }

  @Query({ input: userIdSchema, output: userProfileSchema })
  async getUserProfile(
    @Input() input: UserIdInput,
    @Ctx() context: TrpcSessionContext,
  ) {
    return this.usersService.getUserProfile(input.userId, context.user.id);
  }
}
