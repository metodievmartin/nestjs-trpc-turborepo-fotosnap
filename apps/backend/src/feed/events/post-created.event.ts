export class PostCreatedEvent {
  static readonly key = 'post.created' as const;

  constructor(
    public readonly postId: number,
    public readonly userId: string,
    public readonly createdAt: Date,
  ) {}
}
