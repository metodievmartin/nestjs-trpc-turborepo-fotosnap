import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getImageUrl } from '@/lib/media';
import FileUploadArea from '@/components/ui/file-upload-area';
import ImagePreview from '@/components/upload/image-preview';
import UploadDialogFooter from '@/components/upload/upload-dialog-footer';
import { useMediaUpload } from '@/hooks/use-media-upload';

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => Promise<void>;
  currentAvatar?: string | null;
}

export default function AvatarUploadDialog({
  open,
  onOpenChange,
  onSubmit,
  currentAvatar,
}: AvatarUploadProps) {
  const { preview, isUploading, handleFileSelect, clearSelection, handleUpload } =
    useMediaUpload({
      onSubmit,
      onClose: () => onOpenChange(false),
      onError: (err) => console.error('Failed to update avatar', err),
    });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      clearSelection();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription className="sr-only">
            Upload a new profile picture
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className="space-y-4">
            {currentAvatar && (
              <div className="flex justify-center">
                <Image
                  src={getImageUrl(currentAvatar)}
                  alt="Current avatar"
                  height={96}
                  width={96}
                  className="w-24 h-24 rounded-full object-cover border-2 border-muted"
                />
              </div>
            )}
            <FileUploadArea onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImagePreview
                src={preview}
                height={128}
                width={128}
                imageClassName="w-32 h-32 rounded-full object-cover border-2 border-primary"
                buttonClassName="-top-2 -right-2 rounded-full p-2"
                onDismiss={clearSelection}
              />
            </div>

            <UploadDialogFooter
              onBack={clearSelection}
              onAction={handleUpload}
              isUploading={isUploading}
              actionLabel={isUploading ? 'Updating...' : 'Update avatar'}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
