const MAX_IMAGE_BYTES = 300 * 1024;
const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.82;

/** Resize/compress large images before upload to speed up saves. */
export async function compressImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= MAX_IMAGE_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", IMAGE_QUALITY);
  });

  return blob && blob.size < file.size ? blob : file;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
