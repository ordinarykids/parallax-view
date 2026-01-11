"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export interface FacePosition {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (top to bottom)
  z: number; // depth estimate
}

export interface GazeData {
  x: number; // -1 to 1 (looking left to right)
  y: number; // -1 to 1 (looking up to down)
}

export interface UseFaceTrackingReturn {
  facePosition: FacePosition;
  gazePosition: GazeData;
  combinedPosition: FacePosition; // Head + gaze blended
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  gazeWeight: number;
  setGazeWeight: (weight: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

// MediaPipe face landmark indices
const LANDMARKS = {
  // Eye corners for gaze calculation
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  // Iris centers
  LEFT_IRIS_CENTER: 468,
  RIGHT_IRIS_CENTER: 473,
  // Face reference points
  NOSE_TIP: 1,
  LEFT_EAR: 234,
  RIGHT_EAR: 454,
};

function calculateGaze(landmarks: { x: number; y: number; z: number }[]): GazeData {
  // Get eye corners and iris positions
  const leftEyeInner = landmarks[LANDMARKS.LEFT_EYE_INNER];
  const leftEyeOuter = landmarks[LANDMARKS.LEFT_EYE_OUTER];
  const leftEyeTop = landmarks[LANDMARKS.LEFT_EYE_TOP];
  const leftEyeBottom = landmarks[LANDMARKS.LEFT_EYE_BOTTOM];
  const leftIris = landmarks[LANDMARKS.LEFT_IRIS_CENTER];

  const rightEyeInner = landmarks[LANDMARKS.RIGHT_EYE_INNER];
  const rightEyeOuter = landmarks[LANDMARKS.RIGHT_EYE_OUTER];
  const rightEyeTop = landmarks[LANDMARKS.RIGHT_EYE_TOP];
  const rightEyeBottom = landmarks[LANDMARKS.RIGHT_EYE_BOTTOM];
  const rightIris = landmarks[LANDMARKS.RIGHT_IRIS_CENTER];

  // Calculate left eye gaze
  const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
  const leftEyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y);
  const leftEyeCenterX = (leftEyeInner.x + leftEyeOuter.x) / 2;
  const leftEyeCenterY = (leftEyeTop.y + leftEyeBottom.y) / 2;

  // Iris position relative to eye center, normalized
  const leftGazeX = leftEyeWidth > 0 ? (leftIris.x - leftEyeCenterX) / (leftEyeWidth * 0.5) : 0;
  const leftGazeY = leftEyeHeight > 0 ? (leftIris.y - leftEyeCenterY) / (leftEyeHeight * 0.5) : 0;

  // Calculate right eye gaze
  const rightEyeWidth = Math.abs(rightEyeInner.x - rightEyeOuter.x);
  const rightEyeHeight = Math.abs(rightEyeBottom.y - rightEyeTop.y);
  const rightEyeCenterX = (rightEyeInner.x + rightEyeOuter.x) / 2;
  const rightEyeCenterY = (rightEyeTop.y + rightEyeBottom.y) / 2;

  const rightGazeX = rightEyeWidth > 0 ? (rightIris.x - rightEyeCenterX) / (rightEyeWidth * 0.5) : 0;
  const rightGazeY = rightEyeHeight > 0 ? (rightIris.y - rightEyeCenterY) / (rightEyeHeight * 0.5) : 0;

  // Average both eyes and clamp to -1, 1
  const gazeX = Math.max(-1, Math.min(1, (leftGazeX + rightGazeX) / 2));
  const gazeY = Math.max(-1, Math.min(1, (leftGazeY + rightGazeY) / 2));

  // Invert X because video is mirrored
  return { x: -gazeX, y: gazeY };
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
  const [gazePosition, setGazePosition] = useState<GazeData>({ x: 0, y: 0 });
  const [combinedPosition, setCombinedPosition] = useState<FacePosition>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [gazeWeight, setGazeWeight] = useState(0.4); // 40% gaze, 60% head position
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

    try {
      const results = faceLandmarkerRef.current.detectForVideo(
        video,
        performance.now()
      );

      if (results?.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];

      // === Head Position ===
      const noseTip = landmarks[LANDMARKS.NOSE_TIP];

      // Calculate normalized position (-1 to 1)
      // Video is mirrored, so we invert X
      const headX = -(noseTip.x - 0.5) * 2;
      const headY = -(noseTip.y - 0.5) * 2;

      // Estimate depth based on face width (distance between ears)
      const leftEar = landmarks[LANDMARKS.LEFT_EAR];
      const rightEar = landmarks[LANDMARKS.RIGHT_EAR];
      const faceWidth = Math.abs(rightEar.x - leftEar.x);

      // Normalize depth: smaller face = further away = negative z
      const baselineWidth = 0.3;
      const headZ = (faceWidth - baselineWidth) * 3;

      setFacePosition({ x: headX, y: headY, z: headZ });

      // === Gaze Estimation ===
      const gaze = calculateGaze(landmarks);
      setGazePosition(gaze);

      // === Combined Position (Head + Gaze) ===
      // Blend head position with gaze direction
      const combinedX = headX * (1 - gazeWeight) + gaze.x * gazeWeight;
      const combinedY = headY * (1 - gazeWeight) + gaze.y * gazeWeight;

      setCombinedPosition({
        x: combinedX,
        y: combinedY,
        z: headZ, // Depth stays from head position
      });
      }
    } catch (err) {
      // Silently handle detection errors to keep the loop running
      console.warn("Face detection error:", err);
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  }, [gazeWeight]);

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
    gazePosition,
    combinedPosition,
    videoRef,
    isTracking,
    isLoading,
    error,
    gazeWeight,
    setGazeWeight,
    startTracking,
    stopTracking,
  };
}
