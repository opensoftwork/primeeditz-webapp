"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";

export function useSignedUrls(minioKeys: string[] | undefined | null) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const getSignedFileUrls = useAction(api.functions.storage.actions.getSignedFileUrls);

  // Use a ref to store the serialized keys to prevent unnecessary re-fetches
  // when the keys array reference changes but the content is the same.
  const serializedKeys = JSON.stringify(minioKeys || []);
  const lastFetchedKeysRef = useRef<string>("");

  const fetchUrls = useCallback(async (keys: string[]) => {
    if (keys.length === 0) {
      setUrls({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Use the plural batch action instead of mapping over singular calls
      const results = await getSignedFileUrls({ storageKeys: keys });
      
      const urlMap: Record<string, string> = {};
      
      // Safety check: results could technically be null if the action fails 
      // though the action is defined to return a Record.
      if (results) {
        Object.entries(results).forEach(([key, url]) => {
          if (url) {
            urlMap[key] = url;
          }
        });
      }

      setUrls(urlMap);
    } catch (err) {
      console.error("Error fetching signed URLs batch:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [getSignedFileUrls]);

  useEffect(() => {
    if (serializedKeys === lastFetchedKeysRef.current) return;
    
    lastFetchedKeysRef.current = serializedKeys;
    const keys = JSON.parse(serializedKeys);
    fetchUrls(keys);
  }, [serializedKeys, fetchUrls]);

  return { urls, isLoading, error };
}
