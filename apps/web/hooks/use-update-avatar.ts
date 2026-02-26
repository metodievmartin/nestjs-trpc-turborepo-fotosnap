import { trpc } from '@/lib/trpc/client';
import { uploadImage } from '@/lib/media';
import { authClient } from '@/lib/auth/client';

export function useUpdateAvatar() {
  const utils = trpc.useUtils();

  const handleUpdateAvatar = async (file: File) => {
    const filename = await uploadImage(file);
    await authClient.updateUser({ image: filename });
    await utils.posts.findAll.refetch();
  };

  return { updateAvatar: handleUpdateAvatar };
}
