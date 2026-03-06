import { asc, eq, gt } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { CreateStoryInput, Story, StoryGroup } from '@repo/contracts/stories';

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

  async getStories(userId: string): Promise<StoryGroup[]> {
    const fetchedStories = await this.database.query.story.findMany({
      where: gt(story.expiresAt, new Date()),
      orderBy: [asc(story.createdAt)],
      with: {
        user: true,
      },
    });

    const storyGroups = new Map<string, StoryGroup>();

    for (const fetchedStory of fetchedStories) {
      if (!storyGroups.has(fetchedStory.userId)) {
        storyGroups.set(fetchedStory.userId, {
          userId: fetchedStory.userId,
          username: fetchedStory.user.name,
          avatar: fetchedStory.user.image || '',
          stories: [],
        });
      }

      storyGroups
        .get(fetchedStory.userId)!
        .stories.push(this.toStory(fetchedStory));
    }

    return Array.from(storyGroups.values());
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
