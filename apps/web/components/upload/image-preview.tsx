import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  height: number;
  width: number;
  imageClassName?: string;
  buttonClassName?: string;
  onDismiss: () => void;
}

export default function ImagePreview({
  src,
  alt = 'Preview',
  height,
  width,
  imageClassName,
  buttonClassName,
  onDismiss,
}: ImagePreviewProps) {
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        height={height}
        width={width}
        className={imageClassName}
      />
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'absolute bg-black/50 text-white hover:bg-black/70',
          buttonClassName
        )}
        onClick={onDismiss}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
