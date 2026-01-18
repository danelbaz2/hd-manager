import { useState, useRef } from "react";
import { compressImage } from "../../../../../utils/imageCompression";

export interface UseImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

export interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isCompressing: boolean;
  handleImageClick: () => void;
  handleImageChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64: string) => void,
    onError: (message: string) => void,
    onInvalidFile: (message: string) => void
  ) => Promise<void>;
}

const defaultOptions: UseImageUploadOptions = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.7,
  format: "webp",
};

/**
 * Custom hook for handling image upload with compression
 */
export const useImageUpload = (
  options: UseImageUploadOptions = {}
): UseImageUploadReturn => {
  const mergedOptions = { ...defaultOptions, ...options };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64: string) => void,
    onError: (message: string) => void,
    onInvalidFile: (message: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onInvalidFile("נא לבחור קובץ תמונה בלבד");
      return;
    }

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file, {
        maxWidth: mergedOptions.maxWidth,
        maxHeight: mergedOptions.maxHeight,
        quality: mergedOptions.quality,
        format: mergedOptions.format,
      });

      onSuccess(compressedBase64);
    } catch (error) {
      console.error("Failed to compress image:", error);
      onError("שגיאה בעיבוד התמונה, נסה שוב");
    } finally {
      setIsCompressing(false);
    }
  };

  return {
    fileInputRef,
    isCompressing,
    handleImageClick,
    handleImageChange,
  };
};

export default useImageUpload;
