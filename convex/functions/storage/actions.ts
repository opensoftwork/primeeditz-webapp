"use node";

/**
 * Storage URL Generation Action
 *
 * Generates pre-signed URLs for MinIO-stored files.
 * Uses "use node" directive for AWS SDK compatibility.
 */

import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { action, internalAction } from "../../_generated/server";

// Initialize S3 client for MinIO
function getS3Client(): S3Client {
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error("MINIO_ENDPOINT is not configured");
  }

  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
}

function getBucket(): string {
  return process.env.MINIO_BUCKET || "primeeditz-assets";
}

/**
 * Generate a pre-signed URL for a single file.
 * Used for secure, time-limited access to MinIO files.
 */
export const getSignedFileUrl = action({
  args: {
    storageKey: v.string(),
    expiresIn: v.optional(v.number()), // seconds, defaults to 3600 (1 hour)
  },
  handler: async (_ctx, args): Promise<string | null> => {
    if (!args.storageKey) {
      return null;
    }

    try {
      const s3Client = getS3Client();
      const command = new GetObjectCommand({
        Bucket: getBucket(),
        Key: args.storageKey,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: args.expiresIn ?? 3600,
      });

      return signedUrl;
    } catch (error) {
      console.error(
        `Error generating signed URL for ${args.storageKey}:`,
        error,
      );
      return null;
    }
  },
});

/**
 * Generate pre-signed URLs for multiple files.
 * Used for batch URL generation (e.g., reference files).
 */
export const getSignedFileUrls = action({
  args: {
    storageKeys: v.array(v.string()),
    expiresIn: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<Record<string, string | null>> => {
    const results: Record<string, string | null> = {};

    const s3Client = getS3Client();
    const bucket = getBucket();
    const expiresIn = args.expiresIn ?? 3600;

    for (const key of args.storageKeys) {
      if (!key) {
        results[key] = null;
        continue;
      }

      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });

        results[key] = await getSignedUrl(s3Client, command, { expiresIn });
      } catch (error) {
        console.error(`Error generating signed URL for ${key}:`, error);
        results[key] = null;
      }
    }

    return results;
  },
});

/**
 * Generate a pre-signed PUT URL for uploading a small file.
 * Small files (< 100MB) use direct S3 upload for simplicity.
 */
export const generateUploadUrl = action({
  args: {
    fileName: v.string(),
    contentType: v.string(),
    projectId: v.id("projects"),
    folderId: v.optional(v.id("folders")),
    fileSize: v.number(),
  },
  handler: async (ctx, args): Promise<{ url: string; storageKey: string }> => {
    // 1. Verify eligibility using role-agnostic query
    const uploadEligibility = await ctx.runQuery(
      api.functions.projects.queries.getProjectUploadEligibility,
      {
        projectId: args.projectId,
      },
    );

    if (!uploadEligibility?.isAllowed) {
      throw new Error(uploadEligibility?.reason || "Upload not allowed");
    }

    // 2. Storage Limit Check
    const storageStats = await ctx.runQuery(
      api.functions.storage.queries.getProjectStorageUsage,
      {
        projectId: args.projectId,
      },
    );

    if (storageStats.used + args.fileSize > storageStats.allocated) {
      throw new Error(
        `Storage limit reached. Remaining: ${((storageStats.allocated - storageStats.used) / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      );
    }

    // 3. Generate unique storage key
    const timestamp = Date.now();
    const cleanName = args.fileName.replace(/\s+/g, "_");
    const subPath = args.folderId ? `assets/${args.folderId}` : "deliverables";
    const storageKey = `projects/${args.projectId}/${subPath}/${timestamp}_${cleanName}`;

    // 3. Generate pre-signed PUT URL
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: getBucket(),
      Key: storageKey,
      ContentType: args.contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { url, storageKey };
  },
});

/**
 * Get configuration for TUS resumable uploads.
 * Used for large files (> 100MB).
 */
export const getTusConfig = action({
  args: {
    projectId: v.id("projects"),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify eligibility using role-agnostic query
    const uploadEligibility = await ctx.runQuery(
      api.functions.projects.queries.getProjectUploadEligibility,
      {
        projectId: args.projectId,
      },
    );

    if (!uploadEligibility?.isAllowed) {
      throw new Error(uploadEligibility?.reason || "Upload not allowed");
    }

    // Storage Limit Check
    const storageStats = await ctx.runQuery(
      api.functions.storage.queries.getProjectStorageUsage,
      {
        projectId: args.projectId,
      },
    );

    if (storageStats.used + args.fileSize > storageStats.allocated) {
      throw new Error(
        `Storage limit reached. Remaining: ${((storageStats.allocated - storageStats.used) / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      );
    }

    return {
      endpoint: `${process.env.APP_URL}/api/upload/tus`,
      metadata: {
        projectId: args.projectId,
      },
    };
  },
});

/**
 * Delete a file from MinIO storage.
 */
export const deleteFile = action({
  args: {
    storageKey: v.string(),
  },
  handler: async (_ctx, args): Promise<boolean> => {
    if (!args.storageKey) return false;

    try {
      const s3Client = getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: args.storageKey,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${args.storageKey}:`, error);
      return false;
    }
  },
});
