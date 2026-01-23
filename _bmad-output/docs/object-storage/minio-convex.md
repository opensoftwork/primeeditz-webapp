# MinIO + Convex Object Storage Integration

## Overview

This document provides comprehensive guidance for integrating **MinIO** with **Convex** for object storage in your application. MinIO is a high-performance, S3-compatible object storage solution that can be self-hosted or deployed on any infrastructure.

> **Why MinIO?**
>
> - 🔒 **Self-hosted**: Full control over your data and infrastructure
> - 💰 **Cost-effective**: No per-request charges, only infrastructure costs
> - 🚀 **High-performance**: Optimized for large files and high throughput
> - 🔄 **S3-compatible**: Works with any S3-compatible SDK

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MinIO Server Setup](#minio-server-setup)
3. [Convex Integration](#convex-integration)
4. [Environment Configuration](#environment-configuration)
5. [Implementation Patterns](#implementation-patterns)
   - [Storage Utilities](#storage-utilities)
   - [Signed URL Generation](#signed-url-generation)
   - [Upload Actions](#upload-actions)
   - [Client-Side Upload Manager](#client-side-upload-manager)
6. [File Upload Strategies](#file-upload-strategies)
   - [Small Files (Pre-signed PUT)](#small-files-pre-signed-put)
   - [Large Files (TUS Resumable)](#large-files-tus-resumable)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Dependencies

```bash
# Install AWS SDK for S3 compatibility
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# For resumable uploads (optional but recommended)
pnpm add tus-js-client
```

### MinIO Server Requirements

- MinIO Server (self-hosted or managed)
- Access Key and Secret Key credentials
- A configured bucket for your application
- CORS policy configured for your frontend domains

---

## MinIO Server Setup

### Option 1: Docker (Development)

```yaml
# docker-compose.yml
version: "3.8"
services:
  minio:
    image: minio/minio:latest
    container_name: minio
    ports:
      - "9000:9000" # API Port
      - "9001:9001" # Console Port
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio_data:
```

Start with:

```bash
docker-compose up -d
```

### Option 2: Linux Binary (Production)

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio

# Create data directory
sudo mkdir -p /data/minio

# Run MinIO
MINIO_ROOT_USER=admin \
MINIO_ROOT_PASSWORD=your-secure-password \
./minio server /data/minio --console-address ":9001"
```

### Option 3: Kubernetes (Production)

```yaml
# minio-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
spec:
  replicas: 1
  selector:
    matchLabels:
      app: minio
  template:
    metadata:
      labels:
        app: minio
    spec:
      containers:
        - name: minio
          image: minio/minio:latest
          args:
            - server
            - /data
            - --console-address
            - ":9001"
          env:
            - name: MINIO_ROOT_USER
              valueFrom:
                secretKeyRef:
                  name: minio-credentials
                  key: root-user
            - name: MINIO_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: minio-credentials
                  key: root-password
          ports:
            - containerPort: 9000
            - containerPort: 9001
          volumeMounts:
            - name: storage
              mountPath: /data
      volumes:
        - name: storage
          persistentVolumeClaim:
            claimName: minio-pvc
```

### Create Bucket and Configure CORS

Access MinIO Console at `http://localhost:9001` and:

1. **Create a bucket** (e.g., `primeeditz-assets`)
2. **Set bucket policy** to allow public read (if needed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::primeeditz-assets/*"]
    }
  ]
}
```

3. **Configure CORS** (Settings → Add CORS Policy):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-meta-*"],
    "MaxAgeSeconds": 3600
  }
]
```

4. **Create Access Keys** (Access Keys → Create access key)
   - Save the Access Key and Secret Key securely

---

## Convex Integration

### Project Structure

```
convex/
├── _generated/
├── lib/
│   └── storageUtils.ts          # URL generation utilities
├── functions/
│   └── storage/
│       ├── actions.ts           # Pre-signed URL generation (Node.js runtime)
│       ├── queries.ts           # Storage usage queries
│       └── cleanup.ts           # Orphan file cleanup
└── schema.ts                    # Database schema with storage fields
```

---

## Environment Configuration

### Convex Environment Variables

Set these in your Convex deployment:

```bash
# Set MinIO credentials in Convex
npx convex env set MINIO_ENDPOINT "https://minio.your-domain.com"
npx convex env set MINIO_REGION "us-east-1"  # Can be any value for MinIO
npx convex env set MINIO_ACCESS_KEY "your-access-key"
npx convex env set MINIO_SECRET_KEY "your-secret-key"
npx convex env set MINIO_BUCKET "primeeditz-assets"

# For TUS uploads (optional)
npx convex env set APP_URL "https://your-app.com"
```

### Local Development (.env.local)

```env
# MinIO Configuration
MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=primeeditz-assets

# App URL for TUS endpoint
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Implementation Patterns

### Storage Utilities

Create a utility file for generating public URLs:

```typescript
// convex/lib/storageUtils.ts

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
export function getMinioPublicUrl(
  storageKey: string | undefined | null,
): string | null {
  if (!storageKey) {
    return null;
  }

  const baseUrl = process.env.MINIO_ENDPOINT;
  const bucket = process.env.MINIO_BUCKET;

  if (!baseUrl) {
    // Fallback: if no endpoint configured, return null
    return null;
  }

  const effectiveBucket = bucket || "primeeditz-assets";

  // Ensure no double slashes
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanStorageKey = storageKey.replace(/^\//, "");

  return `${cleanBaseUrl}/${effectiveBucket}/${cleanStorageKey}`;
}

/**
 * Enrich reference files with public URLs.
 *
 * Transforms referenceFiles array by adding displayUrl field.
 */
export function enrichReferenceFilesWithUrls<
  T extends { storageKey?: string | null; previewUrl?: string | null },
>(files: T[] | undefined): (T & { displayUrl: string | null })[] {
  if (!files) return [];

  return files.map((file) => ({
    ...file,
    displayUrl: getMinioPublicUrl(file.storageKey) || file.previewUrl || null,
  }));
}
```

### Signed URL Generation

Create actions for generating pre-signed URLs (requires Node.js runtime):

```typescript
// convex/functions/storage/actions.ts
"use node";

/**
 * Storage URL Generation Action
 *
 * Generates pre-signed URLs for MinIO-stored files.
 * Uses "use node" directive for AWS SDK compatibility.
 */

import { v } from "convex/values";
import { internalAction, action } from "../../_generated/server";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { api } from "../../_generated/api";

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
    forcePathStyle: true, // Required for MinIO
  });
}

function getBucket(): string {
  return process.env.MINIO_BUCKET || "primeeditz-assets";
}

/**
 * Generate a pre-signed URL for downloading/viewing a single file.
 * Used for secure, time-limited access to MinIO files.
 */
export const getSignedFileUrl = internalAction({
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
 * Used for batch URL generation (e.g., file galleries).
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
 * Generate a pre-signed PUT URL for uploading a file.
 * Includes authorization and storage limit checks.
 */
export const generateUploadUrl = action({
  args: {
    fileName: v.string(),
    contentType: v.string(),
    projectId: v.id("projects"),
    folderId: v.id("folders"),
    fileSize: v.number(),
  },
  handler: async (ctx, args): Promise<{ url: string; storageKey: string }> => {
    // 1. Verify upload eligibility (permissions, project status, etc.)
    const uploadEligibility = await ctx.runQuery(
      api.functions.projects.queries.getProjectUploadEligibility,
      { projectId: args.projectId },
    );

    if (!uploadEligibility?.isAllowed) {
      throw new Error(uploadEligibility?.reason || "Upload not allowed");
    }

    // 2. Storage Limit Check
    const storageStats = await ctx.runQuery(
      api.functions.storage.queries.getProjectStorageUsage,
      { projectId: args.projectId },
    );

    if (storageStats.used + args.fileSize > storageStats.allocated) {
      const remaining =
        (storageStats.allocated - storageStats.used) / (1024 * 1024 * 1024);
      throw new Error(
        `Storage limit reached. Remaining: ${remaining.toFixed(2)} GB`,
      );
    }

    // 3. Generate unique storage key with organized path
    const timestamp = Date.now();
    const cleanName = args.fileName.replace(/\s+/g, "_");
    const storageKey = `projects/${args.projectId}/assets/${args.folderId}/${timestamp}_${cleanName}`;

    // 4. Generate pre-signed PUT URL
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
```

### Client-Side Upload Manager

Create a React hook for managing file uploads:

```typescript
// src/hooks/use-upload-manager.ts
"use client";

import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUploadStore, type UploadItem } from "@/stores/upload-store";
import * as tus from "tus-js-client";
import { toast } from "sonner";
import { type Id } from "@convex/_generated/dataModel";

const SMALL_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

export function useUploadManager() {
  const { updateProgress, updateStatus, removeUpload } = useUploadStore();

  const generateUploadUrlAction = useAction(
    api.functions.storage.actions.generateUploadUrl,
  );
  const getTusConfigAction = useAction(
    api.functions.storage.actions.getTusConfig,
  );
  const createAssetMutation = useMutation(
    api.functions.assets.mutations.createAsset,
  );

  const processUpload = async (id: string, item: UploadItem) => {
    const { file, projectId, folderId } = item;

    try {
      if (file.size < SMALL_FILE_THRESHOLD) {
        // --- SMALL FILE: Pre-signed PUT ---
        await uploadSmallFile(id, file, projectId, folderId);
      } else {
        // --- LARGE FILE: TUS Resumable ---
        await uploadLargeFile(id, file, projectId, folderId);
      }

      updateStatus(id, "completed");
      toast.success(`${file.name} uploaded successfully`);

      // Auto-remove from list after 3 seconds
      setTimeout(() => removeUpload(id), 3000);
    } catch (error: any) {
      console.error(`Upload error for ${file.name}:`, error);
      updateStatus(id, "error", { error: error.message });
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const uploadSmallFile = async (
    id: string,
    file: File,
    projectId: string,
    folderId: string,
  ) => {
    updateStatus(id, "uploading");

    const { url, storageKey } = await generateUploadUrlAction({
      fileName: file.name,
      contentType: file.type,
      projectId: projectId as Id<"projects">,
      folderId: folderId as Id<"folders">,
      fileSize: file.size,
    });

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        updateProgress(id, progress);
      }
    };

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(true);
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
    });

    xhr.send(file);
    await uploadPromise;

    // Create database record
    await createAssetMutation({
      projectId: projectId as Id<"projects">,
      folderId: folderId as Id<"folders">,
      filename: file.name,
      minioKey: storageKey,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  };

  const uploadLargeFile = async (
    id: string,
    file: File,
    projectId: string,
    folderId: string,
  ) => {
    updateStatus(id, "uploading");

    const { endpoint } = await getTusConfigAction({
      projectId: projectId as Id<"projects">,
      fileSize: file.size,
    });

    return new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
          projectId: projectId,
          folderId: folderId,
        },
        onError: (error) => {
          console.error("TUS Error:", error);
          updateStatus(id, "error", { error: error.message });
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const progress = Math.round((bytesUploaded / bytesTotal) * 100);
          updateProgress(id, progress);
        },
        onSuccess: async () => {
          const minioKey = upload.url?.split("/tus/")[1] || "";

          await createAssetMutation({
            projectId: projectId as Id<"projects">,
            folderId: folderId as Id<"folders">,
            filename: file.name,
            minioKey,
            sizeBytes: file.size,
            mimeType: file.type,
          });

          resolve();
        },
      });

      upload.start();
    });
  };

  return {
    processUpload,
  };
}
```

---

## File Upload Strategies

### Small Files (Pre-signed PUT)

For files under 50MB, use direct pre-signed PUT URLs:

```
┌──────────┐     1. Request URL      ┌──────────┐
│  Client  │ ─────────────────────▶ │  Convex  │
│          │ ◀───────────────────── │  Action  │
└──────────┘    2. Pre-signed URL    └──────────┘
      │
      │ 3. PUT file directly
      ▼
┌──────────┐
│  MinIO   │
│  Server  │
└──────────┘
      │
      │ 4. Create asset record
      ▼
┌──────────┐
│  Convex  │
│    DB    │
└──────────┘
```

**Advantages:**

- Simple implementation
- Low latency
- No intermediate server

**Limitations:**

- No resume capability
- Must complete in one request

### Large Files (TUS Resumable)

For files over 50MB, use TUS protocol for resumable uploads:

```
┌──────────┐     1. Get TUS config   ┌──────────┐
│  Client  │ ─────────────────────▶ │  Convex  │
│          │ ◀───────────────────── │  Action  │
└──────────┘    2. TUS endpoint      └──────────┘
      │
      │ 3. Chunked uploads (resumable)
      ▼
┌──────────┐     4. Stream to S3     ┌──────────┐
│   TUS    │ ─────────────────────▶ │  MinIO   │
│  Server  │                         │  Server  │
└──────────┘                         └──────────┘
```

**TUS Server Implementation (Next.js API Route):**

```typescript
// src/app/api/upload/tus/[...params]/route.ts
import { Server } from "@tus/server";
import { S3Store } from "@tus/s3-store";
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const tusServer = new Server({
  path: "/api/upload/tus",
  datastore: new S3Store({
    s3ClientConfig: {
      bucket: process.env.MINIO_BUCKET!,
      region: process.env.MINIO_REGION || "us-east-1",
    },
    client: s3Client,
  }),
  namingFunction: (req, metadata) => {
    const projectId = metadata?.projectId;
    const folderId = metadata?.folderId;
    const filename = metadata?.filename?.replace(/\s+/g, "_");
    const timestamp = Date.now();
    return `projects/${projectId}/assets/${folderId}/${timestamp}_${filename}`;
  },
});

export async function POST(req: Request) {
  return tusServer.handle(req);
}

export async function PATCH(req: Request) {
  return tusServer.handle(req);
}

export async function HEAD(req: Request) {
  return tusServer.handle(req);
}

export async function OPTIONS(req: Request) {
  return tusServer.handle(req);
}

export async function DELETE(req: Request) {
  return tusServer.handle(req);
}
```

---

## Security Best Practices

### 1. Access Control

Always verify user permissions before generating upload URLs:

```typescript
export const generateUploadUrl = action({
  handler: async (ctx, args) => {
    // Verify user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Verify user has access to the project
    const hasAccess = await ctx.runQuery(
      api.functions.projects.queries.checkProjectAccess,
      { projectId: args.projectId, userId: identity.subject },
    );

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    // ... generate URL
  },
});
```

### 2. URL Expiration

Always use short-lived pre-signed URLs:

```typescript
const signedUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 3600, // 1 hour max for uploads
});
```

### 3. Content Type Validation

Validate file types on both client and server:

```typescript
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
];

if (!ALLOWED_TYPES.includes(args.contentType)) {
  throw new Error("File type not allowed");
}
```

### 4. Storage Limits

Enforce per-project storage quotas:

```typescript
const storageStats = await ctx.runQuery(
  api.functions.storage.queries.getProjectStorageUsage,
  { projectId: args.projectId },
);

if (storageStats.used + args.fileSize > storageStats.allocated) {
  throw new Error("Storage limit exceeded");
}
```

### 5. Orphan Cleanup

Schedule cleanup of orphaned files:

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "cleanup orphaned files",
  { hourUTC: 2, minuteUTC: 0 },
  internal.functions.storage.cleanup.removeOrphanedFiles,
);

export default crons;
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** Browser console shows CORS errors when uploading.

**Solution:** Ensure MinIO CORS policy includes your frontend origin:

```json
{
  "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"]
}
```

#### 2. Access Denied (403)

**Symptom:** Uploads fail with 403 Forbidden.

**Causes:**

- Invalid credentials
- Bucket policy doesn't allow PUT operations
- Pre-signed URL expired

**Solution:** Verify credentials and bucket policy in MinIO console.

#### 3. "MINIO_ENDPOINT is not configured"

**Symptom:** Actions fail with missing endpoint error.

**Solution:** Set environment variable in Convex:

```bash
npx convex env set MINIO_ENDPOINT "https://your-minio-server.com"
```

#### 4. Files Upload but Can't Be Viewed

**Symptom:** Files exist in MinIO but return 403 when accessed.

**Solutions:**

- Make bucket public (for public assets)
- Use pre-signed GET URLs for private files
- Check bucket policy allows GetObject

#### 5. Large File Uploads Timeout

**Symptom:** Files over 100MB fail partway through.

**Solution:** Use TUS resumable uploads instead of direct PUT.

### Debug Logging

Enable debug logging for uploads:

```typescript
function getS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
    logger: console, // Enable debug logging
  });
}
```

---

## Quick Reference

| Environment Variable | Description                      | Example                     |
| -------------------- | -------------------------------- | --------------------------- |
| `MINIO_ENDPOINT`     | MinIO server URL                 | `https://minio.example.com` |
| `MINIO_REGION`       | AWS region (any value for MinIO) | `us-east-1`                 |
| `MINIO_ACCESS_KEY`   | Access key ID                    | `myaccesskey`               |
| `MINIO_SECRET_KEY`   | Secret access key                | `mysecretkey`               |
| `MINIO_BUCKET`       | Bucket name                      | `primeeditz-assets`         |

---

## See Also

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [TUS Resumable Uploads](https://tus.io/)
- [Convex File Storage](https://docs.convex.dev/file-storage)
