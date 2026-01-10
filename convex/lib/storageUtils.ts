/**
 * MinIO URL Utilities for Convex
 * 
 * Functions to generate public URLs for MinIO-stored files.
 * Used across queries to return proper displayable URLs.
 */

/**
 * Generate a public MinIO URL from a storage key.
 * 
 * Uses MINIO_ENDPOINT environment variable (same as upload config).
 * Format: {MINIO_ENDPOINT}/{BUCKET}/{storageKey}
 * 
 * @param storageKey - The key path in MinIO (e.g., "client_name/project_code/file.jpg")
 * @returns The full public URL or null if MinIO is not configured
 */
export function getMinioPublicUrl(storageKey: string | undefined | null): string | null {
  if (!storageKey) {
    return null;
  }

  const baseUrl = process.env.MINIO_ENDPOINT;
  const bucket = process.env.MINIO_BUCKET;

  if (!baseUrl) {
    // Fallback: if no endpoint configured, return null
    return null;
  }

  const effectiveBucket = bucket || 'primeeditz-assets';

  // Ensure no double slashes
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanStorageKey = storageKey.replace(/^\//, '');

  return `${cleanBaseUrl}/${effectiveBucket}/${cleanStorageKey}`;
}

/**
 * Enrich reference files with public URLs.
 * 
 * Transforms referenceFiles array by adding displayUrl field.
 */
export function enrichReferenceFilesWithUrls<T extends { storageKey?: string | null; previewUrl?: string | null }>(
  files: T[] | undefined
): (T & { displayUrl: string | null })[] {
  if (!files) return [];

  return files.map((file) => ({
    ...file,
    displayUrl: getMinioPublicUrl(file.storageKey) || file.previewUrl || null,
  }));
}
