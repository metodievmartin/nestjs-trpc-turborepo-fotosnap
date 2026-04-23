import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import UserAvatar from '../ui/user-avatar';
import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import StoryUploadDialog from '@/components/dashboard/story-upload-dialog';
import { StoryViewer } from '@/components/dashboard/story-viewer';

import { useCreateStory } from '@/hooks/use-create-story';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

type ViewerState =
  | { kind: 'closed' }
  | { kind: 'own' }
  | { kind: 'feed'; index: number };

export default function Stories() {
  const { data: ownStoryGroup } = trpc.stories.getOwnStories.useQuery();
  const feedStoriesQuery = trpc.feed.getStoryFeed.useInfiniteQuery(
    {},
    {
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialCursor: undefined,
    }
  );
  const usersStoryGroups =
    feedStoriesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const { createStory } = useCreateStory();
  const { data: session } = authClient.useSession();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [viewer, setViewer] = useState<ViewerState>({ kind: 'closed' });

  const stripRef = useRef<HTMLDivElement | null>(null);
  const stripSentinelRef = useInfiniteScroll({
    hasNextPage: feedStoriesQuery.hasNextPage,
    isFetchingNextPage: feedStoriesQuery.isFetchingNextPage,
    fetchNextPage: feedStoriesQuery.fetchNextPage,
    root: stripRef,
    rootMargin: '0px 200px 0px 0px',
  });

  return (
    <div className="border-b py-4">
      <div
        ref={stripRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide"
      >
        <div className="flex flex-col items-center space-y-1 shrink-0">
          <div className="relative">
            <div
              className={`p-0.5 rounded-full ${ownStoryGroup ? 'bg-linear-to-tr from-yellow-400 to-fuchsia-600' : 'bg-gray-200'}`}
            >
              <button
                onClick={() => {
                  if (ownStoryGroup) {
                    setViewer({ kind: 'own' });
                  }
                }}
                className="block cursor-pointer"
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

        {usersStoryGroups.map((storyGroup, index) => (
          <div
            key={storyGroup.userId}
            className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer"
            onClick={() => setViewer({ kind: 'feed', index })}
          >
            <div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 to-fuchsia-600">
              <UserAvatar
                src={storyGroup.avatar}
                alt={`${storyGroup.username}'s avatar`}
                size="xl"
                className="border-2 border-white"
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

        <div ref={stripSentinelRef} aria-hidden="true" className="shrink-0" />
      </div>

      <StoryUploadDialog
        open={showCreateStory}
        onOpenChange={setShowCreateStory}
        onSubmit={createStory}
      />

      {viewer.kind !== 'closed' && (
        <StoryViewer
          storyGroups={
            viewer.kind === 'own' ? [ownStoryGroup!] : usersStoryGroups
          }
          initialGroupIndex={viewer.kind === 'feed' ? viewer.index : 0}
          open
          onOpenChange={() => setViewer({ kind: 'closed' })}
          {...(viewer.kind === 'feed' && {
            hasNextPage: feedStoriesQuery.hasNextPage,
            isFetchingNextPage: feedStoriesQuery.isFetchingNextPage,
            fetchNextPage: feedStoriesQuery.fetchNextPage,
          })}
        />
      )}
    </div>
  );
}
