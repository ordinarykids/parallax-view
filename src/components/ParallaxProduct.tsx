"use client";

import Image from "next/image";
import { useState } from "react";

interface ParallaxProductProps {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  imageSrc?: string;
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
      className="relative h-[300px] w-[300px]"
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
          className="absolute inset-0 flex items-center justify-center border-2 border-amber-300 bg-gradient-to-br from-amber-400 to-amber-600"
          style={{ transform: "translateZ(150px)" }}
        >
          <span className="text-4xl font-bold text-white/80">PRODUCT</span>
        </div>
        {/* Back face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-900"
          style={{ transform: "translateZ(-150px) rotateY(180deg)" }}
        />
        {/* Right face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700"
          style={{
            width: "300px",
            transform: "rotateY(90deg) translateZ(150px)",
          }}
        />
        {/* Left face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-800"
          style={{
            width: "300px",
            transform: "rotateY(-90deg) translateZ(150px)",
          }}
        />
        {/* Top face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500"
          style={{
            height: "300px",
            transform: "rotateX(90deg) translateZ(150px)",
          }}
        />
        {/* Bottom face */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-950"
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
}: ParallaxProductProps) {
  const [imageError, setImageError] = useState(false);
  const scale = 1 + offsetZ * 0.15;

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
