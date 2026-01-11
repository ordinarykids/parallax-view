"use client";

import { useEffect } from "react";

/**
 * Suppresses TensorFlow.js info messages that are incorrectly logged as errors.
 * TensorFlow.js uses console.error for INFO level messages, which triggers
 * Next.js dev overlay errors.
 */
export function SuppressTFLogs() {
  useEffect(() => {
    const originalError = console.error;

    console.error = (...args: unknown[]) => {
      // Filter out TensorFlow INFO messages
      const message = args[0];
      if (
        typeof message === "string" &&
        (message.includes("INFO:") ||
          message.includes("Created TensorFlow Lite XNNPACK delegate"))
      ) {
        // Downgrade to console.log instead
        console.log("[TF]", ...args);
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
