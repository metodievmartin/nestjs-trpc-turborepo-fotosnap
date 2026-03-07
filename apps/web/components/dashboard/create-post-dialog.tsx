import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FileUploadArea from '@/components/ui/file-upload-area';
import ImagePreview from '@/components/upload/image-preview';
import UploadDialogFooter from '@/components/upload/upload-dialog-footer';
import { useMediaUpload } from '@/hooks/use-media-upload';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File, caption: string) => Promise<void>;
}

export default function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePostDialogProps) {
  const [caption, setCaption] = useState('');

  const { preview, isUploading, handleFileSelect, clearSelection, handleUpload } =
    useMediaUpload({
      onSubmit: (file) => onSubmit(file, caption.trim()),
      onClose: () => onOpenChange(false),
      onError: (err) => console.error('Failed to create post', err),
    });

  const handleClearSelection = () => {
    clearSelection();
    setCaption('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create new post</DialogTitle>
          <DialogDescription className="sr-only">
            Upload a photo and add a caption to create a new post
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <FileUploadArea onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-4">
            <ImagePreview
              src={preview}
              alt="Preview"
              height={64}
              width={64}
              imageClassName="w-full h-64 object-cover rounded-lg"
              buttonClassName="top-2 right-2"
              onDismiss={handleClearSelection}
            />

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <textarea
                id="caption"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <UploadDialogFooter
              onBack={handleClearSelection}
              onAction={handleUpload}
              isUploading={isUploading}
              actionDisabled={isUploading || !caption.trim()}
              actionLabel="Share"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
