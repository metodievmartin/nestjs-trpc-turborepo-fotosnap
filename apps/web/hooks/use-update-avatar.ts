import { trpc } from '@/lib/trpc/client';
import { uploadImage } from '@/lib/media';
import { authClient } from '@/lib/auth/client';

export function useUpdateAvatar(userId: string) {
  const utils = trpc.useUtils();

  const handleUpdateAvatar = async (file: File) => {
    const filename = await uploadImage(file);
    await authClient.updateUser({ image: filename });

    utils.users.getUserProfile.setData({ userId }, (old) =>
      old ? { ...old, image: filename } : old
    );
  };

  return { updateAvatar: handleUpdateAvatar };
}
