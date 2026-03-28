import { useState } from 'react';
import { getQueryKey } from '@trpc/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { UserPreview } from '@repo/contracts/users';

import { trpc } from '@/lib/trpc/client';

interface UseFollowUserOptions {
  invalidateOnSuccess?: boolean;
}

export function useFollowUser(
  profileUsername: string,
  options?: UseFollowUserOptions
) {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const followersKey = getQueryKey(trpc.users.getFollowers);
  const followingKey = getQueryKey(trpc.users.getFollowing);
  const suggestedKey = getQueryKey(trpc.users.getSuggestedUsers);

  const toggleInList = (targetUserId: string) => (old: UserPreview[]) =>
    old.map((u) =>
      u.id === targetUserId ? { ...u, isFollowing: !u.isFollowing } : u
    );

  const invalidate = () => {
    utils.users.getUserByUsername.invalidate({ username: profileUsername });
    utils.users.getFollowers.invalidate();
    utils.users.getFollowing.invalidate();
    utils.users.getSuggestedUsers.invalidate();
  };

  const optimisticUpdate = (targetUserId: string) => {
    setPendingUserId(targetUserId);
    const toggle = toggleInList(targetUserId);
    queryClient.setQueriesData<UserPreview[]>(
      { queryKey: followersKey },
      (old) => (old ? toggle(old) : old)
    );
    queryClient.setQueriesData<UserPreview[]>(
      { queryKey: followingKey },
      (old) => (old ? toggle(old) : old)
    );
    queryClient.setQueriesData<UserPreview[]>(
      { queryKey: suggestedKey },
      (old) => (old ? toggle(old) : old)
    );
  };

  const onSuccess = options?.invalidateOnSuccess ? invalidate : undefined;
  const onSettled = () => setPendingUserId(null);

  const followMutation = trpc.users.follow.useMutation({
    onMutate: ({ userId: targetUserId }) => optimisticUpdate(targetUserId),
    onError: invalidate,
    onSuccess,
    onSettled,
  });

  const unfollowMutation = trpc.users.unfollow.useMutation({
    onMutate: ({ userId: targetUserId }) => optimisticUpdate(targetUserId),
    onError: invalidate,
    onSuccess,
    onSettled,
  });

  const toggleFollow = (
    targetUserId: string,
    isCurrentlyFollowing: boolean
  ) => {
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate({ userId: targetUserId });
    } else {
      followMutation.mutate({ userId: targetUserId });
    }
  };

  return {
    toggleFollow,
    invalidate,
    isPending: followMutation.isPending || unfollowMutation.isPending,
    pendingUserId,
  };
}
