"use client";

import { useEffect } from "react";

/**
 * Performance Patch Component
 * Fixes "Performance.measure: Given attribute end cannot be negative"
 * which is a known bug in certain Next.js 16/Turbopack dev environments.
 */
export function PerformancePatch() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      const originalMeasure = window.performance.measure;

      // @ts-ignore
      window.performance.measure = function (
        name: string,
        start?: string | PerformanceMeasureOptions,
        end?: string,
      ) {
        try {
          if (typeof start === "object") {
            return originalMeasure.call(window.performance, name, start);
          }
          return originalMeasure.call(window.performance, name, start, end);
        } catch (e) {
          // If the error is about negative end attribute, silenty swallow it
          if (
            e instanceof Error &&
            e.message.includes("end cannot be negative")
          ) {
            return;
          }
          throw e;
        }
      };
    }
  }, []);

  return null;
}
