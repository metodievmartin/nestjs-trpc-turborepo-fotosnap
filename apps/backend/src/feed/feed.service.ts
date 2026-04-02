import { Injectable } from '@nestjs/common';

import { PaginatedPosts } from '@repo/contracts/posts';
import { PaginatedStoryGroups } from '@repo/contracts/stories';

import { PostFeedBuilder } from './builders/post-feed-builder';
import { StoryFeedBuilder } from './builders/story-feed-builder';

@Injectable()
export class FeedService {
  constructor(
    private readonly postFeedBuilder: PostFeedBuilder,
    private readonly storyFeedBuilder: StoryFeedBuilder,
  ) {}

  async getPostFeed(
    userId: string,
    cursor?: string | null,
    limit?: number,
  ): Promise<PaginatedPosts> {
    return this.postFeedBuilder.getPostFeed(userId, cursor, limit);
  }

  async getStoryFeed(
    viewerId: string,
    cursor?: string | null,
    limit?: number,
  ): Promise<PaginatedStoryGroups> {
    return this.storyFeedBuilder.getStoryFeed(viewerId, cursor, limit);
  }
}
