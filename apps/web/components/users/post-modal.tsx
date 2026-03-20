'use client';

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
        className="max-w-7xl! w-full h-[90vh] p-0 overflow-hidden flex flex-col"
      >
        <DialogTitle className="sr-only">Post</DialogTitle>
        <PostDetail postId={postId} />
      </DialogContent>
    </Dialog>
  );
}
