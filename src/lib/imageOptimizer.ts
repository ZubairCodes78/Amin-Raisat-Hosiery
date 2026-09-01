/**
 * Client-side Image Optimizer for Supabase Storage Uploads
 * Resizes large images to max 1600px width and converts them to WebP (or compressed JPEG).
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  quality?: number;
  maxSizeBytes?: number;
}

export async function optimizeImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    quality = 0.82,
    maxSizeBytes = 5 * 1024 * 1024, // 5 MB
  } = options;

  // Validate image file type
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload a valid image (JPG, PNG, WEBP, etc.).');
  }

  // If already WebP and small enough, return as is
  if (file.type === 'image/webp' && file.size <= maxSizeBytes) {
    // Still check dimensions if needed, but if it's already WebP and < 1MB we can optimize or return
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get 2D canvas context for image optimization.'));
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export to WebP (falling back to image/jpeg if webp fails)
        const exportFormat = 'image/webp';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas image compression failed.'));
            }

            if (blob.size > maxSizeBytes) {
              return reject(
                new Error(
                  `Optimized image size (${(blob.size / (1024 * 1024)).toFixed(
                    1
                  )}MB) exceeds the maximum limit of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`
                )
              );
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            const newFileName = `${cleanName}.webp`;
            const optimizedFile = new File([blob], newFileName, {
              type: exportFormat,
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          exportFormat,
          quality
        );
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Image optimization failed.'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file for optimization. The file may be corrupt.'));
    };

    img.src = objectUrl;
  });
}
