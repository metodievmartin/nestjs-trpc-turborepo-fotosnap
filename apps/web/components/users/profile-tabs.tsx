import { Bookmark, Grid } from 'lucide-react';

import { Post } from '@repo/contracts/posts';

import EmptyState from './empty-state';
import { PostsGrid } from '@/components/users/post-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ProfileTabsProps {
  userPosts: Post[];
  savedPosts: Post[];
  name: string;
  onPostClick: (post: Post) => void;
}

export function ProfileTabs({
  userPosts,
  savedPosts,
  name,
  onPostClick,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-t">
        <TabsTrigger value="posts" className="gap-2">
          <Grid className="h-4 w-4" />
          POSTS
        </TabsTrigger>
        <TabsTrigger value="saved" className="gap-2">
          <Bookmark className="h-4 w-4" />
          SAVED
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        {userPosts.length === 0 ? (
          <EmptyState
            icon={Grid}
            title="No Posts Yet"
            description={`When ${name} shares photos, they'll appear here`}
          />
        ) : (
          <PostsGrid posts={userPosts} onPostClick={onPostClick} />
        )}
      </TabsContent>
      <TabsContent value="saved" className="mt-6">
        {savedPosts.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No Saved Posts"
            description={`Save photos and videos to see them here`}
          />
        ) : (
          <PostsGrid posts={savedPosts} onPostClick={onPostClick} />
        )}
      </TabsContent>
    </Tabs>
  );
}
