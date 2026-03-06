import { useState } from 'react';

import { StoryGroup } from '@repo/contracts/stories';

import { Card } from '../ui/card';
import UserAvatar from '../ui/user-avatar';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import StoryUpload from '@/components/dashboard/story-upload';
import { StoryViewer } from '@/components/dashboard/story-viewer';

interface StoriesProps {
  storyGroups: StoryGroup[];
  onStoryUpload: (file: File) => Promise<void>;
}

export default function Stories({
  storyGroups = [],
  onStoryUpload,
}: StoriesProps) {
  const { data: session } = authClient.useSession();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const ownStoryGroup = storyGroups.find(
    (group) => group.userId === session?.user.id
  );

  const otherStoryGroups = storyGroups.filter(
    (group) => group.userId !== session?.user.id
  );

  return (
    <Card className="p-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
        <div className="flex flex-col items-center space-y-1 shrink-0">
          <div className="relative">
            <div
              className={`p-0.5 rounded-full ${ownStoryGroup ? 'bg-linear-to-tr from-yellow-400 to-fuchsia-600' : 'bg-gray-200'}`}
            >
              <button
                onClick={() => {
                  if (ownStoryGroup) {
                    setSelectedGroupIndex(0);
                    setShowStoryViewer(true);
                  }
                }}
                className="cursor-pointer"
              >
                <UserAvatar
                  src={session?.user.image}
                  alt="Your profile picture"
                  size="xl"
                  className="border-2 border-white"
                />
              </button>

              <Button
                onClick={() => setShowCreateStory(true)}
                size="icon"
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <span
            className="text-xs text-center w-16 truncate"
            title="Your story"
          >
            Your story
          </span>
        </div>

        {otherStoryGroups?.map((storyGroup, index) => (
          <div
            key={storyGroup.userId}
            className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer"
            onClick={() => {
              setSelectedGroupIndex(ownStoryGroup ? index + 1 : index);
              setShowStoryViewer(true);
            }}
          >
            <div className="relative">
              <UserAvatar
                src={storyGroup.avatar}
                alt={`${storyGroup.username}'s avatar`}
                size="xl"
                className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 to-fuchsia-600 bg-gray-200"
              />
            </div>
            <span
              className="text-xs text-center w-16 truncate"
              title={storyGroup.username}
            >
              {storyGroup.username}
            </span>
          </div>
        ))}
      </div>

      <StoryUpload
        open={showCreateStory}
        onOpenChange={setShowCreateStory}
        onSubmit={onStoryUpload}
      />

      <StoryViewer
        storyGroups={storyGroups}
        initialGroupIndex={selectedGroupIndex}
        open={showStoryViewer}
        onOpenChange={setShowStoryViewer}
      />
    </Card>
  );
}
