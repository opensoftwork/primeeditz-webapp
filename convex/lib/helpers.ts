/**
 * Convex Helper Utilities
 *
 * Utility functions for common operations across functions.
 */

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate a unique code with prefix and padded number.
 *
 * @param prefix - Code prefix (e.g., "PRJ", "QUO")
 * @param sequence - Sequential number
 * @param padding - Number of digits (default: 6)
 * @returns Formatted code (e.g., "PRJ-000001")
 *
 * @example
 * generateCode("PRJ", 1) // "PRJ-000001"
 * generateCode("QUO", 42, 4) // "QUO-0042"
 */
export function generateCode(
  prefix: string,
  sequence: number,
  padding: number = 6,
): string {
  const paddedNumber = String(sequence).padStart(padding, "0");
  return `${prefix}-${paddedNumber}`;
}

// ============================================================================
// Timestamp Helpers
// ============================================================================

/**
 * Get current timestamp in milliseconds.
 * Use this for `updatedAt` and similar fields.
 */
export function now(): number {
  return Date.now();
}

/**
 * Format a timestamp to ISO date string.
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

/**
 * Format a timestamp to ISO datetime string.
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Check if a timestamp is in the past.
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Check if a timestamp is in the future.
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > Date.now();
}

/**
 * Add days to current time.
 */
export function daysFromNow(days: number): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

// ============================================================================
// String Helpers
// ============================================================================

/**
 * Slugify a string for use in URLs or paths.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// ============================================================================
// Storage Helpers
// ============================================================================

/**
 * Convert bytes to human-readable format.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}

/**
 * Convert GB to bytes.
 */
export function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}

/**
 * Convert bytes to GB.
 */
export function bytesToGb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a string is a valid email.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid phone number (basic check).
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}
