import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/media';

const sizes = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', pixels: 32 },
  md: { container: 'w-12 h-12', icon: 'w-5 h-5', pixels: 48 },
  lg: { container: 'w-14 h-14', icon: 'w-6 h-6', pixels: 56 },
  xl: { container: 'w-16 h-16', icon: 'w-7 h-7', pixels: 64 },
  '2xl': { container: 'w-32 h-32', icon: 'w-16 h-16', pixels: 128 },
};

interface UserAvatarProps extends React.ComponentPropsWithoutRef<'div'> {
  src: string | null | undefined;
  alt: string;
  size?: keyof typeof sizes;
  iconClassName?: string;
}

export default function UserAvatar({
  src,
  alt,
  size = 'sm',
  iconClassName,
  className,
  ...props
}: UserAvatarProps) {
  const { container, icon, pixels } = sizes[size];
  const imageUrl = getImageUrl(src);

  return (
    <div className={cn(container, 'rounded-full', className)} {...props}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          width={pixels}
          height={pixels}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
          <User className={cn(icon, 'text-muted-foreground', iconClassName)} />
        </div>
      )}
    </div>
  );
}
