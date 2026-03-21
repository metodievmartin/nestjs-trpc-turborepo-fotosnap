'use client';

import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { PostDetail } from '../posts/post-detail';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

interface PostModalProps {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostModal({ postId, open, onOpenChange }: PostModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="max-w-7xl! w-full h-[90vh] p-0 overflow-visible!"
      >
        <DialogTitle className="sr-only">Post</DialogTitle>
        <div className="flex flex-col overflow-hidden rounded-lg h-full">
          <PostDetail postId={postId} />
        </div>
        <DialogPrimitive.Close className="absolute -top-10 right-0 rounded-full p-1.5 text-white/80 hover:text-white transition-opacity cursor-pointer">
          <XIcon className="size-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogContent>
    </Dialog>
  );
}
