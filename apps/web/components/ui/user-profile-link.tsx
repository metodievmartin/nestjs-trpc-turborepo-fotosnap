import Link from 'next/link';

import { cn } from '@/lib/utils';
import UserAvatar from './user-avatar';

type AvatarSize = React.ComponentProps<typeof UserAvatar>['size'];

interface UserProfileLinkProps {
  userId: string;
  username: string;
  avatar?: string | null;
  avatarSize?: AvatarSize;
  avatarClassName?: string;
  className?: string;
}

export default function UserProfileLink({
  userId,
  username,
  avatar,
  avatarSize = 'sm',
  avatarClassName,
  className,
}: UserProfileLinkProps) {
  return (
    <Link
      href={`/users/${userId}`}
      className={cn(
        'flex items-center gap-3 hover:opacity-80 transition-opacity',
        className
      )}
    >
      <UserAvatar
        src={avatar}
        alt={username}
        size={avatarSize}
        className={avatarClassName}
      />
      <span className="font-semibold text-sm">{username}</span>
    </Link>
  );
}