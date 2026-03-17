'use client';

import { useParams } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';
import { ProfileNavigation } from '@/components/users/profile-navigation';
import { useState } from 'react';
import ProfileHeader from '@/components/users/profile-header';
import { ProfileTabs } from '@/components/users/profile-tabs';
import { PostModal } from '@/components/users/post-modal';
import { EditProfileModal } from '@/components/dashboard/edit-profile-modal';
import { useUpdateProfile } from '@/hooks/use-update-profile';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [followersFollowingModal, setFollowersFollowingModal] = useState<{
    open: boolean;
    type: 'followers' | 'following';
  }>({
    open: false,
    type: 'followers',
  });
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.users.getUserProfile.useQuery({
    userId,
  });

  const { data: posts = [] } = trpc.posts.findAll.useQuery({
    userId,
  });

  const unfollowMutation = trpc.users.unfollow.useMutation({
    onSuccess: () => {
      utils.users.getUserProfile.invalidate({ userId });
    },
  });

  const followMutation = trpc.users.follow.useMutation({
    onSuccess: () => {
      utils.users.getUserProfile.invalidate({ userId });
    },
  });

  const {
    updateProfile,
    isPending: isUpdateProfilePending,
    error: updateProfileError,
  } = useUpdateProfile(userId, () => setIsEditProfileOpen(false));

  const handleFollowToggle = () => {
    if (!profile) {
      return;
    }
    if (profile?.isFollowing) {
      unfollowMutation.mutate({ userId: profile.id });
    } else {
      followMutation.mutate({ userId: profile.id });
    }
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
            setFollowersFollowingModal({ open: true, type: 'followers' })
          }
          onOpenFollowing={() =>
            setFollowersFollowingModal({ open: true, type: 'following' })
          }
          isFollowLoading={
            followMutation.isPending || unfollowMutation.isPending
          }
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
    </div>
  );
}
