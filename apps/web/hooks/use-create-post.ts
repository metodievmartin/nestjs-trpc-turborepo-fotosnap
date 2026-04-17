import { trpc } from '@/lib/trpc/client';
import { uploadImage } from '@/lib/media';

export function useCreatePost() {
  const utils = trpc.useUtils();
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.feed.getPostFeed.invalidate();
      utils.posts.findAll.invalidate();
    },
  });

  const handleCreatePost = async (file: File, caption: string) => {
    const filename = await uploadImage(file);

    await createPost.mutateAsync({
      image: filename,
      caption,
    });
  };

  return { createPost: handleCreatePost, isCreating: createPost.isPending };
}
