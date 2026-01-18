/**
 * Image compression utility for profile images
 * Resizes and compresses images to WebP format for optimal MongoDB storage
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.7,
  format: "webp",
};

/**
 * Compresses an image file and returns a Base64 string
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<string> - Compressed Base64 string
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxWidth = opts.maxWidth!;
        const maxHeight = opts.maxHeight!;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to specified format
        const mimeType = `image/${opts.format}`;
        const base64 = canvas.toDataURL(mimeType, opts.quality);

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Gets the approximate size of a Base64 string in KB
 * @param base64 - The Base64 string
 * @returns number - Size in KB
 */
export const getBase64SizeKB = (base64: string): number => {
  // Remove data URL prefix if present
  const base64Data = base64.split(",")[1] || base64;
  // Base64 encoding increases size by ~33%, so we calculate original size
  const sizeInBytes = (base64Data.length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
};

/**
 * Validates if a string is a valid Base64 image
 * @param base64 - The string to validate
 * @returns boolean
 */
export const isValidBase64Image = (base64: string | null): boolean => {
  if (!base64) return false;
  return base64.startsWith("data:image/");
};
