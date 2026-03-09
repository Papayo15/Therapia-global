"use client";

import dynamic from "next/dynamic";

// GlbViewerInner is loaded dynamically to avoid SSR issues with Three.js
const GlbViewerInner = dynamic(
  () => import("./GlbViewerInner").then((m) => ({ default: m.GlbViewerInner })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

interface GlbViewerProps {
  src: string;
  className?: string;
}

export function GlbViewer({ src, className }: GlbViewerProps) {
  return <GlbViewerInner src={src} className={className} />;
}
