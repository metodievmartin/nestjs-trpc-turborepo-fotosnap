import { and, asc, eq, gt } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { StoryCreatedEvent } from '../feed/events/story-created.event';

type StoryWithUser = typeof story.$inferSelect & {
  user: typeof user.$inferSelect;
};

@Injectable()
export class StoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly eventEmitter: EventEmitter2,
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

    const result = this.toStory(createdStory!);

    this.eventEmitter.emit(
      StoryCreatedEvent.key,
      new StoryCreatedEvent(id, userId, createdStory!.createdAt, expiresAt),
    );

    return result;
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

  private toStoryGroup(fetchedStories: StoryWithUser[]): StoryGroup {
    const first = fetchedStories[0];

    return {
      userId: first.userId,
      username: first.user.username,
      avatar: first.user.image || '',
      stories: fetchedStories.map((s) => this.toStory(s)),
    };
  }

  private toStory(fetchedStory: StoryWithUser): Story {
    return {
      id: fetchedStory.id,
      user: {
        id: fetchedStory.user.id,
        username: fetchedStory.user.username,
        avatar: fetchedStory.user.image || '',
      },
      image: fetchedStory.image,
      createdAt: fetchedStory.createdAt.toISOString(),
      expiresAt: fetchedStory.expiresAt.toISOString(),
    };
  }
}
