import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '7xl';
  className?: string;
  children: ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '7xl': 'max-w-7xl',
} as const;

export function PageContainer({
  maxWidth = '4xl',
  className,
  children,
}: PageContainerProps) {
  return (
    <div
      className={cn(maxWidthClasses[maxWidth], 'mx-auto px-4 py-6', className)}
    >
      {children}
    </div>
  );
}
