import { Home, Search, PlusSquare, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Register new actions here — TypeScript will enforce handlers in AppShell.
export const navActions = ['create-post'] as const;
export type NavAction = (typeof navActions)[number];

// A nav item is either a link (href) or an action trigger — mutually exclusive
// to prevent invalid states like having both or neither.
export type NavItem =
  | { icon: LucideIcon; label: string; href: string }
  | { icon: LucideIcon; label: string; action: NavAction };

export const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Explore', href: '/explore' },
  { icon: PlusSquare, label: 'Create', action: 'create-post' },
  { icon: Heart, label: 'Notifications', href: '#' },
];
