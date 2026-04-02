export class UserFollowedEvent {
  static readonly key = 'user.followed' as const;

  constructor(
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}
