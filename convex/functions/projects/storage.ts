"use node";

/**
 * Storage Actions for Projects
 * 
 * Handles MinIO signed URL generation for file uploads.
 * Uses "use node" directive for AWS SDK compatibility.
 */

import { v } from 'convex/values'
import { action } from '../../_generated/server'
import { api } from '../../_generated/api'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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

/**
 * Generate a signed upload URL for project assets.
 * Path format: [clientName]/[projectCode]/[fileName]
 */
export const generateUploadUrl = action({
  args: {
    projectId: v.id('projects'),
    fileName: v.string(),
    fileType: v.string(),
  },
  returns: v.object({
    uploadUrl: v.string(),
    storageKey: v.string(),
  }),
  handler: async (ctx, args): Promise<{ uploadUrl: string; storageKey: string }> => {
    // 1. Get current user's profile
    const profile = await ctx.runQuery(api.profiles.getMyProfile)
    
    if (!profile) {
      throw new Error('Not authenticated')
    }

    if (profile.role !== 'client') {
      throw new Error('Access denied')
    }

    // 2. Get project and verify ownership
    const project = await ctx.runQuery(api.functions.projects.queries.getProject, {
      projectId: args.projectId,
    })

    if (!project) {
      throw new Error('Project not found')
    }

    if (project.clientId !== profile._id) {
      throw new Error('Access denied')
    }

    // 3. Prepare the storage key
    const clientName: string = profile.name.replace(/\s+/g, '_').toLowerCase()
    const projectCode: string = project.code.toLowerCase()
    const sanitizedFileName: string = args.fileName.replace(/\s+/g, '_')
    const storageKey: string = `${clientName}/${projectCode}/${sanitizedFileName}`

    // 4. Generate signed URL
    const s3Client: S3Client = getS3Client()
    const command = new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET!,
      Key: storageKey,
      ContentType: args.fileType,
    })

    const uploadUrl: string = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return { uploadUrl, storageKey }
  },
})
