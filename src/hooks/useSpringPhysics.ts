"use client";

import { useState, useRef, useEffect } from "react";

interface SpringConfig {
  stiffness: number; // Spring stiffness (higher = snappier)
  damping: number; // Damping (higher = less oscillation)
  mass: number; // Mass (higher = more inertia)
}

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const defaultConfig: SpringConfig = {
  stiffness: 120,
  damping: 14,
  mass: 1,
};

export function useSpringPhysics(
  targetX: number,
  targetY: number,
  config: Partial<SpringConfig> = {},
) {
  const { stiffness, damping, mass } = { ...defaultConfig, ...config };

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stateRef = useRef<PhysicsState>({ x: 0, y: 0, vx: 0, vy: 0 });
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const targetRef = useRef({ x: targetX, y: targetY });
  const configRef = useRef({ stiffness, damping, mass });

  // Update refs when props change
  useEffect(() => {
    targetRef.current = { x: targetX, y: targetY };
  }, [targetX, targetY]);

  useEffect(() => {
    configRef.current = { stiffness, damping, mass };
  }, [stiffness, damping, mass]);

  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.064); // Cap delta time
      lastTimeRef.current = now;

      const state = stateRef.current;
      const target = targetRef.current;
      const cfg = configRef.current;

      // Spring force: F = -k * displacement
      const dx = state.x - target.x;
      const dy = state.y - target.y;

      const springForceX = -cfg.stiffness * dx;
      const springForceY = -cfg.stiffness * dy;

      // Damping force: F = -c * velocity
      const dampingForceX = -cfg.damping * state.vx;
      const dampingForceY = -cfg.damping * state.vy;

      // Acceleration: a = F / m
      const ax = (springForceX + dampingForceX) / cfg.mass;
      const ay = (springForceY + dampingForceY) / cfg.mass;

      // Update velocity
      state.vx += ax * dt;
      state.vy += ay * dt;

      // Update position
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      setPosition({ x: state.x, y: state.y });

      // Continue animation if still moving
      const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.001 || distance > 0.001) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // Empty deps - animation loop runs continuously

  return position;
}

// Hook for multiple springs with different delays/configs
export function useSpringChain(
  targetX: number,
  targetY: number,
  count: number,
  baseConfig: Partial<SpringConfig> = {},
) {
  const springs = Array.from({ length: count }, (_, i) => {
    // Each subsequent item has slightly different physics
    const config = {
      stiffness: (baseConfig.stiffness || 120) - i * 10,
      damping: (baseConfig.damping || 14) - i * 1,
      mass: (baseConfig.mass || 1) + i * 0.2,
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSpringPhysics(targetX, targetY, config);
  });

  return springs;
}
