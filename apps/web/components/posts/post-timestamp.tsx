import { formatDistanceToNow } from 'date-fns';

import { cn } from '@/lib/utils';

interface PostTimestampProps {
  timestamp: string | Date;
  className?: string;
}

export function PostTimestamp({ timestamp, className }: PostTimestampProps) {
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      className={cn('block text-xs text-muted-foreground', className)}
    >
      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
    </time>
  );
}
