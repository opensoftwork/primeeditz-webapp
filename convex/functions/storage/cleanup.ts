"use node";

import { v } from 'convex/values'
import { action, internalAction } from '../../_generated/server'
import { api, internal } from '../../_generated/api'
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3'

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

/**
 * Cleanup project storage by deleting multiple objects from MinIO.
 */
export const cleanupProjectStorage = action({
  args: {
    fileKeys: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    if (args.fileKeys.length === 0) {
      return { success: true, deletedCount: 0 }
    }

    try {
      const s3Client = getS3Client()
      const bucket = process.env.MINIO_BUCKET || 'primeeditz-assets'

      // S3 DeleteObjects supports up to 1000 keys per call
      // For simplicity, we'll assume the list is within this limit or handle in batches if needed.
      // Here we implement basic batching if keys > 1000.
      
      const batches = []
      for (let i = 0; i < args.fileKeys.length; i += 1000) {
        batches.push(args.fileKeys.slice(i, i + 1000))
      }

      let deletedCount = 0
      for (const batch of batches) {
        const command = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: true,
          },
        })

        const response = await s3Client.send(command)
        deletedCount += response.Deleted?.length ?? 0
      }

      console.log(`Successfully deleted ${deletedCount} objects from MinIO`)
      return { success: true, deletedCount }
    } catch (error) {
      console.error('Error cleaning up MinIO storage:', error)
      // We don't throw here to avoid blocking the caller, 
      // but we return the error state.
      return { success: false, error: String(error) }
    }
  },
})

/**
 * Automatically purge projects the have been in trash for > 30 days.
 * This is called by a weekly/daily cron.
 */
export const purgeExpiredTrash = internalAction({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; count: number; objectsDeleted: number }> => {
    // 1. Get expired projects
    const expiredProjects: any[] = await ctx.runQuery(internal.admin.internalGetExpiredTrash)

    if (expiredProjects.length === 0) {
      return { success: true, count: 0, objectsDeleted: 0 }
    }

    console.log(`Found ${expiredProjects.length} expired projects in trash. Starting cleanup...`)

    let totalDeleted = 0
    for (const project of expiredProjects) {
      try {
        // 2. Run permanent delete (collects keys and deletes DB records)
        const { fileKeys } = await ctx.runMutation(
          api.functions.projects.mutations.permanentlyDeleteProject,
          { projectId: project._id }
        )

        // 3. Delete from MinIO
        if (fileKeys && fileKeys.length > 0) {
          const cleanupRes = await ctx.runAction(
            internal.functions.storage.cleanup.cleanupProjectStorageInternal,
            { fileKeys }
          )
          if (cleanupRes.success) {
            totalDeleted += cleanupRes.deletedCount ?? 0
          }
        }
      } catch (error) {
        console.error(`Failed to purge project ${project.code}:`, error)
      }
    }

    return { success: true, count: expiredProjects.length, objectsDeleted: totalDeleted }
  },
})

/**
 * Internal version of cleanupProjectStorage for cron usage.
 */
export const cleanupProjectStorageInternal = internalAction({
  args: {
    fileKeys: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    // Reuse the same logic as the public action
    // In a real project you'd refactor the common logic into a helper
    // For now we just call the same logic
    
    if (args.fileKeys.length === 0) {
      return { success: true, deletedCount: 0 }
    }

    try {
      const s3Client = getS3Client()
      const bucket = process.env.MINIO_BUCKET || 'primeeditz-assets'
      
      const batches = []
      for (let i = 0; i < args.fileKeys.length; i += 1000) {
        batches.push(args.fileKeys.slice(i, i + 1000))
      }

      let deletedCount = 0
      for (const batch of batches) {
        const command = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: true,
          },
        })

        const response = await s3Client.send(command)
        deletedCount += response.Deleted?.length ?? 0
      }

      return { success: true, deletedCount }
    } catch (error) {
      console.error('Error in internal storage cleanup:', error)
      return { success: false, error: String(error) }
    }
  },
})
