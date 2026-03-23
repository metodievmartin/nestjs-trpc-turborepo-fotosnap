import { trpc } from '@/lib/trpc/client';
import { uploadImage } from '@/lib/media';

export function useCreateStory() {
  const utils = trpc.useUtils();
  const createStory = trpc.stories.create.useMutation({
    onSuccess: () => {
      utils.stories.getOwnStories.invalidate();
    },
  });

  const handleCreateStory = async (file: File) => {
    const filename = await uploadImage(file);

    await createStory.mutateAsync({
      image: filename,
    });
  };

  return {
    createStory: handleCreateStory,
    isCreating: createStory.isPending,
  };
}
