'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import UserAvatar from '@/components/ui/user-avatar';
import type { ResolvedNavItem, ProfileNavItem } from '@/hooks/use-nav-items';

interface MobileNavProps {
  items: ResolvedNavItem[];
  profileItem: ProfileNavItem;
}

export default function MobileNav({ items, profileItem }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          if ('onClick' in item) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center p-2 cursor-pointer"
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex flex-col items-center p-2"
            >
              <Icon className="h-6 w-6" />
              {item.active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
              )}
            </Link>
          );
        })}

        {/* Profile */}
        <Link
          href={profileItem.href}
          className="relative flex flex-col items-center p-2"
        >
          <UserAvatar
            src={profileItem.image}
            alt="Profile"
            size="sm"
            className="w-7 h-7"
          />
          {profileItem.active && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
          )}
        </Link>
      </div>
    </nav>
  );
}
