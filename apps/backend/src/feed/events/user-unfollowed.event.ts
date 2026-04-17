export class UserUnfollowedEvent {
  static readonly key = 'user.unfollowed' as const;

  constructor(
    public readonly followerId: string,
    public readonly unfollowedUserId: string,
  ) {}
}
