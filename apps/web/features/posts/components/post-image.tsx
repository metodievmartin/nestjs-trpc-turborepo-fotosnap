import Image from 'next/image';

import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/media';

interface PostImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}

export function PostImage({ src, alt, sizes, className }: PostImageProps) {
  return (
    <div className={cn('relative aspect-square', className)}>
      <Image
        src={getImageUrl(src)}
        alt={alt}
        fill
        className="object-contain"
        sizes={sizes}
      />
    </div>
  );
}
