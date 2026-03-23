import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { StoryGroup } from '@repo/contracts/stories';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import StoryCarousel from './story-carousel';

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

  useEffect(() => {
    if (open) {
      setCurrentGroupIndex(initialGroupIndex);
    }
  }, [open, initialGroupIndex]);

  const handleGroupChange = (newIndex: number) => {
    if (newIndex >= storyGroups.length) {
      onOpenChange(false);
      return;
    }
    if (newIndex < 0) return;
    setCurrentGroupIndex(newIndex);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const currentGroup = storyGroups[currentGroupIndex];
  if (!currentGroup) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="inset-0! translate-x-0! translate-y-0! max-w-none! w-screen h-screen p-0 bg-black/95 border-none rounded-none gap-0 data-[state=open]:zoom-in-100! data-[state=closed]:zoom-out-100!"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {currentGroup.username}&apos;s story
        </DialogTitle>

        <StoryCarousel
          storyGroups={storyGroups}
          currentGroupIndex={currentGroupIndex}
          onGroupChange={handleGroupChange}
          onClose={handleClose}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
