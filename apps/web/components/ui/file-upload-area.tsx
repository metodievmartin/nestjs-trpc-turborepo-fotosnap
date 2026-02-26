import { ImageIcon, Upload, X } from 'lucide-react';
import { ChangeEvent, DragEvent, useRef } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadAreaProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export default function FileUploadArea({
  onFileSelect,
  className = '',
}: PhotoUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {};

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef?.current?.click()}
      className={cn(
        'border-2 border-dashed border-muted-foreground/25 rounded-lg text-center',
        'p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors',
        className
      )}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-medium mb-2">Drag photo here</p>
      <p className="text-sm text-muted-foreground mb-4">
        or click to select from your computer
      </p>
      <Button variant="outline">
        <ImageIcon className="w-4 h-4 mr-2" />
        Select from your computer
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
