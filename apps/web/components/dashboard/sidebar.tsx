'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LogOut } from 'lucide-react';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';
import { authClient } from '@/lib/auth/client';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import AvatarUploadDialog from '@/components/dashboard/avatar-upload-dialog';
import { useUpdateAvatar } from '@/hooks/use-update-avatar';

interface SuggestedUser {
  id: string;
  username: string;
  avatar: string;
  followedBy: string;
}

const mockSuggestions: SuggestedUser[] = [
  {
    id: '1',
    username: 'alexsmith',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    followedBy: 'johndoe',
  },
  {
    id: '2',
    username: 'sarahwilson',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    followedBy: 'janedoe',
  },
  {
    id: '3',
    username: 'mikejohnson',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    followedBy: 'photographer',
  },
  {
    id: '4',
    username: 'emilydavis',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    followedBy: 'photographer',
  },
  {
    id: '5',
    username: 'davidbrown',
    avatar:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop&crop=face',
    followedBy: 'traveler',
  },
];

export default function Sidebar() {
  const { data: session } = authClient.useSession();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { updateAvatar } = useUpdateAvatar();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <UserAvatar
              src={session?.user.image}
              alt="Your profile"
              size="lg"
            />

            <Button
              variant="ghost"
              size="icon"
              title="Change avatar"
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/90 cursor-pointer"
            >
              <Camera className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{session?.user.email}</div>
            <div className="text-sm text-muted-foreground truncate">
              {session?.user.name}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-muted-foreground">
            Suggestions for you
          </h3>
        </div>

        <div className="space-y-3">
          {mockSuggestions.map((user) => (
            <div key={user.id} className="flex items-center space-x-3">
              <Image
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full"
                width={40}
                height={40}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{user.username}</div>
                {user.followedBy && (
                  <div className="text-xs text-muted-foreground">
                    Followed by {user.followedBy}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/90 text-xs cursor-pointer"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <AvatarUploadDialog
        open={showAvatarModal}
        onOpenChange={setShowAvatarModal}
        onSubmit={updateAvatar}
        currentAvatar={session?.user.image}
      />
    </div>
  );
}
