import { Edit, Globe, Settings } from 'lucide-react';

import { UserProfile } from '@repo/contracts/users';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';

interface ProfileHeaderProps {
  profile: UserProfile;
  onFollowToggle: () => void;
  onEditProfile: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  isFollowLoading: boolean;
}

export default function ProfileHeader({
  profile,
  onFollowToggle,
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  isFollowLoading,
}: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        <UserAvatar src={profile.image} alt={profile.name} size="2xl" className="shrink-0 border-2" />

        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-2xl font-normal">{profile.name}</h1>
            <div className="flex gap-2">
              <Button
                onClick={onFollowToggle}
                disabled={isFollowLoading}
                variant={profile.isFollowing ? 'outline' : 'default'}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEditProfile}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
