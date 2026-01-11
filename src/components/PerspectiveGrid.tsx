"use client";

interface PerspectiveGridProps {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  gridColor?: string;
}

export function PerspectiveGrid({
  offsetX,
  offsetY,
  offsetZ,
  gridColor = "#ffffff",
}: PerspectiveGridProps) {
  // Vanishing point shifts based on head position
  const vanishX = 50 + offsetX * 15;
  const vanishY = 50 + offsetY * 15;

  // Depth scaling based on Z
  const depthScale = 1 + offsetZ * 0.1;

  // Grid configuration
  const gridLines = 12;
  const gridSpacing = 100 / gridLines;

  // Calculate how far the "back wall" appears (smaller = deeper room)
  const backWallScale = 0.5 * depthScale;

  // Back wall boundaries (the small rectangle in the center representing the back of the box)
  const backLeft = vanishX - (50 * backWallScale);
  const backRight = vanishX + (50 * backWallScale);
  const backTop = vanishY - (50 * backWallScale);
  const backBottom = vanishY + (50 * backWallScale);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Back wall grid */}
        <g opacity="0.8">
          {/* Vertical lines on back wall */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const x = backLeft + (i / gridLines) * (backRight - backLeft);
            return (
              <line
                key={`back-v-${i}`}
                x1={x}
                y1={backTop}
                x2={x}
                y2={backBottom}
                stroke={gridColor}
                strokeWidth="0.08"
              />
            );
          })}
          {/* Horizontal lines on back wall */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const y = backTop + (i / gridLines) * (backBottom - backTop);
            return (
              <line
                key={`back-h-${i}`}
                x1={backLeft}
                y1={y}
                x2={backRight}
                y2={y}
                stroke={gridColor}
                strokeWidth="0.08"
              />
            );
          })}
        </g>

        {/* Floor - lines extending from screen edge to back wall */}
        <g opacity="0.7">
          {/* Lines going into depth (toward vanishing point) */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const screenX = (i / gridLines) * 100;
            const backX = backLeft + (i / gridLines) * (backRight - backLeft);
            return (
              <line
                key={`floor-depth-${i}`}
                x1={screenX}
                y1={100}
                x2={backX}
                y2={backBottom}
                stroke={gridColor}
                strokeWidth="0.1"
              />
            );
          })}
          {/* Horizontal lines on floor (getting closer together toward back) */}
          {Array.from({ length: gridLines }).map((_, i) => {
            const progress = (i + 1) / gridLines;
            // Use exponential distribution for more realistic perspective
            const perspectiveProgress = Math.pow(progress, 0.7);
            const y = 100 - perspectiveProgress * (100 - backBottom);
            const leftX = 0 + perspectiveProgress * backLeft;
            const rightX = 100 - perspectiveProgress * (100 - backRight);
            return (
              <line
                key={`floor-h-${i}`}
                x1={leftX}
                y1={y}
                x2={rightX}
                y2={y}
                stroke={gridColor}
                strokeWidth="0.1"
                opacity={0.5 + progress * 0.5}
              />
            );
          })}
        </g>

        {/* Ceiling - lines extending from screen edge to back wall */}
        <g opacity="0.7">
          {/* Lines going into depth */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const screenX = (i / gridLines) * 100;
            const backX = backLeft + (i / gridLines) * (backRight - backLeft);
            return (
              <line
                key={`ceil-depth-${i}`}
                x1={screenX}
                y1={0}
                x2={backX}
                y2={backTop}
                stroke={gridColor}
                strokeWidth="0.1"
              />
            );
          })}
          {/* Horizontal lines on ceiling */}
          {Array.from({ length: gridLines }).map((_, i) => {
            const progress = (i + 1) / gridLines;
            const perspectiveProgress = Math.pow(progress, 0.7);
            const y = perspectiveProgress * backTop;
            const leftX = 0 + perspectiveProgress * backLeft;
            const rightX = 100 - perspectiveProgress * (100 - backRight);
            return (
              <line
                key={`ceil-h-${i}`}
                x1={leftX}
                y1={y}
                x2={rightX}
                y2={y}
                stroke={gridColor}
                strokeWidth="0.1"
                opacity={0.5 + progress * 0.5}
              />
            );
          })}
        </g>

        {/* Left wall */}
        <g opacity="0.6">
          {/* Vertical lines on left wall */}
          {Array.from({ length: Math.floor(gridLines / 2) + 1 }).map((_, i) => {
            const progress = i / (gridLines / 2);
            const perspectiveProgress = Math.pow(progress, 0.7);
            const x = perspectiveProgress * backLeft;
            const topY = perspectiveProgress * backTop;
            const bottomY = 100 - perspectiveProgress * (100 - backBottom);
            return (
              <line
                key={`left-v-${i}`}
                x1={x}
                y1={topY}
                x2={x}
                y2={bottomY}
                stroke={gridColor}
                strokeWidth="0.1"
                opacity={0.4 + progress * 0.6}
              />
            );
          })}
          {/* Horizontal lines going into depth on left wall */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const screenY = (i / gridLines) * 100;
            const backY = backTop + (i / gridLines) * (backBottom - backTop);
            return (
              <line
                key={`left-h-${i}`}
                x1={0}
                y1={screenY}
                x2={backLeft}
                y2={backY}
                stroke={gridColor}
                strokeWidth="0.1"
              />
            );
          })}
        </g>

        {/* Right wall */}
        <g opacity="0.6">
          {/* Vertical lines on right wall */}
          {Array.from({ length: Math.floor(gridLines / 2) + 1 }).map((_, i) => {
            const progress = i / (gridLines / 2);
            const perspectiveProgress = Math.pow(progress, 0.7);
            const x = 100 - perspectiveProgress * (100 - backRight);
            const topY = perspectiveProgress * backTop;
            const bottomY = 100 - perspectiveProgress * (100 - backBottom);
            return (
              <line
                key={`right-v-${i}`}
                x1={x}
                y1={topY}
                x2={x}
                y2={bottomY}
                stroke={gridColor}
                strokeWidth="0.1"
                opacity={0.4 + progress * 0.6}
              />
            );
          })}
          {/* Horizontal lines going into depth on right wall */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const screenY = (i / gridLines) * 100;
            const backY = backTop + (i / gridLines) * (backBottom - backTop);
            return (
              <line
                key={`right-h-${i}`}
                x1={100}
                y1={screenY}
                x2={backRight}
                y2={backY}
                stroke={gridColor}
                strokeWidth="0.1"
              />
            );
          })}
        </g>

        {/* Corner edges of the box for definition */}
        <g opacity="0.9">
          {/* Top-left edge */}
          <line x1={0} y1={0} x2={backLeft} y2={backTop} stroke={gridColor} strokeWidth="0.3" />
          {/* Top-right edge */}
          <line x1={100} y1={0} x2={backRight} y2={backTop} stroke={gridColor} strokeWidth="0.3" />
          {/* Bottom-left edge */}
          <line x1={0} y1={100} x2={backLeft} y2={backBottom} stroke={gridColor} strokeWidth="0.3" />
          {/* Bottom-right edge */}
          <line x1={100} y1={100} x2={backRight} y2={backBottom} stroke={gridColor} strokeWidth="0.3" />
        </g>

        {/* Back wall border */}
        <rect
          x={backLeft}
          y={backTop}
          width={backRight - backLeft}
          height={backBottom - backTop}
          fill="none"
          stroke={gridColor}
          strokeWidth="0.15"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
