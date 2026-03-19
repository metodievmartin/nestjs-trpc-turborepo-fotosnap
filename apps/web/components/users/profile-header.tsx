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
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  isFollowLoading: boolean;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  profile,
  onFollowToggle,
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  isFollowLoading,
  isOwnProfile,
}: ProfileHeaderProps) {
  const { logout } = useLogout();
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative">
        <UserAvatar
          src={profile.image}
          alt={profile.name}
          size="2xl"
          className="shrink-0 border-2"
        />

        {isOwnProfile && (
          <div className="absolute top-0 right-0">
            <ThemeToggle variant="ghost" />
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div className="flex sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-normal">{profile.name}</h1>
            <div className="flex gap-2">
              {!isOwnProfile && (
                <Button
                  onClick={onFollowToggle}
                  disabled={isFollowLoading}
                  variant={profile.isFollowing ? 'outline' : 'default'}
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

          <div className="flex gap-8 text-sm">
            <div>
              <span className="font-semibold">{profile.postCount}</span>{' '}
              <span className="text-muted-foreground">posts</span>
            </div>
            <Button
              variant="ghost"
              onClick={onOpenFollowers}
              className="h-auto p-0"
            >
              <span className="font-semibold">{profile.followerCount}</span>{' '}
              <span className="text-muted-foreground">followers</span>
            </Button>
            <Button
              variant="ghost"
              onClick={onOpenFollowing}
              className="h-auto p-0"
            >
              <span className="font-semibold">{profile.followingCount}</span>{' '}
              <span className="text-muted-foreground">following</span>
            </Button>
          </div>

          <div className="space-y-1">
            {profile.bio && (
              <div className="text-sm whitespace-pre-wrap">{profile.bio}</div>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
