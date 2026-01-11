"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface FaceSketchProps {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  zoom?: number;
}

// Face mesh connections for drawing lines
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109, 10,
];

const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362];
const LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_EYEBROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];
const NOSE_BRIDGE = [168, 6, 197, 195, 5];
const NOSE_BOTTOM = [60, 20, 238, 239, 241, 125, 19, 354, 461, 459, 458, 250, 290, 60];
const OUTER_LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];
const INNER_LIPS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78];

export function FaceSketch({ offsetX, offsetY, offsetZ, zoom = 1 }: FaceSketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeFaceLandmarker = useCallback(async () => {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        }
      );

      faceLandmarkerRef.current = faceLandmarker;
      return faceLandmarker;
    } catch (err) {
      console.error("Failed to initialize FaceLandmarker:", err);
      throw err;
    }
  }, []);

  const drawPath = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      landmarks: { x: number; y: number }[],
      indices: number[],
      width: number,
      height: number
    ) => {
      if (indices.length < 2) return;

      ctx.beginPath();
      const first = landmarks[indices[0]];
      ctx.moveTo(first.x * width, first.y * height);

      for (let i = 1; i < indices.length; i++) {
        const point = landmarks[indices[i]];
        ctx.lineTo(point.x * width, point.y * height);
      }
      ctx.stroke();
    },
    []
  );

  const detectAndDraw = useCallback(() => {
    if (!faceLandmarkerRef.current || !videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectAndDraw);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectAndDraw);
      return;
    }

    try {
      const results = faceLandmarkerRef.current.detectForVideo(
        video,
        performance.now()
      );

      // Clear canvas
      ctx.fillStyle = "transparent";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results?.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        // Set drawing style - white lines for sketch effect
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const width = canvas.width;
        const height = canvas.height;

        // Draw face outline
        drawPath(ctx, landmarks, FACE_OVAL, width, height);

        // Draw eyes
        drawPath(ctx, landmarks, LEFT_EYE, width, height);
        drawPath(ctx, landmarks, RIGHT_EYE, width, height);

        // Draw eyebrows
        ctx.lineWidth = 2.5;
        drawPath(ctx, landmarks, LEFT_EYEBROW, width, height);
        drawPath(ctx, landmarks, RIGHT_EYEBROW, width, height);

        // Draw nose
        ctx.lineWidth = 1.5;
        drawPath(ctx, landmarks, NOSE_BRIDGE, width, height);
        drawPath(ctx, landmarks, NOSE_BOTTOM, width, height);

        // Draw lips
        ctx.lineWidth = 2;
        drawPath(ctx, landmarks, OUTER_LIPS, width, height);
        ctx.lineWidth = 1;
        drawPath(ctx, landmarks, INNER_LIPS, width, height);

        // Draw iris dots
        ctx.fillStyle = "#ffffff";
        const leftIris = landmarks[468];
        const rightIris = landmarks[473];
        ctx.beginPath();
        ctx.arc(leftIris.x * width, leftIris.y * height, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightIris.x * width, rightIris.y * height, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } catch (err) {
      console.warn("Face detection error:", err);
    }

    animationFrameRef.current = requestAnimationFrame(detectAndDraw);
  }, [drawPath]);

  const startCamera = useCallback(async () => {
    try {
      await initializeFaceLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsInitialized(true);
      detectAndDraw();
    } catch (err) {
      console.error("Failed to start camera:", err);
    }
  }, [initializeFaceLandmarker, detectAndDraw]);

  useEffect(() => {
    startCamera();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, [startCamera]);

  const scale = (1 + offsetZ * 0.15) * zoom;
  const rotateY = -offsetX * 25;
  const rotateX = offsetY * 25;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        style={{
          transform: `
            translate(${offsetX * 50}px, ${offsetY * 50}px)
            scale(${scale})
            rotateY(${rotateY}deg)
            rotateX(${rotateX}deg)
          `,
          transformStyle: "preserve-3d",
          transition: "transform 0.05s ease-out",
        }}
      >
        {/* Hidden video element for capture */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />

        {/* Canvas for sketch drawing */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          style={{
            transform: "scaleX(-1)", // Mirror the sketch
          }}
        />

        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            Loading camera...
          </div>
        )}
      </div>
    </div>
  );
}
