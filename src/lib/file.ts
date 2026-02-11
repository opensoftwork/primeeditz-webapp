/**
 * File utilities
 */

/**
 * Format file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns File extension without dot (e.g., "pdf")
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

/**
 * Check if a file is an image based on MIME type
 * @param mimeType - MIME type string
 * @returns True if the file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Check if a file is a video based on MIME type
 * @param mimeType - MIME type string
 * @returns True if the file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}
