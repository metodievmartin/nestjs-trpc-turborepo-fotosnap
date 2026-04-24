import { trpc } from '@/lib/trpc/client';
import { UpdateProfileInput } from '@repo/contracts/users';

interface UseUpdateProfileOptions {
  onSuccess?: () => void;
  onUsernameChange?: (newUsername: string) => void;
}

export function useUpdateProfile(
  username: string,
  options?: UseUpdateProfileOptions
) {
  const utils = trpc.useUtils();
  const mutation = trpc.users.updateProfile.useMutation({
    onMutate: async (input) => {
      // Skip optimistic update when username is changing — the cache key
      // will shift and the page will navigate away anyway.
      if (input.username && input.username !== username)
        return { previousProfile: undefined };

      await utils.users.getUserByUsername.cancel({ username });

      const previousProfile = utils.users.getUserByUsername.getData({
        username,
      });

      utils.users.getUserByUsername.setData({ username }, (old) => {
        if (!old) return old;
        return {
          ...old,
          username: input.username ?? old.username,
          displayName: input.displayName ?? old.displayName,
          bio: input.bio ?? old.bio,
          website: input.website === '' ? null : (input.website ?? old.website),
        };
      });

      return { previousProfile };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        utils.users.getUserByUsername.setData(
          { username },
          context.previousProfile
        );
      }
    },
    onSuccess: (_data, input) => {
      if (input.username && input.username !== username) {
        // Username changed — invalidate both old and new, then navigate.
        utils.users.getUserByUsername.invalidate({ username });
        utils.users.getUserByUsername.invalidate({
          username: input.username,
        });
        options?.onUsernameChange?.(input.username);
      }
      options?.onSuccess?.();
    },
    onSettled: (_data, _error, input) => {
      // Only invalidate current key if username didn't change
      // (the onSuccess handler covers the username-change case).
      if (!input.username || input.username === username) {
        utils.users.getUserByUsername.invalidate({ username });
      }
    },
  });

  const updateProfile = (data: UpdateProfileInput) => {
    mutation.mutate(data);
  };

  return {
    updateProfile,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
