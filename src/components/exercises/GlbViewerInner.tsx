"use client";

/**
 * GlbViewerInner — Three.js GLB model viewer
 * Loaded dynamically (no SSR) via GlbViewer.tsx
 *
 * Requires: npm install three @react-three/fiber @react-three/drei
 * If these packages are not installed, the component falls back gracefully
 * to a placeholder since it's loaded via dynamic import.
 */

import React, { Suspense } from "react";

interface GlbViewerInnerProps {
  src: string;
  className?: string;
}

// Try to import Three.js libraries — they may not be installed yet
let Canvas: React.ComponentType<React.PropsWithChildren<{ camera?: { position: number[] }; className?: string }>> | null = null;
let OrbitControls: React.ComponentType<{ autoRotate?: boolean; autoRotateSpeed?: number; enableZoom?: boolean }> | null = null;

try {
  // Dynamic require — these packages must be installed separately
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fiber = require("@react-three/fiber");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const drei = require("@react-three/drei");
  Canvas = fiber.Canvas;
  OrbitControls = drei.OrbitControls;
} catch {
  // @react-three/fiber not installed — GlbViewer will show placeholder
}

function ModelLoader({ url }: { url: string }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useGLTF } = require("@react-three/drei");
  const { scene } = useGLTF(url);
  // Use React.createElement to avoid JSX intrinsic element type errors for Three.js elements
  return React.createElement("primitive", { object: scene });
}

function Placeholder({ className }: { className?: string }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 rounded-lg ${className ?? ""}`}
    >
      <div className="text-3xl">🦴</div>
      <p className="text-xs text-slate-400">3D model viewer</p>
      <p className="text-[10px] text-slate-300">Install @react-three/fiber to enable</p>
    </div>
  );
}

export function GlbViewerInner({ src, className }: GlbViewerInnerProps) {
  if (!Canvas || !OrbitControls) {
    return <Placeholder className={className} />;
  }

  const CanvasComponent = Canvas;
  const Controls = OrbitControls;

  return (
    <CanvasComponent camera={{ position: [0, 1.2, 3] }} className={className}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} />
      <Suspense fallback={null}>
        <ModelLoader url={src} />
      </Suspense>
      <Controls autoRotate autoRotateSpeed={0.8} enableZoom={false} />
    </CanvasComponent>
  );
}
