'use client';

import Link from 'next/link';
import { Aperture, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-logout';
import UserAvatar from '@/components/ui/user-avatar';
import type { ResolvedNavItem, ProfileNavItem } from '@/hooks/use-nav-items';

interface DesktopSidebarProps {
  items: ResolvedNavItem[];
  profileItem: ProfileNavItem;
}

export default function DesktopSidebar({
  items,
  profileItem,
}: DesktopSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { logout } = useLogout();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-full border-r bg-background',
        'md:flex md:flex-col',
        'w-[72px] hover:w-[220px] transition-all duration-200 group/sidebar'
      )}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center px-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 -ml-0.5"
        >
          <Aperture className="h-7 w-7 shrink-0" />
          <span className="text-lg font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            FotoSnap
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-stretch justify-center space-y-1 px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          if ('onClick' in item) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors cursor-pointer',
                  'hover:bg-accent'
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                item.active ? 'font-bold' : 'hover:bg-accent'
              )}
            >
              {item.active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-foreground" />
              )}
              <Icon className="h-6 w-6 shrink-0" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile */}
        <Link
          href={profileItem.href}
          className={cn(
            'relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
            profileItem.active ? 'font-bold' : 'hover:bg-accent'
          )}
        >
          {profileItem.active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-foreground" />
          )}
          <UserAvatar
            src={profileItem.image}
            alt="Profile"
            size="sm"
            className="w-7 h-7 shrink-0 -ml-0.5"
          />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {profileItem.label}
          </span>
        </Link>
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1 px-3 py-4 border-t">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors cursor-pointer"
        >
          <Sun className="h-6 w-6 shrink-0 dark:hidden" />
          <Moon className="h-6 w-6 shrink-0 hidden dark:block" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Switch theme
          </span>
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-colors cursor-pointer"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}
