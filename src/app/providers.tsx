"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { PropsWithChildren } from "react";
import { authClient } from "@/lib/auth-client";

// Validate required environment variable
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL environment variable is required. Please check your .env.local file.",
  );
}

const convex = new ConvexReactClient(convexUrl);

export function Providers({
  children,
  initialToken,
}: PropsWithChildren<{ initialToken?: string | null }>) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
