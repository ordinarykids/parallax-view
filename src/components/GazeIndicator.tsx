"use client";

import { useEffect, useState } from "react";

interface GazeIndicatorProps {
  gazeX: number; // -1 to 1
  gazeY: number; // -1 to 1
  isTracking: boolean;
}

export function GazeIndicator({ gazeX, gazeY, isTracking }: GazeIndicatorProps) {
  const [smoothedX, setSmoothedX] = useState(50);
  const [smoothedY, setSmoothedY] = useState(50);

  useEffect(() => {
    if (!isTracking) return;

    // Convert gaze (-1 to 1) to screen percentage (0 to 100)
    // Full range so gaze can reach edges of the grid
    const targetX = 50 + gazeX * 50; // Full screen width
    const targetY = 50 + gazeY * 50; // Full screen height

    // Smooth the movement
    setSmoothedX((prev) => prev + (targetX - prev) * 0.15);
    setSmoothedY((prev) => prev + (targetY - prev) * 0.15);
  }, [gazeX, gazeY, isTracking]);

  if (!isTracking) return null;

  return (
    <>
      {/* Gaze dot */}
      <div
        className="absolute pointer-events-none z-50"
        style={{
          left: `${smoothedX}%`,
          top: `${smoothedY}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer glow */}
        <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-pink-500/20 blur-md" />
        {/* Inner dot */}
        <div className="w-3 h-3 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
      </div>

      {/* Line from webcam preview to gaze point */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-40"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="gazeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <line
          x1="calc(100% - 7rem)"
          y1="calc(100% - 5rem)"
          x2={`${smoothedX}%`}
          y2={`${smoothedY}%`}
          stroke="url(#gazeLineGradient)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
    </>
  );
}
