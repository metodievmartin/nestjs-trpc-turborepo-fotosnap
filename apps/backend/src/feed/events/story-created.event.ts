export class StoryCreatedEvent {
  static readonly key = 'story.created' as const;

  constructor(
    public readonly storyId: number,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
  ) {}
}
