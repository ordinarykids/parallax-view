"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
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
  smoothing: 0.12,
};

// Floating card data with positions
const floatingCards = [
  {
    id: 1,
    emoji: "🎨",
    label: "Design",
    color: "from-fuchsia-500 to-pink-600",
    position: { x: -35, y: -25 },
    depth: 0.6,
    size: "large",
  },
  {
    id: 2,
    emoji: "⚡",
    label: "Speed",
    color: "from-amber-400 to-orange-500",
    position: { x: 30, y: -30 },
    depth: 0.8,
    size: "medium",
  },
  {
    id: 3,
    emoji: "🔮",
    label: "Magic",
    color: "from-violet-500 to-purple-600",
    position: { x: -30, y: 25 },
    depth: 1.2,
    size: "medium",
  },
  {
    id: 4,
    emoji: "🌊",
    label: "Flow",
    color: "from-cyan-400 to-blue-500",
    position: { x: 35, y: 20 },
    depth: 0.5,
    size: "large",
  },
  {
    id: 5,
    emoji: "✨",
    label: "Spark",
    color: "from-yellow-400 to-amber-500",
    position: { x: 0, y: -35 },
    depth: 1.0,
    size: "small",
  },
  {
    id: 6,
    emoji: "🎯",
    label: "Focus",
    color: "from-rose-500 to-red-600",
    position: { x: -40, y: 0 },
    depth: 0.7,
    size: "small",
  },
  {
    id: 7,
    emoji: "💎",
    label: "Premium",
    color: "from-emerald-400 to-teal-500",
    position: { x: 40, y: -5 },
    depth: 0.9,
    size: "small",
  },
  {
    id: 8,
    emoji: "🚀",
    label: "Launch",
    color: "from-indigo-500 to-blue-600",
    position: { x: 5, y: 35 },
    depth: 1.1,
    size: "medium",
  },
];

function FloatingCard({
  card,
  targetX,
  targetY,
  isHovered,
  onHover,
}: {
  card: (typeof floatingCards)[0];
  targetX: number;
  targetY: number;
  isHovered: boolean;
  onHover: (id: number | null) => void;
}) {
  // Bouncy spring physics
  const springConfig = {
    stiffness: 150 * card.depth,
    damping: 15,
    mass: 1 / card.depth,
  };

  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const rotate = useSpring(0, { stiffness: 100, damping: 20 });
  const scale = useSpring(1, { stiffness: 400, damping: 20 });

  useEffect(() => {
    const offsetX = targetX * 100 * card.depth;
    const offsetY = targetY * 80 * card.depth;
    x.set(offsetX);
    y.set(offsetY);
    rotate.set(targetX * 10 * card.depth);
  }, [targetX, targetY, card.depth, x, y, rotate]);

  useEffect(() => {
    scale.set(isHovered ? 1.15 : 1);
  }, [isHovered, scale]);

  const sizeClasses = {
    small: "h-20 w-20",
    medium: "h-28 w-28",
    large: "h-36 w-36",
  };

  const emojiSizes = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-5xl",
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${50 + card.position.x}%`,
        top: `${50 + card.position.y}%`,
        x: useTransform(x, (v) => v - 50),
        y: useTransform(y, (v) => v - 50),
        rotate,
        scale,
        zIndex: isHovered ? 50 : Math.round(card.depth * 10),
      }}
      onHoverStart={() => onHover(card.id)}
      onHoverEnd={() => onHover(null)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`${sizeClasses[card.size as keyof typeof sizeClasses]} relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} shadow-xl`}
        animate={{
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Glass effect */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center">
          <span className={emojiSizes[card.size as keyof typeof emojiSizes]}>
            {card.emoji}
          </span>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-1 text-xs font-medium text-white/90"
              >
                {card.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Experiment5() {
  const {
    combinedPosition,
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated mesh gradient background */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(at ${30 + smoothedPosition.x * 20}% ${30 + smoothedPosition.y * 20}%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
            radial-gradient(at ${70 - smoothedPosition.x * 20}% ${70 - smoothedPosition.y * 20}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(at ${50 + smoothedPosition.x * 10}% ${50 + smoothedPosition.y * 10}%, rgba(168, 85, 247, 0.2) 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating dots background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => {
          const seededX = (i * 47 + 13) % 100;
          const seededY = (i * 31 + 7) % 100;
          const seededDepth = 0.3 + ((i * 17) % 10) / 10;
          return (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20"
              style={{
                left: `${seededX}%`,
                top: `${seededY}%`,
              }}
              animate={{
                x: smoothedPosition.x * 50 * seededDepth,
                y: smoothedPosition.y * 40 * seededDepth,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          );
        })}
      </div>

      {/* Center title */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{
          x: smoothedPosition.x * -20,
          y: smoothedPosition.y * -15,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="text-center">
          <h1 className="text-7xl font-black tracking-tighter text-white/10">
            KINETIC
          </h1>
        </div>
      </motion.div>

      {/* Floating cards */}
      {floatingCards.map((card) => (
        <FloatingCard
          key={card.id}
          card={card}
          targetX={smoothedPosition.x}
          targetY={smoothedPosition.y}
          isHovered={hoveredCard === card.id}
          onHover={setHoveredCard}
        />
      ))}

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

      {/* Route label */}
      <div className="absolute right-4 top-4 font-mono text-sm text-white/50">
        /experiment-5
      </div>

      {/* Instructions */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-white/40">
          Move your head to see cards float • Hover to interact
        </p>
      </motion.div>
    </div>
  );
}
