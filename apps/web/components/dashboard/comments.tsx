'use client';

import { Comment } from '@repo/contracts/comments';

import CommentList from './comment-list';
import CommentForm from './comment-form';

interface CommentsProps {
  comments: Comment[];
  currentUserId?: string;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: number) => void;
}

export default function Comments({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
}: CommentsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <CommentList
          comments={comments}
          currentUserId={currentUserId}
          onDeleteComment={onDeleteComment}
        />
      </div>

      <CommentForm onAddComment={onAddComment} />
    </div>
  );
}