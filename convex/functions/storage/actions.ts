"use node";

/**
 * Storage URL Generation Action
 * 
 * Generates pre-signed URLs for MinIO-stored files.
 * Uses "use node" directive for AWS SDK compatibility.
 */

import { v } from 'convex/values'
import { internalAction, action } from '../../_generated/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client for MinIO
function getS3Client(): S3Client {
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error('MINIO_ENDPOINT is not configured')
  }

  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: process.env.MINIO_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  })
}

function getBucket(): string {
  return process.env.MINIO_BUCKET || 'primeeditz-assets'
}

/**
 * Generate a pre-signed URL for a single file.
 * Used for secure, time-limited access to MinIO files.
 */
export const getSignedFileUrl = internalAction({
  args: {
    storageKey: v.string(),
    expiresIn: v.optional(v.number()), // seconds, defaults to 3600 (1 hour)
  },
  handler: async (_ctx, args): Promise<string | null> => {
    if (!args.storageKey) {
      return null
    }

    try {
      const s3Client = getS3Client()
      const command = new GetObjectCommand({
        Bucket: getBucket(),
        Key: args.storageKey,
      })

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: args.expiresIn ?? 3600,
      })

      return signedUrl
    } catch (error) {
      console.error(`Error generating signed URL for ${args.storageKey}:`, error)
      return null
    }
  },
})

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
    const results: Record<string, string | null> = {}

    const s3Client = getS3Client()
    const bucket = getBucket()
    const expiresIn = args.expiresIn ?? 3600

    for (const key of args.storageKeys) {
      if (!key) {
        results[key] = null
        continue
      }

      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        })

        results[key] = await getSignedUrl(s3Client, command, { expiresIn })
      } catch (error) {
        console.error(`Error generating signed URL for ${key}:`, error)
        results[key] = null
      }
    }

    return results
  },
})
