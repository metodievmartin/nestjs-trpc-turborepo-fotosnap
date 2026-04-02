import { useState } from 'react';
import { getQueryKey } from '@trpc/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { PaginatedUserPreviews, UserPreview } from '@repo/contracts/users';

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

  const togglePreview = (targetUserId: string, u: UserPreview) =>
    u.id === targetUserId ? { ...u, isFollowing: !u.isFollowing } : u;

  const invalidate = () => {
    utils.users.getUserByUsername.invalidate({ username: profileUsername });
    utils.users.getFollowers.invalidate();
    utils.users.getFollowing.invalidate();
    utils.users.getSuggestedUsers.invalidate();
    utils.feed.getPostFeed.invalidate();
    utils.feed.getStoryFeed.invalidate();
  };

  const optimisticUpdate = (targetUserId: string) => {
    setPendingUserId(targetUserId);

    // getFollowers / getFollowing return paginated data ({ items, nextCursor, hasMore })
    queryClient.setQueriesData<PaginatedUserPreviews>(
      { queryKey: followersKey },
      (old) =>
        old
          ? { ...old, items: old.items.map((u) => togglePreview(targetUserId, u)) }
          : old,
    );
    queryClient.setQueriesData<PaginatedUserPreviews>(
      { queryKey: followingKey },
      (old) =>
        old
          ? { ...old, items: old.items.map((u) => togglePreview(targetUserId, u)) }
          : old,
    );

    // getSuggestedUsers returns a flat UserPreview[]
    queryClient.setQueriesData<UserPreview[]>(
      { queryKey: suggestedKey },
      (old) =>
        old ? old.map((u) => togglePreview(targetUserId, u)) : old,
    );

    // Optimistically toggle isFollowing on the profile being viewed
    utils.users.getUserByUsername.setData({ username: profileUsername }, (old) =>
      old ? { ...old, isFollowing: !old.isFollowing } : old,
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
