import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import {
  FEED_QUEUE,
  FAN_OUT_POST_JOB,
  FAN_OUT_STORY_JOB,
  BACKFILL_FOLLOW_JOB,
  CLEANUP_UNFOLLOW_JOB,
} from './feed.constants';
import { PostCreatedEvent } from './events/post-created.event';
import { StoryCreatedEvent } from './events/story-created.event';
import { UserFollowedEvent } from './events/user-followed.event';
import { UserUnfollowedEvent } from './events/user-unfollowed.event';

@Injectable()
export class FeedPublisher {
  private readonly logger = new Logger(FeedPublisher.name);

  constructor(
    @InjectQueue(FEED_QUEUE) private readonly feedQueue: Queue,
  ) {}

  @OnEvent(PostCreatedEvent.key)
  async onPostCreated(event: PostCreatedEvent) {
    this.logger.log(`Post ${event.postId} created by ${event.userId}`);
    await this.feedQueue.add(FAN_OUT_POST_JOB, {
      postId: event.postId,
      userId: event.userId,
      createdAt: event.createdAt.toISOString(),
    });
  }

  @OnEvent(StoryCreatedEvent.key)
  async onStoryCreated(event: StoryCreatedEvent) {
    this.logger.log(`Story ${event.storyId} created by ${event.userId}`);
    await this.feedQueue.add(FAN_OUT_STORY_JOB, {
      storyId: event.storyId,
      userId: event.userId,
      createdAt: event.createdAt.toISOString(),
      expiresAt: event.expiresAt.toISOString(),
    });
  }

  @OnEvent(UserFollowedEvent.key)
  async onUserFollowed(event: UserFollowedEvent) {
    this.logger.log(
      `User ${event.followerId} followed ${event.followingId}`,
    );
    await this.feedQueue.add(BACKFILL_FOLLOW_JOB, {
      followerId: event.followerId,
      followingId: event.followingId,
    });
  }

  @OnEvent(UserUnfollowedEvent.key)
  async onUserUnfollowed(event: UserUnfollowedEvent) {
    this.logger.log(
      `User ${event.followerId} unfollowed ${event.unfollowedUserId}`,
    );
    await this.feedQueue.add(CLEANUP_UNFOLLOW_JOB, {
      followerId: event.followerId,
      unfollowedUserId: event.unfollowedUserId,
    });
  }
}
