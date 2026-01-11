# Parallax View

Face-tracking parallax experiments using webcam-based head position and gaze detection. Move your head to explore 3D depth effects in real-time.

![Parallax View](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Face%20Detection-orange?logo=tensorflow)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Landmarks-blue)

## Experiments

### `/experiment-1` — Product Viewer

3D product display with a perspective grid room. The object rotates based on head position, creating a "window into another world" effect.

**Features:**

- 3D cube with face-based rotation
- Perspective grid room (floor, ceiling, walls)
- Gaze tracking indicator (pink dot)
- Adjustable parallax settings

### `/experiment-2` — Face Sketch

Real-time face landmark detection rendered as minimalist line art. Your face becomes a sketch that moves in 3D space.

**Features:**

- Live MediaPipe face mesh detection
- Line art rendering (eyes, nose, lips, face outline)
- 3D perspective transformation
- Combined head + gaze tracking

### `/experiment-3` — Depth Field

Ambient floating orbs and particles with multi-layer parallax. A meditative exploration of depth perception.

**Features:**

- Multi-layer parallax (orbs at different depths)
- Gradient blur effects
- Particle field with depth variation
- Minimal typography with parallax offset

---

## Getting Started

### Prerequisites

- Node.js 18+
- Webcam access
- Modern browser (Chrome/Edge recommended for WebGL)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the experiment hub.

### Build

```bash
npm run build
npm start
```

---

## How It Works

### Face Tracking

Uses TensorFlow.js with the `face-landmarks-detection` model to detect:

- **Head position** (X, Y) — normalized coordinates of face center
- **Depth estimation** (Z) — based on face bounding box size
- **Gaze direction** — iris position relative to eye bounds

### Parallax Effect

Head position is mapped to parallax offset:

- Moving head **left/right** shifts the scene horizontally
- Moving head **up/down** shifts vertically
- Moving **closer/farther** affects depth/zoom

### Smoothing

Position updates use linear interpolation (lerp) for smooth motion:

```typescript
const lerp = (a, b, t) => a + (b - a) * t;
newPosition = lerp(currentPosition, targetPosition, smoothing);
```

---

## Controls

Each experiment includes a control panel with:

| Setting          | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| **Parallax X/Y** | Min/max range for horizontal/vertical offset                              |
| **Zoom**         | Depth multiplier                                                          |
| **Smoothing**    | Motion smoothness (0.01 = very smooth, 0.5 = responsive)                  |
| **Gaze Weight**  | Balance between head position and eye gaze (0 = head only, 1 = gaze only) |

---

## Tech Stack

- **Next.js 15** — React framework with App Router
- **TensorFlow.js** — Face detection ML model
- **MediaPipe** — Face landmarks for sketch rendering
- **Tailwind CSS v4** — Styling
- **shadcn/ui** — UI components (slider, card)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Experiment hub
│   ├── experiment-1/         # Product viewer
│   ├── experiment-2/         # Face sketch
│   └── experiment-3/         # Depth field
├── components/
│   ├── ParallaxScene.tsx     # Main scene wrapper
│   ├── ParallaxProduct.tsx   # 3D product display
│   ├── PerspectiveGrid.tsx   # SVG perspective room
│   ├── FaceSketch.tsx        # Face landmark renderer
│   ├── GazeIndicator.tsx     # Gaze tracking dot
│   ├── ControlPanel.tsx      # Settings UI
│   ├── WebcamPreview.tsx     # Camera feed preview
│   └── ui/                   # shadcn components
└── hooks/
    └── useFaceTracking.ts    # Face detection hook
```

---

## Tips for Best Results

1. **Good lighting** — Face detection works best with even, front-facing light
2. **Camera position** — Center your face in the webcam frame
3. **Distance** — Sit 40-80cm from the camera
4. **Background** — Plain backgrounds improve detection accuracy

---

## License

MIT
