"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { PerspectiveGrid } from "./PerspectiveGrid";
import { ParallaxProduct } from "./ParallaxProduct";
import { ControlPanel } from "./ControlPanel";
import { WebcamPreview } from "./WebcamPreview";

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
  smoothing: 0.1,
};

export function ParallaxScene() {
  const {
    facePosition,
    videoRef,
    isTracking,
    isLoading,
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

  // Smooth the face position using lerp
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const targetX =
      facePosition.x *
      (facePosition.x > 0 ? settings.parallaxXMax : -settings.parallaxXMin);
    const targetY =
      facePosition.y *
      (facePosition.y > 0 ? settings.parallaxYMax : -settings.parallaxYMin);
    const targetZ = facePosition.z * settings.zoom;

    const newPosition = {
      x: lerp(smoothedRef.current.x, targetX, settings.smoothing),
      y: lerp(smoothedRef.current.y, targetY, settings.smoothing),
      z: lerp(smoothedRef.current.z, targetZ, settings.smoothing),
    };

    smoothedRef.current = newPosition;
    setSmoothedPosition(newPosition);
  }, [facePosition, settings]);

  const handleToggleTracking = useCallback(async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">

      {/* 3D Perspective Grid */}
      <PerspectiveGrid
        offsetX={smoothedPosition.x}
        offsetY={smoothedPosition.y}
        offsetZ={smoothedPosition.z}
      />

      {/* Product Display - add imageSrc="/your-product.png" to show an image */}
      <ParallaxProduct
        offsetX={smoothedPosition.x}
        offsetY={smoothedPosition.y}
        offsetZ={smoothedPosition.z}
      />

      {/* Control Panel */}
      <ControlPanel
        settings={settings}
        onSettingsChange={setSettings}
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        isLoading={isLoading}
      />

      {/* Webcam Preview */}
      <WebcamPreview ref={videoRef} isTracking={isTracking} />

      {/* Position Debug (optional) */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">
        <div>X: {smoothedPosition.x.toFixed(3)}</div>
        <div>Y: {smoothedPosition.y.toFixed(3)}</div>
        <div>Z: {smoothedPosition.z.toFixed(3)}</div>
      </div>
    </div>
  );
}
