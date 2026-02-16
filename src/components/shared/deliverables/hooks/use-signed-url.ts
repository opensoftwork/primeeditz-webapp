"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";

export function useSignedUrl(minioKey: string | undefined | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
//   @ts-ignore
  const getSignedFileUrl = useAction(api.functions.storage.actions.getSignedFileUrl);

  const fetchUrl = useCallback(async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await getSignedFileUrl({ storageKey: key });
      setUrl(url);
    } catch (err) {
      console.error("Error fetching signed URL:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [getSignedFileUrl]);

  useEffect(() => {
    if (!minioKey) {
      setUrl(null);
      setIsLoading(false);
      return;
    }

    fetchUrl(minioKey);
  }, [minioKey, fetchUrl]);

  return { url, isLoading, error };
}
