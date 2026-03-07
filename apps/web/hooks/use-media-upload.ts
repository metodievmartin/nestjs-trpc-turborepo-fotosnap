import { useRef, useState } from 'react';

interface UseMediaUploadOptions {
  onSubmit: (file: File) => Promise<void>;
  onClose: () => void;
}

export function useMediaUpload({ onSubmit, onClose }: UseMediaUploadOptions) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onSubmitRef.current(selectedFile);
      clearSelection();
      onCloseRef.current();
    } catch (err) {
      console.error('Error uploading media', err);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    preview,
    selectedFile,
    isUploading,
    handleFileSelect,
    clearSelection,
    handleUpload,
  };
}