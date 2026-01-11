"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { FaceSketch } from "@/components/FaceSketch";
import { ControlPanel } from "@/components/ControlPanel";
import { WebcamPreview } from "@/components/WebcamPreview";
import { GazeIndicator } from "@/components/GazeIndicator";

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

export default function SketchyPage() {
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

  // Smooth the combined position using lerp
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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* 3D Perspective Grid */}
      <PerspectiveGrid
        offsetX={smoothedPosition.x}
        offsetY={smoothedPosition.y}
        offsetZ={smoothedPosition.z}
        zoom={settings.zoom}
      />

      {/* Face Sketch - line drawing of face */}
      <FaceSketch
        offsetX={smoothedPosition.x}
        offsetY={smoothedPosition.y}
        offsetZ={smoothedPosition.z}
        zoom={settings.zoom}
      />

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

      {/* Gaze Indicator */}
      <GazeIndicator
        gazeX={gazePosition.x}
        gazeY={gazePosition.y}
        isTracking={isTracking}
      />

      {/* Title */}
      <div className="absolute right-4 top-4 font-mono text-sm text-white/50">
        /sketchy
      </div>

      {/* Position Debug */}
      <div className="absolute bottom-4 left-4 space-y-1 font-mono text-xs text-gray-500">
        <div className="text-gray-400">Combined:</div>
        <div>X: {smoothedPosition.x.toFixed(3)}</div>
        <div>Y: {smoothedPosition.y.toFixed(3)}</div>
        <div>Z: {smoothedPosition.z.toFixed(3)}</div>
        <div className="mt-2 text-gray-400">Gaze:</div>
        <div>X: {gazePosition.x.toFixed(3)}</div>
        <div>Y: {gazePosition.y.toFixed(3)}</div>
        <div className="mt-2 text-gray-400">Head:</div>
        <div>X: {facePosition.x.toFixed(3)}</div>
        <div>Y: {facePosition.y.toFixed(3)}</div>
      </div>
    </div>
  );
}
