import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject, Ref } from 'react';
import { Pause, Play } from 'lucide-react';

import { StoryGroup } from '@repo/contracts/stories';

import { Button } from '../ui/button';
import { getImageUrl } from '@/lib/media';
import UserProfileLink from '../ui/user-profile-link';
import StoryProgressBar from './story-progress-bar';

const STORY_DURATION_MS = 5000;

export interface StoryCardHandle {
  handleNext: () => void;
  handlePrevious: () => void;
}

interface StoryCardProps {
  ref?: Ref<StoryCardHandle>;
  storyGroup: StoryGroup;
  isActive: boolean;
  isMobile?: boolean;
  startFromEnd?: boolean;
  swipedRef?: MutableRefObject<boolean>;
  onComplete: () => void;
  onPreviousGroup: () => void;
}

export default function StoryCard({
  ref,
  storyGroup,
  isActive,
  isMobile,
  startFromEnd,
  swipedRef,
  onComplete,
  onPreviousGroup,
}: StoryCardProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const holdingRef = useRef(false);
  const wasHoldRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onPreviousGroupRef = useRef(onPreviousGroup);
  onPreviousGroupRef.current = onPreviousGroup;

  const currentStory = storyGroup.stories[currentStoryIndex];

  const indexRef = useRef(0);
  indexRef.current = currentStoryIndex;

  const handleNext = useCallback(() => {
    if (indexRef.current < storyGroup.stories.length - 1) {
      setCurrentStoryIndex(indexRef.current + 1);
    } else {
      onCompleteRef.current();
    }
  }, [storyGroup.stories.length]);

  const handlePrevious = useCallback(() => {
    if (indexRef.current > 0) {
      setCurrentStoryIndex(indexRef.current - 1);
    } else {
      onPreviousGroupRef.current();
    }
  }, []);

  useImperativeHandle(ref, () => ({ handleNext, handlePrevious }), [
    handleNext,
    handlePrevious,
  ]);

  useEffect(() => {
    if (isActive) {
      setCurrentStoryIndex(startFromEnd ? storyGroup.stories.length - 1 : 0);
      setPaused(false);
    }
  }, [isActive, startFromEnd, storyGroup.stories.length]);

  const getBarState = (index: number) => {
    if (index < currentStoryIndex) return 'completed' as const;
    if (index === currentStoryIndex) return 'active' as const;
    return 'upcoming' as const;
  };

  const onHoldStart = isMobile
    ? () => {
        holdingRef.current = true;
        wasHoldRef.current = false;
        setTimeout(() => {
          if (holdingRef.current) {
            wasHoldRef.current = true;
            setPaused(true);
          }
        }, 150);
      }
    : undefined;

  const onHoldEnd = isMobile
    ? () => {
        holdingRef.current = false;
        setPaused(false);
      }
    : undefined;

  // Inactive card: static preview
  if (!isActive) {
    return (
      <div className="relative w-full h-full pointer-events-none">
        <Image
          src={getImageUrl(storyGroup.stories[0]?.image ?? '')}
          alt={`${storyGroup.username}'s story`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="text-white text-sm font-semibold">
            {storyGroup.username}
          </span>
        </div>
      </div>
    );
  }

  // Active card: full interactive
  if (!currentStory) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 h-28 z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {storyGroup.stories.map((_, index) => (
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
        <UserProfileLink
          userId={storyGroup.userId}
          username={storyGroup.username}
          avatar={storyGroup.avatar}
          avatarClassName="border-2 border-white"
          className="text-white"
        />
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaused((p) => !p)}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            {paused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <div className="relative w-full h-full">
        <Image
          src={getImageUrl(currentStory.image)}
          alt="Story"
          fill
          className="object-contain"
        />

        {/* Tap zones — left half goes back, right half goes forward */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer"
          onClick={() => {
            if (swipedRef?.current || wasHoldRef.current) {
              wasHoldRef.current = false;
              return;
            }
            handlePrevious();
          }}
          onPointerDown={onHoldStart}
          onPointerUp={onHoldEnd}
          onPointerLeave={onHoldEnd}
          onPointerCancel={onHoldEnd}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer"
          onClick={() => {
            if (swipedRef?.current || wasHoldRef.current) {
              wasHoldRef.current = false;
              return;
            }
            handleNext();
          }}
          onPointerDown={onHoldStart}
          onPointerUp={onHoldEnd}
          onPointerLeave={onHoldEnd}
          onPointerCancel={onHoldEnd}
        />
      </div>
    </div>
  );
}
