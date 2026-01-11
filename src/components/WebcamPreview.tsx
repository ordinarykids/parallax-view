"use client";

import { forwardRef } from "react";

interface WebcamPreviewProps {
  isTracking: boolean;
}

export const WebcamPreview = forwardRef<HTMLVideoElement, WebcamPreviewProps>(
  function WebcamPreview({ isTracking }, ref) {
    return (
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-black/80 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        <video
          ref={ref}
          className="w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
        />
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-gray-400 text-sm">Camera Off</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isTracking ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
        </div>
      </div>
    );
  }
);
