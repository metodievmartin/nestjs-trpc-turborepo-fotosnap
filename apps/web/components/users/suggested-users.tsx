'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { trpc } from '@/lib/trpc/client';
import { authClient, getSessionUsername } from '@/lib/auth/client';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import UserAvatar from '../ui/user-avatar';
import { cn } from '@/lib/utils';
import { useFollowUser } from '@/hooks/use-follow-user';
import { useScrollFades } from '@/hooks/use-scroll-fades';

interface SuggestedUsersProps {
  title?: string;
  className?: string;
}

export function SuggestedUsers({
  title = 'Suggested for you',
  className,
}: SuggestedUsersProps) {
  const { data: session } = authClient.useSession();
  const { data: users, isLoading } = trpc.users.getSuggestedUsers.useQuery();
  const { toggleFollow, pendingUserId } = useFollowUser(
    getSessionUsername(session) ?? '',
    { invalidateOnSuccess: true }
  );

  if (isLoading) {
    return <SuggestedUsersSkeleton title={title} className={className} />;
  }

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <section className={cn(className)}>
      <h2 className="font-semibold text-sm text-muted-foreground mb-4">
        {title}
      </h2>
      <ScrollFadeContainer childCount={users.length}>
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col items-center gap-2.5 p-2 w-32 shrink-0"
          >
            <Link
              href={`/users/${user.username}`}
              className="hover:opacity-80 transition-opacity"
            >
              <UserAvatar src={user.image} alt={user.username} size="xl" />
            </Link>
            <Link
              href={`/users/${user.username}`}
              className="font-semibold text-sm truncate max-w-full hover:opacity-80 transition-opacity"
            >
              {user.username}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFollow(user.id, user.isFollowing)}
              disabled={pendingUserId === user.id}
              className="w-full text-muted-foreground"
            >
              {user.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </div>
        ))}
      </ScrollFadeContainer>
    </section>
  );
}

const FADE =
  'pointer-events-none absolute inset-y-0 w-12 transition-opacity duration-200';

function ScrollFadeContainer({
  children,
  childCount,
}: {
  children: React.ReactNode;
  childCount: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { showLeft, showRight } = useScrollFades(
    containerRef,
    startRef,
    endRef,
    childCount
  );

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide"
      >
        <div ref={startRef} className="shrink-0 w-px" aria-hidden />
        {children}
        <div ref={endRef} className="shrink-0 w-px" aria-hidden />
      </div>
      <div
        className={cn(
          FADE,
          'left-0 bg-gradient-to-r from-background to-transparent',
          showLeft ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          FADE,
          'right-0 bg-gradient-to-l from-background to-transparent',
          showRight ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}

function SuggestedUsersSkeleton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <section className={cn(className)}>
      <h2 className="font-semibold text-sm text-muted-foreground mb-4">
        {title}
      </h2>
      <div className="flex gap-1 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2.5 p-2 w-32 shrink-0"
          >
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}
