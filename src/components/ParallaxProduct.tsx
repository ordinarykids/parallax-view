"use client";

import Image from "next/image";
import { useState } from "react";

interface ParallaxProductProps {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  imageSrc?: string;
  zoom?: number;
}

function Placeholder3DShape({
  offsetX,
  offsetY,
}: {
  offsetX: number;
  offsetY: number;
}) {
  // Create a 3D-looking cube that rotates based on head position
  // Reversed: move head right -> rotate left (see right side of object)
  const rotateY = -offsetX * 65;
  const rotateX = offsetY * 65;

  return (
    <div
      className="relative h-[600px] w-[600px]"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 flex items-center justify-center border-2 from-amber-400 to-amber-600"
          style={{ transform: "translateZ(150px)" }}
        >
          <span className="text-6xl font-bold text-white/80">OK</span>
        </div>
        {/* Back face */}
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{ transform: "translateZ(-150px) rotateY(180deg)" }}
        />
        {/* Right face */}
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            width: "300px",
            transform: "rotateY(90deg) translateZ(150px)",
          }}
        />
        {/* Left face */}
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            width: "300px",
            transform: "rotateY(-90deg) translateZ(150px)",
          }}
        />
        {/* Top face */}
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            height: "300px",
            transform: "rotateX(90deg) translateZ(150px)",
          }}
        />
        {/* Bottom face */}
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            height: "300px",
            transform: "rotateX(-90deg) translateZ(150px)",
          }}
        />
      </div>
    </div>
  );
}

export function ParallaxProduct({
  offsetX,
  offsetY,
  offsetZ,
  imageSrc,
  zoom = 1,
}: ParallaxProductProps) {
  const [imageError, setImageError] = useState(false);
  // Scale based on depth + zoom level
  const scale = (1 + offsetZ * 0.15) * zoom;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{
        transform: `
          translate(${offsetX * 50}px, ${offsetY * 50}px)
          scale(${scale})
        `,
        transition: "transform 0.05s ease-out",
      }}
    >
      {imageSrc && !imageError ? (
        <div className="relative h-[400px] w-[600px]">
          <Image
            src={imageSrc}
            alt="Product"
            fill
            className="object-contain drop-shadow-2xl"
            priority
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <Placeholder3DShape offsetX={offsetX} offsetY={offsetY} />
      )}
    </div>
  );
}
