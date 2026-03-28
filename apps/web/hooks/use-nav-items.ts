'use client';

import { usePathname } from 'next/navigation';

import { authClient, getSessionUsername } from '@/lib/auth/client';
import { navItems, type NavAction, type NavItem } from '@/lib/navigation';
import type { LucideIcon } from 'lucide-react';

/** Nav item after resolving actions to onClick handlers and computing active state. */
export type ResolvedNavItem =
  | {
      id: string;
      icon: LucideIcon;
      label: string;
      href: string;
      active: boolean;
    }
  | {
      id: string;
      icon: LucideIcon;
      label: string;
      onClick: () => void;
      active: boolean;
    };

/** Profile nav item — separated because it uses an avatar instead of an icon. */
export interface ProfileNavItem {
  label: string;
  href: string;
  active: boolean;
  image: string | null | undefined;
}

// Every NavAction must have a corresponding handler — enforced at compile time.
type ActionHandlers = Record<NavAction, () => void>;

function isLinkItem(item: NavItem): item is NavItem & { href: string } {
  return 'href' in item;
}

function isActive(item: NavItem, pathname: string): boolean {
  if (!isLinkItem(item) || item.href === '#') return false;
  if (item.href === '/') return pathname === '/';
  return pathname.startsWith(item.href);
}

function toId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Resolves static nav config into renderable items.
 * Enriches each item with active state (from pathname) and onClick handlers
 * (from the actions map). Both DesktopSidebar and MobileNav consume the output.
 */
export function useNavItems({ actions }: { actions: ActionHandlers }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const username = getSessionUsername(session);

  const items: ResolvedNavItem[] = navItems.map((item) => {
    const base = {
      id: toId(item.label),
      icon: item.icon,
      label: item.label,
      active: isActive(item, pathname),
    };

    if (isLinkItem(item)) {
      return { ...base, href: item.href };
    }

    return { ...base, onClick: actions[item.action] };
  });

  const profileItem: ProfileNavItem = {
    label: 'Profile',
    href: username ? `/users/${username}` : '#',
    active:
      !!username &&
      (pathname === `/users/${username}` ||
        pathname.startsWith(`/users/${username}/`)),
    image: session?.user.image,
  };

  return { items, profileItem };
}
