'use client';

import {
  forwardRef,
  SyntheticEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

export interface CommentFormHandle {
  focus: () => void;
}

interface CommentFormProps {
  onAddComment: (text: string) => void;
  borderless?: boolean;
}

const CommentForm = forwardRef<CommentFormHandle, CommentFormProps>(
  ({ onAddComment, borderless = false }, ref) => {
    const [commentText, setCommentText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const handleSubmit = (e: SyntheticEvent) => {
      e.preventDefault();

      if (commentText.trim()) {
        onAddComment(commentText);
        setCommentText('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className={
            borderless
              ? 'flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent dark:bg-transparent px-0 text-sm'
              : 'flex-1'
          }
        />
        <Button
          type="submit"
          disabled={!commentText.trim()}
          variant={borderless ? 'ghost' : 'default'}
          className={
            borderless
              ? 'text-primary font-semibold text-sm p-0 h-auto hover:bg-transparent disabled:opacity-30'
              : ''
          }
        >
          Post
        </Button>
      </form>
    );
  }
);

CommentForm.displayName = 'CommentForm';

export default CommentForm;
