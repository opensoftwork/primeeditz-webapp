"use node";

/**
 * Storage Actions for Projects
 * 
 * Handles MinIO signed URL generation for file uploads.
 * Uses "use node" directive for AWS SDK compatibility.
 */

import { v, ConvexError } from 'convex/values'
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
      throw new ConvexError('Not authenticated')
    }

    // 2. Get project and verify access
    // Use internalGetProject to avoid role-restriction wrappers on the query itself
    const project = await ctx.runQuery(api.functions.projects.queries.internalGetProject, {
      projectId: args.projectId,
    })

    if (!project) {
      throw new ConvexError('Project not found')
    }

    // Role-based access control
    if (profile.role === 'client') {
      // Clients can only upload to their own projects
      if (project.clientId !== profile._id) {
        throw new ConvexError('Access denied: You do not own this project')
      }
    } else if (profile.role !== 'admin' && profile.role !== 'employee') {
      // Only staff and clients can upload (rejects unknown roles)
      throw new ConvexError('Access denied: Insufficient permissions')
    }

    // 3. Prepare the storage key
    // We want the folder structure to be [clientName]/[projectCode]/[fileName]
    // If uploader is admin/employee, we should still use the project's client name if available
    let clientFolderName = 'internal'

    if (project.clientId) {
      const projectClient = await ctx.runQuery(api.profiles.getProfileById, {
        profileId: project.clientId
      })
      if (projectClient) {
        clientFolderName = projectClient.name
      }
    } else if (profile.role === 'client') {
      clientFolderName = profile.name
    }

    const clientName: string = clientFolderName.replace(/\s+/g, '_').toLowerCase()
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
