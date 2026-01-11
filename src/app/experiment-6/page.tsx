"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
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
  smoothing: 0.1,
};

// 3D Carousel cards
const carouselCards = [
  {
    id: 1,
    title: "Explore",
    description: "Discover new horizons",
    image: "🏔️",
    accent: "#8B5CF6",
  },
  {
    id: 2,
    title: "Create",
    description: "Build something amazing",
    image: "🎨",
    accent: "#EC4899",
  },
  {
    id: 3,
    title: "Connect",
    description: "Join the community",
    image: "🤝",
    accent: "#06B6D4",
  },
  {
    id: 4,
    title: "Grow",
    description: "Level up your skills",
    image: "🌱",
    accent: "#10B981",
  },
  {
    id: 5,
    title: "Launch",
    description: "Ship with confidence",
    image: "🚀",
    accent: "#F59E0B",
  },
];

function CarouselCard({
  card,
  index,
  totalCards,
  rotation,
  tiltX,
  tiltY,
  isActive,
}: {
  card: (typeof carouselCards)[0];
  index: number;
  totalCards: number;
  rotation: number;
  tiltX: number;
  tiltY: number;
  isActive: boolean;
}) {
  const angle = (index / totalCards) * 360 + rotation;
  const radian = (angle * Math.PI) / 180;
  const radius = 280;

  const x = Math.sin(radian) * radius;
  const z = Math.cos(radian) * radius - radius;
  const cardRotation = -angle;

  // Opacity based on z position (front = 1, back = 0.3)
  const normalizedZ = (z + radius) / (radius * 2);
  const opacity = 0.3 + normalizedZ * 0.7;
  const scale = 0.7 + normalizedZ * 0.3;

  const cardSpring = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    cardSpring.set(isActive ? 1.1 : 1);
  }, [isActive, cardSpring]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        x,
        z,
        rotateY: cardRotation,
        rotateX: tiltY * 10,
        scale: useTransform(cardSpring, (s) => s * scale),
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="h-88 relative -ml-32 -mt-44 w-64 cursor-pointer overflow-hidden rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${card.accent}22, ${card.accent}44)`,
          border: `1px solid ${card.accent}44`,
          boxShadow: isActive
            ? `0 30px 60px -15px ${card.accent}66`
            : "0 20px 40px -15px rgba(0,0,0,0.5)",
        }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 backdrop-blur-xl" />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center p-6">
          <motion.div
            className="mb-4 text-7xl"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          >
            {card.image}
          </motion.div>

          <h3 className="text-2xl font-bold" style={{ color: card.accent }}>
            {card.title}
          </h3>

          <p className="mt-2 text-center text-sm text-white/60">
            {card.description}
          </p>

          {/* Decorative elements */}
          <div
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
            style={{ background: card.accent }}
          />
          <div
            className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full opacity-20 blur-2xl"
            style={{ background: card.accent }}
          />
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
          style={{
            x: tiltX * 50,
            y: tiltY * 30,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function Experiment6() {
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

  // Carousel rotation with momentum
  const rotationVelocity = useMotionValue(0);
  const rotation = useSpring(0, { stiffness: 50, damping: 20, mass: 2 });
  const lastXRef = useRef(0);

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

    // Calculate velocity for momentum
    const deltaX = newPosition.x - lastXRef.current;
    rotationVelocity.set(deltaX * 500);
    lastXRef.current = newPosition.x;

    // Update carousel rotation based on head position
    rotation.set(newPosition.x * 60);
  }, [combinedPosition, settings, rotation, rotationVelocity]);

  const handleToggleTracking = useCallback(async () => {
    if (isTracking) {
      stopTracking();
    } else {
      await startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  // Find the active (front-most) card
  const currentRotation = rotation.get();
  const activeIndex =
    Math.round(
      (((-currentRotation % 360) + 360) % 360) / (360 / carouselCards.length),
    ) % carouselCards.length;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Radial gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at ${50 + smoothedPosition.x * 20}% ${40 + smoothedPosition.y * 20}%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-violet-950/20 to-transparent" />

      {/* 3D Carousel container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: "1000px",
          perspectiveOrigin: `${50 + smoothedPosition.x * 10}% ${50 + smoothedPosition.y * 10}%`,
        }}
      >
        <motion.div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            rotateX: smoothedPosition.y * 5,
          }}
        >
          {carouselCards.map((card, index) => (
            <CarouselCard
              key={card.id}
              card={card}
              index={index}
              totalCards={carouselCards.length}
              rotation={currentRotation}
              tiltX={smoothedPosition.x}
              tiltY={smoothedPosition.y}
              isActive={index === activeIndex}
            />
          ))}
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        className="absolute left-1/2 top-12 -translate-x-1/2 text-center"
        style={{
          x: smoothedPosition.x * -40,
          y: smoothedPosition.y * -20,
        }}
      >
        <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          3D Carousel
        </h1>
        <p className="mt-2 text-white/40">
          Move your head to rotate • Cards respond with momentum
        </p>
      </motion.div>

      {/* Active card indicator */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
        {carouselCards.map((card, index) => (
          <motion.div
            key={card.id}
            className="h-2 w-2 rounded-full"
            animate={{
              scale: index === activeIndex ? 1.5 : 1,
              backgroundColor:
                index === activeIndex ? card.accent : "#ffffff33",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        ))}
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

      {/* Route label */}
      <div className="absolute right-4 top-4 font-mono text-sm text-white/50">
        /experiment-6
      </div>
    </div>
  );
}
