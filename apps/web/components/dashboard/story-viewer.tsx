import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { StoryGroup } from '@repo/contracts/stories';

import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';
import { getImageUrl } from '@/lib/media';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import StoryProgressBar from './story-progress-bar';

const STORY_DURATION_MS = 5000;

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  open: boolean;
  initialGroupIndex: number;
  onOpenChange: (open: boolean) => void;
}

export function StoryViewer({
  storyGroups,
  open,
  onOpenChange,
  initialGroupIndex,
}: StoryViewerProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  const handleNext = () => {
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setCurrentStoryIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentGroupIndex(initialGroupIndex);
      setCurrentStoryIndex(0);
    }
  }, [open, initialGroupIndex]);

  const getBarState = (index: number) => {
    if (index < currentStoryIndex) return 'completed' as const;
    if (index === currentStoryIndex) return 'active' as const;
    return 'upcoming' as const;
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!currentGroup || !currentStory) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md! w-full h-[90vh] p-0 overflow-hidden bg-black"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {currentGroup.username}&apos;s story
        </DialogTitle>

        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
            {currentGroup.stories.map((_, index) => (
              <StoryProgressBar
                key={index}
                state={getBarState(index)}
                duration={STORY_DURATION_MS}
                paused={paused}
                onComplete={handleNext}
              />
            ))}
          </div>

          <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2">
            <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <UserAvatar
                src={currentGroup.avatar}
                alt={currentGroup.username}
                size="sm"
                className="border-2 border-white"
              />
              <div>
                <div className="text-white font-semibold text-sm">
                  {currentGroup.username}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            className="relative w-full h-full"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            <Image
              src={getImageUrl(currentStory.image)}
              alt="Story"
              fill
              className="object-contain"
            />
          </div>

          {(currentGroupIndex > 0 || currentStoryIndex > 0) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
