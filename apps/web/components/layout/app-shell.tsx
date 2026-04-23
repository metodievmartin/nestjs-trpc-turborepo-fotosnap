'use client';

import { useState, type ReactNode } from 'react';

import { useNavItems } from '@/hooks/use-nav-items';
import MobileNav from '@/components/layout/mobile-nav';
import DesktopSidebar from '@/components/layout/desktop-sidebar';
import { useCreatePost } from '@/features/posts/hooks/use-create-post';
import { CreatePostDialog } from '@/features/posts/components/create-post-dialog';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { createPost } = useCreatePost();
  const { items, profileItem } = useNavItems({
    actions: {
      'create-post': () => setShowCreatePost(true),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar items={items} profileItem={profileItem} />

      <div className="md:pl-[72px] pb-16 md:pb-0">
        <main>{children}</main>
      </div>

      <MobileNav items={items} profileItem={profileItem} />

      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={createPost}
      />
    </div>
  );
}
