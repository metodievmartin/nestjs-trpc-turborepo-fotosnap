import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import FileUploadArea from '../ui/file-upload-area';
import ImagePreview from '@/components/upload/image-preview';
import UploadDialogFooter from '@/components/upload/upload-dialog-footer';
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
  } = useMediaUpload({ onSubmit, onClose: () => onOpenChange(false) });

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
