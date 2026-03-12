# Story 30.3: Dual-Endpoint Signed URL Generation

**Epic**: Epic 30 - Internal Network Asset Routing
**Status**: backlog
**Complexity**: Small-Medium (3 points)
**Created**: 2026-03-02
**Priority**: HIGH — Backend support for internal URL resolution
**Depends On**: Story 30.1 (must PASS)

---

## 📋 User Story

**As a** Convex backend action,
**I want** to generate signed URLs targeting either the internal or public MinIO endpoint,
**So that** the frontend can request LAN-optimized URLs when the user is on the internal network.

---

## ✅ Acceptance Criteria

- [ ] **Given** `getSignedFileUrl` is called with `useInternal: true`
- [ ] **When** `MINIO_INTERNAL_ENDPOINT` is configured
- [ ] **Then** the signed URL points to the internal endpoint (e.g., `http://192.168.1.5:9000/...`)
- [ ] **Given** `getSignedFileUrl` is called with `useInternal: false` or omitted
- [ ] **Then** current behavior — signed URL points to `MINIO_ENDPOINT` (public)
- [ ] **Given** `MINIO_INTERNAL_ENDPOINT` is NOT configured and `useInternal: true`
- [ ] **Then** falls back to public endpoint (graceful degradation)

---

## 📁 Files to Update

| File                                  | Change                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `convex/functions/storage/actions.ts` | Add `useInternal` arg to `getSignedFileUrl` and `getSignedFileUrls`, create internal S3 client |

---

## 🔧 Implementation Details

### New Environment Variable

Add to Convex deployment environment:

- `MINIO_INTERNAL_ENDPOINT` — e.g., `http://192.168.1.5:9000`

### S3 Client Changes

```typescript
// Add a second cached client for internal endpoint:
let cachedInternalS3Client: S3Client | null = null;

function getInternalS3Client(): S3Client | null {
  if (!process.env.MINIO_INTERNAL_ENDPOINT) return null;

  if (cachedInternalS3Client) return cachedInternalS3Client;

  cachedInternalS3Client = new S3Client({
    endpoint: process.env.MINIO_INTERNAL_ENDPOINT,
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  return cachedInternalS3Client;
}
```

### Action Changes

```typescript
export const getSignedFileUrl = action({
  args: {
    storageKey: v.string(),
    expiresIn: v.optional(v.number()),
    useInternal: v.optional(v.boolean()), // NEW
  },
  handler: async (_ctx, args): Promise<string | null> => {
    if (!args.storageKey) return null;

    try {
      // Choose client based on useInternal flag
      const s3Client =
        (args.useInternal && getInternalS3Client()) || getS3Client();

      const command = new GetObjectCommand({
        Bucket: getBucket(),
        Key: args.storageKey,
      });

      return await getSignedUrl(s3Client, command, {
        expiresIn: args.expiresIn ?? 3600,
      });
    } catch (error) {
      console.error(
        `Error generating signed URL for ${args.storageKey}:`,
        error,
      );
      return null;
    }
  },
});
```

Apply the same pattern to `getSignedFileUrls`.

---

## 🚀 Definition of Done

- [ ] `useInternal` optional arg added to `getSignedFileUrl`
- [ ] `useInternal` optional arg added to `getSignedFileUrls`
- [ ] Internal S3 client created when `MINIO_INTERNAL_ENDPOINT` is set
- [ ] Graceful fallback to public client when internal not configured
- [ ] Existing functionality unchanged when `useInternal` is omitted
- [ ] `pnpm convex dev` deploys successfully
- [ ] Story marked as `done`

---

**Previous Story**: 30-2 - Network detection utility
**Next Story**: 30-4 - Integrate internal URL resolution
