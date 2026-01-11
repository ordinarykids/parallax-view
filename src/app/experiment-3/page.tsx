"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { ControlPanel } from "@/components/ControlPanel";
import { WebcamPreview } from "@/components/WebcamPreview";

interface ParallaxSettings {
  parallaxXMin: number;
  parallaxXMax: number;
  parallaxYMin: number;
  parallaxYMax: number;
  zoom: number;
  smoothing: number;
}

const defaultSettings: ParallaxSettings = {
  parallaxXMin: -1,
  parallaxXMax: 1,
  parallaxYMin: -1,
  parallaxYMax: 1,
  zoom: 1,
  smoothing: 0.08,
};

export default function Experiment3() {
  const {
    combinedPosition,
    gazePosition,
    facePosition,
    videoRef,
    isTracking,
    isLoading,
    gazeWeight,
    setGazeWeight,
    startTracking,
    stopTracking,
  } = useFaceTracking();

  const [settings, setSettings] = useState<ParallaxSettings>(defaultSettings);
  const [smoothedPosition, setSmoothedPosition] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const smoothedRef = useRef(smoothedPosition);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const targetX =
      combinedPosition.x *
      (combinedPosition.x > 0 ? settings.parallaxXMax : -settings.parallaxXMin);
    const targetY =
      combinedPosition.y *
      (combinedPosition.y > 0 ? settings.parallaxYMax : -settings.parallaxYMin);
    const targetZ = combinedPosition.z * settings.zoom;

    const newPosition = {
      x: lerp(smoothedRef.current.x, targetX, settings.smoothing),
      y: lerp(smoothedRef.current.y, targetY, settings.smoothing),
      z: lerp(smoothedRef.current.z, targetZ, settings.smoothing),
    };

    smoothedRef.current = newPosition;
    setSmoothedPosition(newPosition);
  }, [combinedPosition, settings]);

  const handleToggleTracking = useCallback(async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  // Floating orbs that respond to head movement
  const orbs = [
    {
      size: 300,
      depth: 0.8,
      color: "from-violet-500/30 to-fuchsia-500/30",
      blur: 80,
    },
    {
      size: 200,
      depth: 0.5,
      color: "from-cyan-500/25 to-blue-500/25",
      blur: 60,
    },
    {
      size: 250,
      depth: 1.2,
      color: "from-rose-500/20 to-orange-500/20",
      blur: 100,
    },
    {
      size: 150,
      depth: 0.3,
      color: "from-emerald-500/25 to-teal-500/25",
      blur: 40,
    },
    {
      size: 180,
      depth: 0.9,
      color: "from-amber-500/20 to-yellow-500/20",
      blur: 70,
    },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-neutral-950">
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse at ${50 + smoothedPosition.x * 20}% ${50 + smoothedPosition.y * 20}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb, i) => {
        const offsetMultiplier = orb.depth;
        const x = smoothedPosition.x * 100 * offsetMultiplier;
        const y = smoothedPosition.y * 100 * offsetMultiplier;
        const scale = 1 + smoothedPosition.z * 0.1 * offsetMultiplier;

        // Position orbs in different areas
        const positions = [
          { left: "20%", top: "30%" },
          { left: "70%", top: "20%" },
          { left: "60%", top: "70%" },
          { left: "15%", top: "65%" },
          { left: "80%", top: "50%" },
        ];

        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${orb.color}`}
            style={{
              width: orb.size,
              height: orb.size,
              left: positions[i].left,
              top: positions[i].top,
              filter: `blur(${orb.blur}px)`,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              transition: "transform 0.1s ease-out",
            }}
          />
        );
      })}

      {/* Center content - minimal text */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${smoothedPosition.x * 30}px, ${smoothedPosition.y * 30}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div className="text-center">
          <h1
            className="text-8xl font-thin tracking-widest text-white/90"
            style={{
              transform: `translate(${smoothedPosition.x * -20}px, ${smoothedPosition.y * -20}px)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            DEPTH
          </h1>
          <p
            className="mt-4 text-lg font-light tracking-[0.3em] text-white/40"
            style={{
              transform: `translate(${smoothedPosition.x * -40}px, ${smoothedPosition.y * -40}px)`,
              transition: "transform 0.2s ease-out",
            }}
          >
            MOVE YOUR HEAD
          </p>
        </div>
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => {
          // Deterministic pseudo-random depth based on index (avoids hydration mismatch)
          const seededValue = ((i * 17 + 7) % 13) / 13;
          const depth = 0.2 + seededValue * 1.3;
          const x = smoothedPosition.x * 80 * depth;
          const y = smoothedPosition.y * 80 * depth;

          return (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30"
              style={{
                left: `${10 + ((i * 37) % 80)}%`,
                top: `${5 + ((i * 23) % 90)}%`,
                transform: `translate(${x}px, ${y}px)`,
                transition: "transform 0.1s ease-out",
                opacity: 0.1 + depth * 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Control Panel */}
      <ControlPanel
        settings={settings}
        onSettingsChange={setSettings}
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        isLoading={isLoading}
        gazeWeight={gazeWeight}
        onGazeWeightChange={setGazeWeight}
      />

      {/* Webcam Preview */}
      <WebcamPreview ref={videoRef} isTracking={isTracking} />

      {/* Title */}
      <div className="absolute right-4 top-4 font-mono text-sm text-white/50">
        /experiment-3
      </div>

      {/* Position Debug */}
      <div className="absolute bottom-4 left-4 space-y-1 font-mono text-xs text-white/30">
        <div className="text-white/50">Position:</div>
        <div>X: {smoothedPosition.x.toFixed(3)}</div>
        <div>Y: {smoothedPosition.y.toFixed(3)}</div>
        <div>Z: {smoothedPosition.z.toFixed(3)}</div>
      </div>
    </div>
  );
}
