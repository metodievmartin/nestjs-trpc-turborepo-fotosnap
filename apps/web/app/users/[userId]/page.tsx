'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';

import {
  FollowersFollowingModal,
  type FollowListType,
} from '@/components/users/followers-following-modal';
import { useFollowUser } from '@/hooks/use-follow-user';
import { PostModal } from '@/components/users/post-modal';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import ProfileHeader from '@/components/users/profile-header';
import { ProfileTabs } from '@/components/users/profile-tabs';
import { ProfileNavigation } from '@/components/users/profile-navigation';
import { EditProfileModal } from '@/components/dashboard/edit-profile-modal';

interface FollowModalState {
  open: boolean;
  type: FollowListType;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [followModal, setFollowModal] = useState<FollowModalState>({
    open: false,
    type: 'followers',
  });
  const { data: session } = authClient.useSession();
  const { data: posts = [] } = trpc.posts.findAll.useQuery({ userId });
  const { data: profile, isLoading } = trpc.users.getUserProfile.useQuery({
    userId,
  });
  const { toggleFollow, isPending: isFollowPending } = useFollowUser(userId, {
    invalidateOnSuccess: true,
  });

  const {
    updateProfile,
    isPending: isUpdateProfilePending,
    error: updateProfileError,
  } = useUpdateProfile(userId, () => setIsEditProfileOpen(false));

  const handleFollowToggle = () => {
    if (!profile) return;
    toggleFollow(profile.id, profile.isFollowing);
  };

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;

  const handlePostClick = (post: { id: number }) => {
    setSelectedPostId(post.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">This user doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileNavigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader
          profile={profile}
          onFollowToggle={handleFollowToggle}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onOpenFollowers={() =>
            setFollowModal({ open: true, type: 'followers' })
          }
          onOpenFollowing={() =>
            setFollowModal({ open: true, type: 'following' })
          }
          isFollowLoading={isFollowPending}
          isOwnProfile={session?.user.id === profile.id}
        />

        <ProfileTabs
          userPosts={posts}
          savedPosts={[]}
          name={profile.name}
          onPostClick={handlePostClick}
        />
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          open={!!selectedPostId}
          onOpenChange={(open) => {
            if (!open) setSelectedPostId(null);
          }}
        />
      )}

      <EditProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        onSave={updateProfile}
        isPending={isUpdateProfilePending}
        error={updateProfileError}
      />

      <FollowersFollowingModal
        open={followModal.open}
        onOpenChange={(open) => {
          setFollowModal({ ...followModal, open });
        }}
        userId={userId}
        type={followModal.type}
      />
    </div>
  );
}
