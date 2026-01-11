"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
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
  smoothing: 0.15,
};

// Card data
const cards = [
  {
    id: 1,
    title: "Momentum",
    subtitle: "Physics in motion",
    gradient: "from-violet-600 to-indigo-600",
    icon: "◈",
  },
  {
    id: 2,
    title: "Velocity",
    subtitle: "Speed & direction",
    gradient: "from-rose-500 to-pink-600",
    icon: "◇",
  },
  {
    id: 3,
    title: "Inertia",
    subtitle: "Resistance to change",
    gradient: "from-amber-500 to-orange-600",
    icon: "○",
  },
  {
    id: 4,
    title: "Gravity",
    subtitle: "Natural attraction",
    gradient: "from-emerald-500 to-teal-600",
    icon: "△",
  },
  {
    id: 5,
    title: "Elasticity",
    subtitle: "Spring & bounce",
    gradient: "from-cyan-500 to-blue-600",
    icon: "□",
  },
];

function PhysicsCard({
  card,
  index,
  targetX,
  targetY,
}: {
  card: (typeof cards)[0];
  index: number;
  targetX: number;
  targetY: number;
}) {
  // Each card has different spring physics based on its index
  const springConfig = {
    stiffness: 300 - index * 40,
    damping: 20 + index * 2,
    mass: 0.5 + index * 0.15,
  };

  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const rotateX = useSpring(0, { stiffness: 200, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 30 });
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  // Update spring targets when head moves
  useEffect(() => {
    const offsetMultiplier = 1 + index * 0.3;
    x.set(targetX * 80 * offsetMultiplier);
    y.set(targetY * 60 * offsetMultiplier);
    rotateY.set(targetX * 15);
    rotateX.set(-targetY * 10);
  }, [targetX, targetY, index, x, y, rotateX, rotateY]);

  // Card position in the stack
  const baseX = (index - 2) * 220;
  const baseY = Math.abs(index - 2) * 20;
  const baseRotate = (index - 2) * 5;
  const baseScale = 1 - Math.abs(index - 2) * 0.05;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        x: useTransform(x, (v) => baseX + v),
        y: useTransform(y, (v) => baseY + v),
        rotateX,
        rotateY,
        rotate: baseRotate,
        scale: useTransform(scale, (s) => s * baseScale),
        zIndex: 10 - Math.abs(index - 2),
      }}
      whileHover={{ scale: baseScale * 1.05, zIndex: 20 }}
      onHoverStart={() => scale.set(1.05)}
      onHoverEnd={() => scale.set(1)}
    >
      <div
        className={`relative h-72 w-52 overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} p-6 shadow-2xl`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="text-6xl text-white/80">{card.icon}</div>
          <div>
            <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
            <p className="mt-1 text-sm text-white/70">{card.subtitle}</p>
          </div>
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          style={{
            x: useTransform(x, (v) => v * 0.5),
            y: useTransform(y, (v) => v * 0.5),
          }}
        />
      </div>
    </motion.div>
  );
}

export default function Experiment4() {
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
    <div className="relative h-screen w-full overflow-hidden bg-neutral-950">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at ${50 + smoothedPosition.x * 30}% ${50 + smoothedPosition.y * 30}%, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 50%)`,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: `translate(${smoothedPosition.x * 20}px, ${smoothedPosition.y * 20}px)`,
        }}
      />

      {/* Card stack */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {cards.map((card, index) => (
          <PhysicsCard
            key={card.id}
            card={card}
            index={index}
            targetX={smoothedPosition.x}
            targetY={smoothedPosition.y}
          />
        ))}
      </div>

      {/* Title */}
      <motion.div
        className="absolute left-1/2 top-16 -translate-x-1/2 text-center"
        style={{
          x: smoothedPosition.x * -30,
          y: smoothedPosition.y * -20,
        }}
      >
        <h1 className="text-5xl font-light tracking-tight text-white/90">
          Spring Physics
        </h1>
        <p className="mt-2 text-lg text-white/40">
          Cards respond with natural momentum
        </p>
      </motion.div>

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
        /experiment-4
      </div>
    </div>
  );
}
