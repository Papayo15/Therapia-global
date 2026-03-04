"use client";

/**
 * Equipment SVG components
 * Each piece of equipment is a styled SVG element
 * designed to be composed inside exercise animations.
 */

// ─── Resistance Band ──────────────────────────────────────────────────────────
export function ResistanceBand({
  x = 0, y = 0, stretched = false, color = "#ef4444",
}: {
  x?: number; y?: number; stretched?: boolean; color?: string;
}) {
  const width = stretched ? 70 : 40;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d={`M0,0 Q${width / 2},-8 ${width},0`}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        className="band-curve"
      />
      <path
        d={`M0,0 Q${width / 2},8 ${width},0`}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Handles */}
      <ellipse cx="0"      cy="0" rx="6" ry="4" fill={color} />
      <ellipse cx={width} cy="0" rx="6" ry="4" fill={color} />
    </g>
  );
}

// ─── Dumbbell ─────────────────────────────────────────────────────────────────
export function Dumbbell({
  x = 0, y = 0, angle = 0, weight = "medium",
}: {
  x?: number; y?: number; angle?: number; weight?: "light" | "medium" | "heavy";
}) {
  const plateSize = weight === "light" ? 6 : weight === "medium" ? 9 : 12;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      {/* Bar */}
      <rect x="-18" y="-3" width="36" height="6" rx="3" fill="#6b7899" />
      {/* Left plates */}
      <rect x={-18 - plateSize} y={-plateSize} width={plateSize} height={plateSize * 2} rx="2" fill="#364060" />
      {/* Right plates */}
      <rect x="18" y={-plateSize} width={plateSize} height={plateSize * 2} rx="2" fill="#364060" />
    </g>
  );
}

// ─── Barbell ──────────────────────────────────────────────────────────────────
export function Barbell({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-45" y="-3" width="90" height="6" rx="3" fill="#6b7899" />
      <rect x="-55" y="-12" width="12" height="24" rx="2" fill="#364060" />
      <rect x="-67" y="-10" width="12" height="20" rx="2" fill="#141c33" />
      <rect x="43"  y="-12" width="12" height="24" rx="2" fill="#364060" />
      <rect x="55"  y="-10" width="12" height="20" rx="2" fill="#141c133" />
    </g>
  );
}

// ─── Pilates Ball ─────────────────────────────────────────────────────────────
export function PilatesBall({
  cx = 0, cy = 0, r = 22, color = "#fbbf24",
}: {
  cx?: number; cy?: number; r?: number; color?: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.9" />
      {/* Highlight */}
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.2} fill="white" opacity="0.4" />
      {/* Shadow */}
      <ellipse cx={cx} cy={cy + r + 2} rx={r * 0.7} ry={r * 0.15} fill="black" opacity="0.15" />
    </g>
  );
}

// ─── Medicine Ball ────────────────────────────────────────────────────────────
export function MedicineBall({ cx = 0, cy = 0, r = 16 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1a40f5" opacity="0.85" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.2} fill="white" opacity="0.25" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
        MED
      </text>
    </g>
  );
}

// ─── Kettlebell ───────────────────────────────────────────────────────────────
export function Kettlebell({ x = 0, y = 0, angle = 0 }: { x?: number; y?: number; angle?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      {/* Handle */}
      <path d="M-10,-22 Q-14,-32 0,-34 Q14,-32 10,-22" fill="none" stroke="#364060" strokeWidth="6" strokeLinecap="round" />
      {/* Body */}
      <circle cx="0" cy="-12" r="14" fill="#364060" />
      <circle cx="-4" cy="-16" r="3" fill="#6b7899" opacity="0.5" />
    </g>
  );
}

// ─── Elastic Tube Band ────────────────────────────────────────────────────────
export function ElasticTube({
  x1 = 0, y1 = 0, x2 = 60, y2 = 0, tension = 0,
}: {
  x1?: number; y1?: number; x2?: number; y2?: number; tension?: number;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - tension;
  return (
    <g>
      <path
        d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Handles */}
      <rect x={x1 - 5} y={y1 - 8} width="10" height="16" rx="3" fill="#059669" />
      <rect x={x2 - 5} y={y2 - 8} width="10" height="16" rx="3" fill="#059669" />
    </g>
  );
}

// ─── Foam Roller ──────────────────────────────────────────────────────────────
export function FoamRoller({ x = 0, y = 0, vertical = false }: { x?: number; y?: number; vertical?: boolean }) {
  return (
    <g transform={`translate(${x}, ${y}) ${vertical ? "rotate(90)" : ""}`}>
      <rect x="-30" y="-10" width="60" height="20" rx="10" fill="#f97316" opacity="0.9" />
      {/* Texture lines */}
      {[-20, -10, 0, 10, 20].map((lx) => (
        <line key={lx} x1={lx} y1="-10" x2={lx} y2="10" stroke="#ea580c" strokeWidth="1.5" />
      ))}
    </g>
  );
}

// ─── Exercise Mat ─────────────────────────────────────────────────────────────
export function ExerciseMat({ x = 0, y = 0, width = 100, height = 30 }: {
  x?: number; y?: number; width?: number; height?: number;
}) {
  return (
    <rect
      x={x - width / 2}
      y={y}
      width={width}
      height={height}
      rx="4"
      fill="#17c584"
      opacity="0.3"
      stroke="#17c584"
      strokeWidth="1"
    />
  );
}

// ─── Pull-up Bar ──────────────────────────────────────────────────────────────
export function PullBar({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-50" y="0" width="100" height="8" rx="4" fill="#364060" />
      <rect x="-50" y="-30" width="6" height="32" rx="3" fill="#6b7899" />
      <rect x="44"  y="-30" width="6" height="32" rx="3" fill="#6b7899" />
    </g>
  );
}

// ─── Step / Box ───────────────────────────────────────────────────────────────
export function StepBox({ x = 0, y = 0, h = 20 }: { x?: number; y?: number; h?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-25" y={-h} width="50" height={h} rx="3" fill="#8b5cf6" opacity="0.8" />
      <rect x="-25" y={-h} width="50" height="6"  rx="3" fill="#7c3aed" />
    </g>
  );
}
