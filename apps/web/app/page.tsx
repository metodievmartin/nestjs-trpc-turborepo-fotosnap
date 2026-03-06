'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Fab } from '@/components/ui/fab';
import Feed from '@/components/dashboard/feed';
import Stories from '@/components/dashboard/stories';
import Sidebar from '@/components/dashboard/sidebar';
import PhotoUploadDialog from '@/components/dashboard/photo-upload-dialog';

import { useCreatePost } from '@/hooks/use-create-post';
import { trpc } from '@/lib/trpc/client';

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { createPost } = useCreatePost();
  const stories = trpc.stories.getStories.useQuery();
  const utils = trpc.useUtils();

  const createStory = trpc.stories.create.useMutation({
    onSuccess: () => {
      utils.stories.getStories.invalidate();
    },
  });

  const handleStoryUpload = async (file: File) => {
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
    await createStory.mutateAsync({
      image: filename,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Stories
              storyGroups={stories.data || []}
              onStoryUpload={handleStoryUpload}
            />
            <Feed />
          </div>
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Sidebar />
          </div>
        </div>
      </div>

      <PhotoUploadDialog
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSubmit={createPost}
      />
      <Fab className="cursor-pointer" onClick={() => setShowUploadModal(true)}>
        <Plus className="h-6 w-6" />
      </Fab>
    </div>
  );
}
