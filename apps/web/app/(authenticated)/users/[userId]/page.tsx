'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';

import { useFollowUser } from '@/hooks/use-follow-user';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import ProfileHeader from '@/components/users/profile-header';
import { ProfileTabs } from '@/components/users/profile-tabs';
import { PostModal } from '@/components/users/post-modal';
import { EditProfileModal } from '@/components/dashboard/edit-profile-modal';
import { ProfilePageSkeleton } from '@/components/users/profile-page-skeleton';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
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

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">
            This user doesn&apos;t exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ProfileHeader
        profile={profile}
        onFollowToggle={handleFollowToggle}
        onEditProfile={() => setIsEditProfileOpen(true)}
        isFollowLoading={isFollowPending}
        isOwnProfile={session?.user.id === profile.id}
      />

      <ProfileTabs
        userPosts={posts}
        savedPosts={[]}
        name={profile.name}
        onPostClick={(post) => setSelectedPostId(post.id)}
      />

      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
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
