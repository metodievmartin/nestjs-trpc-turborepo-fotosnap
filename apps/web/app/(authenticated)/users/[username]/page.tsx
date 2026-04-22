'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';

import { useFollowUser } from '@/hooks/use-follow-user';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useUpdateAvatar } from '@/hooks/use-update-avatar';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import ProfileHeader from '@/components/users/profile-header';
import { ProfileTabs } from '@/components/users/profile-tabs';
import { PostModal } from '@/components/users/post-modal';
import { EditProfileModal } from '@/components/dashboard/edit-profile-modal';
import AvatarUploadDialog from '@/components/dashboard/avatar-upload-dialog';
import { PageContainer } from '@/components/layout/page-container';
import { ProfilePageSkeleton } from '@/components/users/profile-page-skeleton';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const { data: session } = authClient.useSession();
  const { data: profile, isLoading } = trpc.users.getUserByUsername.useQuery({
    username,
  });

  const userId = profile?.id;
  const isOwnProfile = session?.user.id === profile?.id;

  const postsQuery = trpc.posts.findAll.useInfiniteQuery(
    { userId: userId ?? '', limit: 12 },
    {
      enabled: !!userId,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialCursor: undefined,
    }
  );
  const posts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const postsSentinelRef = useInfiniteScroll({
    hasNextPage: postsQuery.hasNextPage,
    isFetchingNextPage: postsQuery.isFetchingNextPage,
    fetchNextPage: postsQuery.fetchNextPage,
    rootMargin: '400px 0px',
  });
  const { toggleFollow, isPending: isFollowPending } = useFollowUser(username, {
    invalidateOnSuccess: true,
  });

  const {
    updateProfile,
    isPending: isUpdateProfilePending,
    error: updateProfileError,
  } = useUpdateProfile(username, {
    onSuccess: () => setIsEditProfileOpen(false),
    onUsernameChange: (newUsername) => router.replace(`/users/${newUsername}`),
  });
  const { updateAvatar } = useUpdateAvatar(username);

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
          <p className="text-muted-foreground">This user doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader
        profile={profile}
        onFollowToggle={handleFollowToggle}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onChangePhoto={() => setIsAvatarUploadOpen(true)}
        isFollowLoading={isFollowPending}
        isOwnProfile={isOwnProfile}
      />

      <ProfileTabs
        userPosts={posts}
        savedPosts={[]}
        username={profile.username}
        isOwnProfile={isOwnProfile}
        onPostClick={(post) => setSelectedPostId(post.id)}
        postsFooter={
          <>
            <div ref={postsSentinelRef} aria-hidden="true" />
            {postsQuery.isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        }
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

      <AvatarUploadDialog
        open={isAvatarUploadOpen}
        onOpenChange={setIsAvatarUploadOpen}
        onSubmit={updateAvatar}
        currentAvatar={session?.user.image}
      />
    </PageContainer>
  );
}
