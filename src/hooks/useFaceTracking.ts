"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export interface FacePosition {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (top to bottom)
  z: number; // depth estimate
}

export interface UseFaceTrackingReturn {
  facePosition: FacePosition;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

export function useFaceTracking(): UseFaceTrackingReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facePosition, setFacePosition] = useState<FacePosition>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        }
      );

      faceLandmarkerRef.current = faceLandmarker;
      return faceLandmarker;
    } catch (err) {
      console.error("Failed to initialize FaceLandmarker:", err);
      throw err;
    }
  }, []);

  const detectFace = useCallback(() => {
    if (!faceLandmarkerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    const results = faceLandmarkerRef.current.detectForVideo(
      video,
      performance.now()
    );

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];

      // Use nose tip (index 1) as primary position reference
      const noseTip = landmarks[1];

      // Calculate normalized position (-1 to 1)
      // Video is mirrored, so we invert X
      const x = -(noseTip.x - 0.5) * 2;
      const y = -(noseTip.y - 0.5) * 2;

      // Estimate depth based on face width (distance between ears)
      const leftEar = landmarks[234];
      const rightEar = landmarks[454];
      const faceWidth = Math.abs(rightEar.x - leftEar.x);

      // Normalize depth: smaller face = further away = negative z
      // Baseline face width ~0.3 when at normal distance
      const baselineWidth = 0.3;
      const z = (faceWidth - baselineWidth) * 3;

      setFacePosition({ x, y, z });
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  }, []);

  const startTracking = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize face landmarker if not already done
      if (!faceLandmarkerRef.current) {
        await initializeFaceLandmarker();
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsTracking(true);
      detectFace();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start tracking";
      setError(message);
      console.error("Failed to start face tracking:", err);
    } finally {
      setIsLoading(false);
    }
  }, [initializeFaceLandmarker, detectFace]);

  const stopTracking = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, [stopTracking]);

  return {
    facePosition,
    videoRef,
    isTracking,
    isLoading,
    error,
    startTracking,
    stopTracking,
  };
}
