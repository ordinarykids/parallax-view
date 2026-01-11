"use client";

import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ParallaxSettings {
  parallaxXMin: number;
  parallaxXMax: number;
  parallaxYMin: number;
  parallaxYMax: number;
  zoom: number;
  smoothing: number;
}

interface ControlPanelProps {
  settings: ParallaxSettings;
  onSettingsChange: (settings: ParallaxSettings) => void;
  isTracking: boolean;
  onToggleTracking: () => void;
  isLoading: boolean;
  gazeWeight: number;
  onGazeWeightChange: (weight: number) => void;
}

export function ControlPanel({
  settings,
  onSettingsChange,
  isTracking,
  onToggleTracking,
  isLoading,
  gazeWeight,
  onGazeWeightChange,
}: ControlPanelProps) {
  const updateSetting = (
    key: keyof ParallaxSettings,
    value: number
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="absolute top-4 left-4 w-64 bg-black/80 border-gray-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          Parallax Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Gaze Weight</span>
            <span>{(gazeWeight * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[gazeWeight]}
            onValueChange={([v]) => onGazeWeightChange(v)}
            min={0}
            max={1}
            step={0.05}
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Head Only</span>
            <span>Gaze Only</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Parallax X</span>
            <span>{settings.parallaxXMin.toFixed(1)} - {settings.parallaxXMax.toFixed(1)}</span>
          </div>
          <div className="flex gap-2">
            <Slider
              value={[settings.parallaxXMin]}
              onValueChange={([v]) => updateSetting("parallaxXMin", v)}
              min={-2}
              max={0}
              step={0.1}
              className="flex-1"
            />
            <Slider
              value={[settings.parallaxXMax]}
              onValueChange={([v]) => updateSetting("parallaxXMax", v)}
              min={0}
              max={2}
              step={0.1}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Parallax Y</span>
            <span>{settings.parallaxYMin.toFixed(1)} - {settings.parallaxYMax.toFixed(1)}</span>
          </div>
          <div className="flex gap-2">
            <Slider
              value={[settings.parallaxYMin]}
              onValueChange={([v]) => updateSetting("parallaxYMin", v)}
              min={-2}
              max={0}
              step={0.1}
              className="flex-1"
            />
            <Slider
              value={[settings.parallaxYMax]}
              onValueChange={([v]) => updateSetting("parallaxYMax", v)}
              min={0}
              max={2}
              step={0.1}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Zoom</span>
            <span>{settings.zoom.toFixed(1)}</span>
          </div>
          <Slider
            value={[settings.zoom]}
            onValueChange={([v]) => updateSetting("zoom", v)}
            min={0.5}
            max={2}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Smoothing</span>
            <span>{settings.smoothing.toFixed(2)}</span>
          </div>
          <Slider
            value={[settings.smoothing]}
            onValueChange={([v]) => updateSetting("smoothing", v)}
            min={0.01}
            max={0.3}
            step={0.01}
          />
        </div>

        <button
          onClick={onToggleTracking}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
            isTracking
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading
            ? "Loading..."
            : isTracking
            ? "Stop Tracking"
            : "Start Tracking"}
        </button>
      </CardContent>
    </Card>
  );
}
