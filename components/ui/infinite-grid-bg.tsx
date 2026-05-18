"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from "framer-motion";

/**
 * Infinite scrolling grid background — inspired by 21st.dev "The Infinite Grid"
 * by shadway. Adapted as a fixed, full-viewport background layer for dark theme.
 *
 * Features:
 * - Continuously scrolling grid pattern
 * - Cursor-following reveal spotlight
 * - Very low opacity base grid + brighter grid under cursor
 */
export default function InfiniteGridBg() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.3) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.3) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="infinite-grid-wrap"
    >
      {/* Base grid — always visible, very faint */}
      <div className="infinite-grid-base">
        <GridPattern
          id="grid-base"
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
        />
      </div>

      {/* Spotlight grid — visible under cursor, brighter */}
      <motion.div
        className="infinite-grid-spotlight"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern
          id="grid-spot"
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
        />
      </motion.div>
    </div>
  );
}

function GridPattern({
  id,
  offsetX,
  offsetY,
}: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offsetX: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offsetY: any;
}) {
  return (
    <svg className="infinite-grid-svg">
      <defs>
        <motion.pattern
          id={id}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
