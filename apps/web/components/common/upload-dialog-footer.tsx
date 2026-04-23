import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface UploadDialogFooterProps {
  onBack: () => void;
  onAction: () => void;
  isUploading: boolean;
  actionDisabled?: boolean;
  actionLabel: ReactNode;
}

export function UploadDialogFooter({
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
