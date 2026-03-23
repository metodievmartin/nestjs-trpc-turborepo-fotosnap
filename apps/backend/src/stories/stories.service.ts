import { and, asc, eq, gt, not } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import {
  CreateStoryInput,
  NullableStoryGroup,
  Story,
  StoryGroup,
} from '@repo/contracts/stories';

import { user } from '../auth/schema';
import { story } from './schemas/schema';
import { schema } from '../database/database.module';
import { DATABASE_CONNECTION } from '../database/database-connection';

type StoryWithUser = typeof story.$inferSelect & {
  user: typeof user.$inferSelect;
};

@Injectable()
export class StoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    createStoryInput: CreateStoryInput,
    userId: string,
  ): Promise<Story> {
    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + 24);

    const [{ id }] = await this.database
      .insert(story)
      .values({
        userId,
        image: createStoryInput.image,
        expiresAt,
      })
      .returning({ id: story.id });

    const createdStory = await this.database.query.story.findFirst({
      where: eq(story.id, id),
      with: { user: true },
    });

    return this.toStory(createdStory!);
  }

  async getUserStories(userId: string): Promise<NullableStoryGroup> {
    const fetchedStories = await this.database.query.story.findMany({
      where: and(eq(story.userId, userId), gt(story.expiresAt, new Date())),
      orderBy: [asc(story.createdAt)],
      with: { user: true },
    });

    if (fetchedStories.length === 0) return null;

    return this.toStoryGroup(fetchedStories);
  }

  async getFeedStories(viewerId: string): Promise<StoryGroup[]> {
    const fetchedStories = await this.database.query.story.findMany({
      where: and(
        not(eq(story.userId, viewerId)),
        gt(story.expiresAt, new Date()),
      ),
      orderBy: [asc(story.createdAt)],
      with: {
        user: true,
      },
    });

    const grouped = Map.groupBy(fetchedStories, (s) => s.userId);

    return Array.from(grouped.values()).map((stories) =>
      this.toStoryGroup(stories),
    );
  }

  private toStoryGroup(fetchedStories: StoryWithUser[]): StoryGroup {
    const first = fetchedStories[0];

    return {
      userId: first.userId,
      username: first.user.name,
      avatar: first.user.image || '',
      stories: fetchedStories.map((s) => this.toStory(s)),
    };
  }

  private toStory(fetchedStory: StoryWithUser): Story {
    return {
      id: fetchedStory.id,
      user: {
        id: fetchedStory.user.id,
        username: fetchedStory.user.name,
        avatar: fetchedStory.user.image || '',
      },
      image: fetchedStory.image,
      createdAt: fetchedStory.createdAt.toISOString(),
      expiresAt: fetchedStory.expiresAt.toISOString(),
    };
  }
}
