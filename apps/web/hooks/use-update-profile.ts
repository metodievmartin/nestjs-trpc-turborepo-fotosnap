import { trpc } from '@/lib/trpc/client';
import { UpdateProfileInput } from '@repo/contracts/users';

export function useUpdateProfile(
  userId: string,
  onSuccess?: () => void
) {
  const utils = trpc.useUtils();
  const mutation = trpc.users.updateProfile.useMutation({
    onMutate: async (input) => {
      await utils.users.getUserProfile.cancel({ userId });

      const previousProfile = utils.users.getUserProfile.getData({
        userId,
      });

      utils.users.getUserProfile.setData({ userId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          name: input.name ?? old.name,
          bio: input.bio ?? old.bio,
          website:
            input.website === '' ? null : (input.website ?? old.website),
        };
      });

      return { previousProfile };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProfile) {
        utils.users.getUserProfile.setData(
          { userId },
          context.previousProfile
        );
      }
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onSettled: () => {
      utils.users.getUserProfile.invalidate({ userId });
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