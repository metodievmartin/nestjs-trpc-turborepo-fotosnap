import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ImagePreview } from '@/components/common/image-preview';
import { FileUploadArea } from '@/components/common/file-upload-area';
import { UploadDialogFooter } from '@/components/common/upload-dialog-footer';
import { useMediaUpload } from '@/hooks/use-media-upload';

interface StoryUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => Promise<void>;
}

export default function StoryUploadDialog({
  open,
  onOpenChange,
  onSubmit,
}: StoryUploadProps) {
  const {
    preview,
    isUploading,
    handleFileSelect,
    clearSelection,
    handleUpload,
  } = useMediaUpload({
    onSubmit,
    onClose: () => onOpenChange(false),
    onError: (err) => console.error('Failed to upload story', err),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to your story</DialogTitle>
          <DialogDescription className="sr-only">
            Upload a photo to share to your story
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <FileUploadArea onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-4">
            <ImagePreview
              src={preview}
              height={64}
              width={64}
              imageClassName="w-full h-96 object-cover rounded-lg"
              buttonClassName="top-2 right-2"
              onDismiss={clearSelection}
            />

            <UploadDialogFooter
              onBack={clearSelection}
              onAction={handleUpload}
              isUploading={isUploading}
              actionLabel="Share to Story"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
