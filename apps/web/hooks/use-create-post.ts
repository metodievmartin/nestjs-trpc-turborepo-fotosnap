import { trpc } from '@/lib/trpc/client';

export function useCreatePost() {
  const createPost = trpc.posts.create.useMutation({});

  const handleCreatePost = async (file: File, caption: string) => {
    const formData = new FormData();
    formData.append('image', file);

    const uploadResponse = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const { filename } = await uploadResponse.json();

    await createPost.mutateAsync({
      image: filename,
      caption,
    });
  };

  return { createPost: handleCreatePost, isCreating: createPost.isPending };
}