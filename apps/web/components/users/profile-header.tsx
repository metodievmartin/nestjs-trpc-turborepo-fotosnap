import Link from 'next/link';
import { Edit, Globe, LogOut, Settings } from 'lucide-react';

import { UserProfile } from '@repo/contracts/users';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useLogout } from '@/hooks/use-logout';

interface ProfileHeaderProps {
  profile: UserProfile;
  onFollowToggle: () => void;
  onEditProfile: () => void;
  isFollowLoading: boolean;
  isOwnProfile: boolean;
}

function Bio({ bio, website }: { bio?: string | null; website?: string | null }) {
  if (!bio && !website) return null;

  return (
    <div className="space-y-2">
      {bio && <div className="text-sm whitespace-pre-wrap">{bio}</div>}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <Globe className="h-3 w-3" />
          {website}
        </a>
      )}
    </div>
  );
}

export default function ProfileHeader({
  profile,
  onFollowToggle,
  onEditProfile,
  isFollowLoading,
  isOwnProfile,
}: ProfileHeaderProps) {
  const { logout } = useLogout();

  return (
    <div className="relative mb-8">
      <div className="md:hidden absolute top-0 right-0">
        <ThemeToggle variant="ghost" />
      </div>

      <div className="flex flex-row gap-6 md:gap-8 items-center">
        <UserAvatar
          src={profile.image}
          alt={profile.name}
          size="xl"
          className="shrink-0 border-2 md:w-32 md:h-32"
          iconClassName="md:w-12 md:h-12"
        />

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-normal truncate">
              {profile.name}
            </h1>
            <div className="flex gap-2 shrink-0">
              {!isOwnProfile && (
                <Button
                  onClick={onFollowToggle}
                  disabled={isFollowLoading}
                  variant={profile.isFollowing ? 'outline' : 'default'}
                  size="sm"
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}

              {isOwnProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                    >
                      <Settings className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEditProfile}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex gap-6 md:gap-8 text-sm">
            <div>
              <span className="font-semibold">{profile.postCount}</span>{' '}
              <span className="text-muted-foreground">posts</span>
            </div>
            <Link
              href={`/users/${profile.id}/followers`}
              className="hover:opacity-80"
            >
              <span className="font-semibold">{profile.followerCount}</span>{' '}
              <span className="text-muted-foreground">followers</span>
            </Link>
            <Link
              href={`/users/${profile.id}/following`}
              className="hover:opacity-80"
            >
              <span className="font-semibold">{profile.followingCount}</span>{' '}
              <span className="text-muted-foreground">following</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <Bio bio={profile.bio} website={profile.website} />
          </div>
        </div>
      </div>

      {/* Bio below on mobile — avoids cramping the horizontal layout */}
      <div className="mt-4 md:hidden">
        <Bio bio={profile.bio} website={profile.website} />
      </div>
    </div>
  );
}
