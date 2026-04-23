import { cn } from '@/lib/utils';

interface PostLikesCountProps {
  likes: number;
  className?: string;
}

export function PostLikesCount({ likes, className }: PostLikesCountProps) {
  return (
    <p className={cn('font-semibold text-sm', className)}>
      {likes.toLocaleString()} likes
    </p>
  );
}
