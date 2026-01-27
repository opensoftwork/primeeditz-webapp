import { S3Store } from "@tus/s3-store";
import { Server } from "@tus/server";

if (!process.env.MINIO_ENDPOINT) {
  throw new Error("MINIO_ENDPOINT is not configured");
}

const s3Store = new S3Store({
  bucket: process.env.MINIO_BUCKET || "primeeditz-assets",
  s3ClientConfig: {
    endpoint: process.env.MINIO_ENDPOINT,
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  } as any, // Cast to any to avoid strict S3 client config issues with TUS
} as any);

export const tusServer = new Server({
  path: "/api/upload/tus",
  datastore: s3Store,
  namingFunction: (req: any) => {
    // Extract metadata from headers
    const metadataStr =
      req.headers instanceof Headers
        ? req.headers.get("upload-metadata") || ""
        : (req.headers["upload-metadata"] as string) || "";

    const metadata: Record<string, string> = {};

    metadataStr.split(",").forEach((item: string) => {
      const [key, b64Value] = item.trim().split(" ");
      if (key && b64Value) {
        try {
          metadata[key] = Buffer.from(b64Value, "base64").toString();
        } catch (e) {
          console.error("Failed to decode metadata value:", b64Value);
        }
      }
    });

    const projectId = metadata.projectId || "unknown";
    const folderId = metadata.folderId || "unknown";
    const fileName = metadata.filename || "file";
    const timestamp = Date.now();

    const cleanName = fileName.replace(/\s+/g, "_");

    // Return the full storage key path
    return `projects/${projectId}/assets/${folderId}/${timestamp}_${cleanName}`;
  },
});
