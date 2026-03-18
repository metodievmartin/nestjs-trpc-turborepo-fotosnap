import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';

import { Button } from '../ui/button';
import UserProfileLink from '../ui/user-profile-link';
import { useFollowUser } from '@/hooks/use-follow-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export type FollowListType = 'followers' | 'following';

interface FollowersFollowingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: FollowListType;
}

export function FollowersFollowingModal({
  open,
  onOpenChange,
  userId,
  type,
}: FollowersFollowingModalProps) {
  const { data: session } = authClient.useSession();
  const { data: followers = [] } = trpc.users.getFollowers.useQuery(
    { userId },
    { enabled: open && type === 'followers' }
  );
  const { data: following = [] } = trpc.users.getFollowing.useQuery(
    { userId },
    { enabled: open && type === 'following' }
  );
  const { toggleFollow, invalidate, pendingUserId } = useFollowUser(userId);

  const users = type === 'followers' ? followers : following;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) invalidate();
        onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No {type === 'followers' ? 'followers' : 'following'} yet
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <UserProfileLink
                    userId={user.id}
                    username={user.name}
                    avatar={user.image}
                    avatarSize="md"
                    className="flex-1 min-w-0"
                    onClick={() => onOpenChange(false)}
                  />
                  {session?.user.id !== user.id && (
                    <Button
                      variant={user.isFollowing ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleFollow(user.id, user.isFollowing)}
                      disabled={pendingUserId === user.id}
                      className="flex-shrink-0"
                    >
                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
