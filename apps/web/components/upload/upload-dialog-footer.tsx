import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type ReactNode } from 'react';

interface UploadDialogFooterProps {
  onBack: () => void;
  onAction: () => void;
  isUploading: boolean;
  actionDisabled?: boolean;
  actionLabel: ReactNode;
}

export default function UploadDialogFooter({
  onBack,
  onAction,
  isUploading,
  actionDisabled,
  actionLabel,
}: UploadDialogFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onBack} disabled={isUploading}>
        Back
      </Button>
      <Button onClick={onAction} disabled={actionDisabled ?? isUploading}>
        {actionLabel}
      </Button>
    </DialogFooter>
  );
}
