import { useCallback, useEffect, useSyncExternalStore, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { StoryGroup } from '@repo/contracts/stories';

import { Button } from '../ui/button';
import StoryCard, { StoryCardHandle } from './story-card';

const CARD_WIDTH = 400;
const CARD_GAP = 16;
const INACTIVE_SCALE = 0.4;
const INACTIVE_OPACITY = 0.5;

const MOBILE_BREAKPOINT = 768;

const subscribeToResize = (cb: () => void) => {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
};
const getViewportWidth = () => window.innerWidth;
const getViewportWidthServer = () => 1024;

interface StoryCarouselProps {
  storyGroups: StoryGroup[];
  currentGroupIndex: number;
  onGroupChange: (index: number) => void;
  onClose: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => unknown;
}

export default function StoryCarousel({
  storyGroups,
  currentGroupIndex,
  onGroupChange,
  onClose,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: StoryCarouselProps) {
  const viewportWidth = useSyncExternalStore(
    subscribeToResize,
    getViewportWidth,
    getViewportWidthServer
  );
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;

  const directionRef = useRef<'forward' | 'backward'>('forward');
  const activeCardRef = useRef<StoryCardHandle>(null);
  const touchStartX = useRef<number>(0);
  const wasSwiped = useRef(false);
  const groupIndexRef = useRef(currentGroupIndex);
  groupIndexRef.current = currentGroupIndex;

  const cardWidth = isMobile ? viewportWidth : CARD_WIDTH;

  const translateX =
    viewportWidth / 2 -
    currentGroupIndex * (cardWidth + CARD_GAP) -
    cardWidth / 2;

  const handleGroupNav = useCallback(
    (newIndex: number) => {
      directionRef.current =
        newIndex > currentGroupIndex ? 'forward' : 'backward';
      onGroupChange(newIndex);
    },
    [currentGroupIndex, onGroupChange]
  );

  // Prefetch the next page of story groups when the viewer advances near
  // the end, so auto-advance never hits a wall unless the server is done.
  useEffect(() => {
    if (!fetchNextPage || !hasNextPage || isFetchingNextPage) return;
    if (currentGroupIndex >= storyGroups.length - 2) {
      fetchNextPage();
    }
  }, [
    currentGroupIndex,
    storyGroups.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        activeCardRef.current?.handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        activeCardRef.current?.handlePrevious();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="relative w-full h-full flex items-center overflow-hidden"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? 0;
        wasSwiped.current = false;
      }}
      onTouchEnd={(e) => {
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        if (delta > 50 && currentGroupIndex > 0) {
          wasSwiped.current = true;
          handleGroupNav(currentGroupIndex - 1);
        } else if (delta < -50 && currentGroupIndex < storyGroups.length - 1) {
          wasSwiped.current = true;
          handleGroupNav(currentGroupIndex + 1);
        }
      }}
    >
      {/* Track */}
      <div
        className="flex items-center"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: 'transform 400ms ease',
          gap: `${CARD_GAP}px`,
        }}
      >
        {storyGroups.map((group, index) => {
          const isActive = index === currentGroupIndex;
          const scale = isActive ? 1 : isMobile ? 0 : INACTIVE_SCALE;
          const opacity = isActive ? 1 : isMobile ? 0 : INACTIVE_OPACITY;

          return (
            <div
              key={group.userId}
              className="relative shrink-0 overflow-hidden"
              style={{
                width: `${cardWidth}px`,
                height: '90vh',
                borderRadius: '12px',
                transform: `scale(${scale})`,
                opacity,
                zIndex: isActive ? 10 : 1,
                transition: 'transform 400ms ease, opacity 400ms ease',
                cursor: isActive ? 'default' : 'pointer',
              }}
              onClick={!isActive ? () => handleGroupNav(index) : undefined}
            >
              <StoryCard
                ref={isActive ? activeCardRef : undefined}
                storyGroup={group}
                isActive={isActive}
                isMobile={isMobile}
                startFromEnd={isActive && directionRef.current === 'backward'}
                swipedRef={wasSwiped}
                onComplete={() => {
                  if (groupIndexRef.current >= storyGroups.length - 1) {
                    onClose();
                  } else {
                    handleGroupNav(groupIndexRef.current + 1);
                  }
                }}
                onPreviousGroup={() => {
                  if (groupIndexRef.current > 0) {
                    handleGroupNav(groupIndexRef.current - 1);
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Arrows — desktop only, just outside the active card */}
      {!isMobile && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => activeCardRef.current?.handlePrevious()}
            className="absolute top-1/2 -translate-y-1/2 z-30 text-white bg-black/50 hover:bg-black/70 transition-colors"
            style={{ left: `calc(50% - ${cardWidth / 2 + 48}px)` }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => activeCardRef.current?.handleNext()}
            className="absolute top-1/2 -translate-y-1/2 z-30 text-white bg-black/50 hover:bg-black/70 transition-colors"
            style={{ right: `calc(50% - ${cardWidth / 2 + 48}px)` }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}
    </div>
  );
}
