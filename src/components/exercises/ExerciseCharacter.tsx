"use client";

/**
 * ExerciseCharacter — "Thera"
 * Shared mascot utilities for all exercise animations.
 * Color palette, face component, and motion arc helper.
 */

// ─── Color Palette ────────────────────────────────────────────────────────────
export const C = {
  skin:       "#FFB896",
  skinShade:  "#E89474",
  hair:       "#2D1B00",
  shirt:      "#0D9488",   // brand teal
  shirtShade: "#0F766E",
  pants:      "#1E3A5F",
  pantsShade: "#162D4A",
  shoes:      "#1C1C1E",
  bg:         "#F0FDF9",   // mint background
  ground:     "#D1FAE5",
  highlight:  "#F59E0B",   // amber — active muscle
  arc:        "#3B82F6",   // blue — motion arc
  arcFill:    "rgba(59,130,246,0.08)",
  equipment:  "#6B7280",
};

// ─── Face + Head ─────────────────────────────────────────────────────────────
interface FaceProps { x?: number; y?: number; s?: number; }

export function Face({ x = 100, y = 25, s = 1 }: FaceProps) {
  const r = 17 * s;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.skin} />
      {/* Hair */}
      <ellipse cx={x} cy={y - r * 0.55} rx={r * 0.93} ry={r * 0.6} fill={C.hair} />
      {/* Eyes */}
      <circle cx={x - 6 * s} cy={y - 3 * s} r={2.5 * s} fill="#1C1C1E" />
      <circle cx={x + 6 * s} cy={y - 3 * s} r={2.5 * s} fill="#1C1C1E" />
      {/* Smile */}
      <path
        d={`M${x - 6 * s},${y + 5 * s} Q${x},${y + 10 * s} ${x + 6 * s},${y + 5 * s}`}
        stroke="#1C1C1E" strokeWidth={1.8 * s} fill="none" strokeLinecap="round"
      />
    </g>
  );
}

// ─── Motion Arc ───────────────────────────────────────────────────────────────
// Draws a dashed arc with a dot at the end to show range of motion
interface ArcProps {
  cx: number; cy: number; r: number;
  a1: number; a2: number;  // start/end angle in degrees
  color?: string;
}
export function Arc({ cx, cy, r, a1, a2, color = C.arc }: ArcProps) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  const x2 = cx + r * Math.cos(rad(a2));
  const y2 = cy + r * Math.sin(rad(a2));
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const sweep = a2 > a1 ? 1 : 0;
  return (
    <g opacity="0.85">
      <path
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},${sweep} ${x2},${y2} Z`}
        fill={color} opacity="0.1"
      />
      <path
        d={`M${x1},${y1} A${r},${r} 0 ${large},${sweep} ${x2},${y2}`}
        stroke={color} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeDasharray="6,3"
      />
      <circle cx={x2} cy={y2} r="4.5" fill={color} />
    </g>
  );
}

// ─── Muscle Highlight Pill ────────────────────────────────────────────────────
export function MuscleTag({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={label.length * 7 + 16} height={20} rx="10"
        fill={C.highlight} opacity="0.9" />
      <text x={x + label.length * 3.5 + 8} y={y + 14}
        textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
        {label}
      </text>
    </g>
  );
}
