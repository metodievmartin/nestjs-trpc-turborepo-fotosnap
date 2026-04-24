import { trpc } from '@/lib/trpc/client';
import { uploadImage } from '@/lib/media';
import { authClient } from '@/lib/auth/client';

export function useUpdateAvatar(username: string) {
  const utils = trpc.useUtils();

  const handleUpdateAvatar = async (file: File) => {
    const filename = await uploadImage(file);
    await authClient.updateUser({ image: filename });

    utils.users.getUserByUsername.setData({ username }, (old) =>
      old ? { ...old, image: filename } : old
    );
  };

  return { updateAvatar: handleUpdateAvatar };
}
