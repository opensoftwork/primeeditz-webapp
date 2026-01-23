# Garage + Convex Object Storage Integration

## Overview

This document provides comprehensive guidance for integrating **Garage** with **Convex** for object storage in your application. Garage is a lightweight, self-hosted, S3-compatible distributed object storage system developed by Deuxfleurs.

> **Why Garage?**
>
> - 🪶 **Lightweight**: Minimal resource footprint, single binary deployment
> - 🔄 **S3-compatible**: Works with any S3-compatible SDK
> - 🌐 **Distributed**: Built for geo-distributed deployments across multiple zones
> - 🔒 **Self-hosted**: Complete control over your data infrastructure
> - 🆓 **Open Source**: AGPL-3.0 licensed, community-driven

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Garage Server Setup](#garage-server-setup)
   - [Binary Installation](#option-1-binary-installation-development)
   - [Docker Deployment](#option-2-docker-development--production)
   - [Docker Compose](#option-3-docker-compose-production)
3. [Initial Configuration](#initial-configuration)
   - [Create Cluster Layout](#create-cluster-layout)
   - [Create Buckets and Keys](#create-buckets-and-keys)
4. [Convex Integration](#convex-integration)
5. [Environment Configuration](#environment-configuration)
6. [Implementation Patterns](#implementation-patterns)
   - [Storage Utilities](#storage-utilities)
   - [Signed URL Generation](#signed-url-generation)
   - [Upload Actions](#upload-actions)
   - [Client-Side Upload Manager](#client-side-upload-manager)
7. [File Upload Strategies](#file-upload-strategies)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Garage vs Other S3 Solutions](#garage-vs-other-s3-solutions)

---

## Prerequisites

### Required Dependencies

```bash
# Install AWS SDK for S3 compatibility
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# For resumable uploads (optional but recommended)
pnpm add tus-js-client
```

### Garage Server Requirements

- Garage binary or Docker image
- Storage space for metadata (SSD recommended) and data (HDD acceptable)
- Network connectivity between nodes (for distributed setup)
- Open ports: 3900 (S3 API), 3901 (RPC), 3902 (Web), 3903 (Admin)

---

## Garage Server Setup

### Option 1: Binary Installation (Development)

```bash
# Download latest Garage binary from https://garagehq.deuxfleurs.fr/download/
wget https://garagehq.deuxfleurs.fr/download/v1.1.0/x86_64-unknown-linux-musl/garage
chmod +x garage

# Move to PATH
sudo mv garage /usr/local/bin/

# Verify installation
garage --version
```

### Create Configuration File

```bash
# Generate configuration with secure secrets
cat > garage.toml <<EOF
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"
rpc_secret = "$(openssl rand -hex 32)"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web.garage.localhost"
index = "index.html"

[k2v_api]
api_bind_addr = "[::]:3904"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "$(openssl rand -base64 32)"
metrics_token = "$(openssl rand -base64 32)"
EOF

# Move to standard location
sudo mv garage.toml /etc/garage.toml
```

### Start Garage Server

```bash
# Create data directories
sudo mkdir -p /var/lib/garage/meta /var/lib/garage/data

# Start server
garage server

# Or run as background service
garage server &
```

### Option 2: Docker (Development / Production)

```bash
# Pull the latest stable image
docker pull dxflrs/garage:v1.1.0

# Run with host networking
docker run \
  -d \
  --name garaged \
  --restart always \
  --network host \
  -v /etc/garage.toml:/etc/garage.toml \
  -v /var/lib/garage/meta:/var/lib/garage/meta \
  -v /var/lib/garage/data:/var/lib/garage/data \
  dxflrs/garage:v1.1.0
```

### Option 3: Docker Compose (Production)

```yaml
# docker-compose.yml
version: "3.8"

services:
  garage:
    image: dxflrs/garage:v1.1.0
    container_name: garage
    network_mode: "host"
    restart: unless-stopped
    volumes:
      - ./garage.toml:/etc/garage.toml:ro
      - garage_meta:/var/lib/garage/meta
      - garage_data:/var/lib/garage/data
    healthcheck:
      test: ["CMD", "/garage", "status"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  garage_meta:
    driver: local
  garage_data:
    driver: local
```

**Production Configuration (garage.toml):**

```toml
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "lmdb"
metadata_auto_snapshot_interval = "6h"

replication_factor = 3  # For 3+ node clusters
compression_level = 2

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "<this node's public IP>:3901"
rpc_secret = "<32-byte-hex-secret>"  # openssl rand -hex 32

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.yourdomain.com"

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web.yourdomain.com"
index = "index.html"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "<admin-token>"
metrics_token = "<metrics-token>"
```

Start with:

```bash
docker-compose up -d
```

---

## Initial Configuration

### Create Cluster Layout

After starting Garage, configure the cluster layout:

```bash
# Check node status
garage status

# Output shows node ID:
# ==== HEALTHY NODES ====
# ID                   Hostname  Address           Tag  Zone  Capacity
# 563e1ac825ee3323…   server1   127.0.0.1:3901    NO ROLE ASSIGNED

# Assign node to zone with capacity
garage layout assign -z dc1 -c 100G 563e

# Apply the layout (increment version each time)
garage layout apply --version 1
```

### Create Buckets and Keys

```bash
# Create a bucket for your application
garage bucket create primeeditz-assets

# Verify bucket creation
garage bucket list
garage bucket info primeeditz-assets

# Create an API key
garage key create app-key

# Output:
# Key name: app-key
# Key ID: GK3515373e4c851ebaad366558
# Secret key: 7d37d093435a41f2aab8f13c19ba067d9776c90215f56614adad6ece597dbb34
# Authorized buckets:

# Grant key access to bucket (read, write, owner permissions)
garage bucket allow \
  --read \
  --write \
  --owner \
  primeeditz-assets \
  --key app-key

# Verify permissions
garage bucket info primeeditz-assets
```

### Configure CORS (for browser uploads)

Garage supports bucket website configuration. For programmatic CORS, use AWS CLI:

```bash
# Install AWS CLI
pip install awscli

# Configure AWS CLI for Garage
aws configure
# AWS Access Key ID: GK3515373e4c851ebaad366558
# AWS Secret Access Key: 7d37d093435a41f2aab8f13c19ba067d9776c90215f56614adad6ece597dbb34
# Default region name: garage
# Default output format: json

# Create cors.json
cat > cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-meta-*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --endpoint-url http://localhost:3900 \
  --bucket primeeditz-assets \
  --cors-configuration file://cors.json
```

### Make Bucket Public (Optional)

For public assets, set a bucket policy:

```bash
cat > policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::primeeditz-assets/*"]
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --endpoint-url http://localhost:3900 \
  --bucket primeeditz-assets \
  --policy file://policy.json
```

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
# Garage S3 API endpoint
npx convex env set GARAGE_ENDPOINT "http://localhost:3900"  # or https://garage.yourdomain.com

# Garage region (from garage.toml s3_region)
npx convex env set GARAGE_REGION "garage"

# Access credentials (from `garage key info app-key`)
npx convex env set GARAGE_ACCESS_KEY "GK3515373e4c851ebaad366558"
npx convex env set GARAGE_SECRET_KEY "7d37d093435a41f2aab8f13c19ba067d9776c90215f56614adad6ece597dbb34"

# Bucket name
npx convex env set GARAGE_BUCKET "primeeditz-assets"

# For TUS uploads (optional)
npx convex env set APP_URL "https://your-app.com"
```

### Local Development (.env.local)

```env
# Garage Configuration
GARAGE_ENDPOINT=http://localhost:3900
GARAGE_REGION=garage
GARAGE_ACCESS_KEY=GK3515373e4c851ebaad366558
GARAGE_SECRET_KEY=7d37d093435a41f2aab8f13c19ba067d9776c90215f56614adad6ece597dbb34
GARAGE_BUCKET=primeeditz-assets

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
 * Garage URL Utilities for Convex
 *
 * Functions to generate public URLs for Garage-stored files.
 * Used across queries to return proper displayable URLs.
 */

/**
 * Generate a public Garage URL from a storage key.
 *
 * Uses GARAGE_ENDPOINT environment variable.
 * Format: {GARAGE_ENDPOINT}/{BUCKET}/{storageKey}
 *
 * @param storageKey - The key path in Garage (e.g., "projects/123/assets/file.jpg")
 * @returns The full public URL or null if Garage is not configured
 */
export function getGaragePublicUrl(
  storageKey: string | undefined | null,
): string | null {
  if (!storageKey) {
    return null;
  }

  const baseUrl = process.env.GARAGE_ENDPOINT;
  const bucket = process.env.GARAGE_BUCKET;

  if (!baseUrl) {
    return null;
  }

  const effectiveBucket = bucket || "primeeditz-assets";

  // Ensure no double slashes
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanStorageKey = storageKey.replace(/^\//, "");

  return `${cleanBaseUrl}/${effectiveBucket}/${cleanStorageKey}`;
}

/**
 * Enrich files array with public URLs.
 */
export function enrichFilesWithUrls<
  T extends { storageKey?: string | null; previewUrl?: string | null },
>(files: T[] | undefined): (T & { displayUrl: string | null })[] {
  if (!files) return [];

  return files.map((file) => ({
    ...file,
    displayUrl: getGaragePublicUrl(file.storageKey) || file.previewUrl || null,
  }));
}
```

### Signed URL Generation

Create actions for generating pre-signed URLs (requires Node.js runtime):

```typescript
// convex/functions/storage/actions.ts
"use node";

/**
 * Storage URL Generation Action for Garage
 *
 * Generates pre-signed URLs for Garage-stored files.
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

// Initialize S3 client for Garage
function getS3Client(): S3Client {
  if (!process.env.GARAGE_ENDPOINT) {
    throw new Error("GARAGE_ENDPOINT is not configured");
  }

  return new S3Client({
    endpoint: process.env.GARAGE_ENDPOINT,
    region: process.env.GARAGE_REGION || "garage",
    credentials: {
      accessKeyId: process.env.GARAGE_ACCESS_KEY!,
      secretAccessKey: process.env.GARAGE_SECRET_KEY!,
    },
    forcePathStyle: true, // Required for Garage S3 compatibility
  });
}

function getBucket(): string {
  return process.env.GARAGE_BUCKET || "primeeditz-assets";
}

/**
 * Generate a pre-signed URL for downloading/viewing a single file.
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
    // 1. Verify upload eligibility
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

    // 3. Generate unique storage key
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
      garageKey: storageKey,
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
          updateStatus(id, "error", { error: error.message });
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const progress = Math.round((bytesUploaded / bytesTotal) * 100);
          updateProgress(id, progress);
        },
        onSuccess: async () => {
          const garageKey = upload.url?.split("/tus/")[1] || "";

          await createAssetMutation({
            projectId: projectId as Id<"projects">,
            folderId: folderId as Id<"folders">,
            filename: file.name,
            garageKey,
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

### Small Files (Pre-signed PUT) - Under 50MB

```
┌──────────┐     1. Request URL      ┌──────────┐
│  Client  │ ─────────────────────▶ │  Convex  │
│          │ ◀───────────────────── │  Action  │
└──────────┘    2. Pre-signed URL    └──────────┘
      │
      │ 3. PUT file directly
      ▼
┌──────────┐
│  Garage  │
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

### Large Files (TUS Resumable) - Over 50MB

```
┌──────────┐     1. Get TUS config   ┌──────────┐
│  Client  │ ─────────────────────▶ │  Convex  │
│          │ ◀───────────────────── │  Action  │
└──────────┘    2. TUS endpoint      └──────────┘
      │
      │ 3. Chunked uploads (resumable)
      ▼
┌──────────┐     4. Stream to S3     ┌──────────┐
│   TUS    │ ─────────────────────▶ │  Garage  │
│  Server  │                         │  Server  │
└──────────┘                         └──────────┘
```

---

## Security Best Practices

### 1. Access Control

```typescript
export const generateUploadUrl = action({
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Verify project access
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

### 2. Content Type Validation

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

### 3. URL Expiration

```typescript
const signedUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 3600, // 1 hour max
});
```

### 4. RPC Secret Security

Never expose `rpc_secret` from garage.toml. This is used for node-to-node communication only.

---

## Troubleshooting

### Common Issues

#### 1. "InvalidAccessKeyId" Error

**Symptom:** API calls fail with access key errors.

**Solution:** Verify your access key with:

```bash
garage key info app-key
```

Ensure `GARAGE_ACCESS_KEY` matches the "Key ID" (starts with `GK`).

#### 2. CORS Errors

**Symptom:** Browser console shows CORS errors when uploading.

**Solution:** Apply CORS configuration using AWS CLI:

```bash
aws s3api put-bucket-cors \
  --endpoint-url http://localhost:3900 \
  --bucket primeeditz-assets \
  --cors-configuration file://cors.json
```

#### 3. "NoSuchBucket" Error

**Symptom:** Operations fail with bucket not found.

**Solution:**

```bash
# List existing buckets
garage bucket list

# Create if missing
garage bucket create primeeditz-assets
```

#### 4. Connection Refused

**Symptom:** Cannot connect to Garage server.

**Solutions:**

- Check if Garage is running: `garage status`
- Verify port 3900 is open and accessible
- Check firewall rules

#### 5. "NO ROLE ASSIGNED" Warning

**Symptom:** `garage status` shows nodes with "NO ROLE ASSIGNED".

**Solution:** Create and apply cluster layout:

```bash
garage layout assign -z dc1 -c 100G <node_id_prefix>
garage layout apply --version 1
```

### Debug Logging

Enable verbose logging in Garage:

```toml
# In garage.toml
[logging]
level = "debug"
```

Or with environment variable:

```bash
RUST_LOG=garage=debug garage server
```

---

## Garage vs Other S3 Solutions

| Feature              | Garage            | MinIO             | Cloudflare R2   |
| -------------------- | ----------------- | ----------------- | --------------- |
| **Self-hosted**      | ✅                | ✅                | ❌ (Cloud only) |
| **Resource Usage**   | Very Low          | Medium            | N/A             |
| **Geo-distribution** | Native            | Manual            | Native          |
| **S3 Compatibility** | Good              | Excellent         | Excellent       |
| **Setup Complexity** | Low               | Medium            | Low             |
| **Scalability**      | Excellent         | Excellent         | Excellent       |
| **Cost**             | Free (infra only) | Free (infra only) | Pay-per-use     |
| **Use Case**         | Edge/Home servers | Enterprise        | Global CDN      |

### When to Choose Garage

- ✅ Running on low-resource servers (Raspberry Pi, VPS)
- ✅ Geo-distributed deployments across multiple locations
- ✅ Home lab or edge computing scenarios
- ✅ Self-hosted infrastructure with minimal dependencies
- ✅ Need simplicity over advanced features

---

## Quick Reference

| Environment Variable | Description             | Example                 |
| -------------------- | ----------------------- | ----------------------- |
| `GARAGE_ENDPOINT`    | Garage S3 API URL       | `http://localhost:3900` |
| `GARAGE_REGION`      | S3 region (from config) | `garage`                |
| `GARAGE_ACCESS_KEY`  | Key ID (starts with GK) | `GK3515373e4c851...`    |
| `GARAGE_SECRET_KEY`  | Secret key              | `7d37d093435a41...`     |
| `GARAGE_BUCKET`      | Bucket name             | `primeeditz-assets`     |

### Garage Ports

| Port | Service | Description                 |
| ---- | ------- | --------------------------- |
| 3900 | S3 API  | Main S3-compatible endpoint |
| 3901 | RPC     | Internal node communication |
| 3902 | Web     | Static website hosting      |
| 3903 | Admin   | Admin API & metrics         |
| 3904 | K2V     | Key-Value API (optional)    |

---

## See Also

- [Garage Documentation](https://garagehq.deuxfleurs.fr/documentation/)
- [Garage Quick Start](https://garagehq.deuxfleurs.fr/documentation/quick-start/)
- [Garage Deployment Guide](https://garagehq.deuxfleurs.fr/documentation/cookbook/real-world/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [TUS Resumable Uploads](https://tus.io/)
- [Convex File Storage](https://docs.convex.dev/file-storage)
