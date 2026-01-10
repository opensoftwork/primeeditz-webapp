import type { NextConfig } from "next";

// Add MinIO host if configured
// Supports both NEXT_PUBLIC_MINIO_PUBLIC_URL (full URL) and NEXT_PUBLIC_MINIO_HOSTNAME (just hostname)
function getMinioHostname(): string | null {
  // Try direct hostname first (simpler)
  if (process.env.NEXT_PUBLIC_MINIO_HOSTNAME) {
    return process.env.NEXT_PUBLIC_MINIO_HOSTNAME;
  }
  
  // Try parsing from URL
  if (process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL).hostname;
    } catch {
      console.warn("Failed to parse NEXT_PUBLIC_MINIO_PUBLIC_URL:", process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL);
    }
  }
  
  return null;
}

const minioHost = getMinioHostname();

const remotePatterns = minioHost
  ? [
      {
        protocol: "https" as const,
        hostname: minioHost,
        pathname: "/**",
      },
      {
        protocol: "http" as const,
        hostname: minioHost,
        pathname: "/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
