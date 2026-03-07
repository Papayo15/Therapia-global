"use client";

/**
 * ExerciseAnimationEngine
 * ─────────────────────────────────────────────────────────────────────────────
 * 20 framer-motion animated clinical illustrations.
 * Visual style: simplified humanized body, no facial features, clean medical
 * illustration, white background, soft clinical palette (blue, green, gray),
 * active joint highlighted, movement arrows.
 * All animations loop 3–4 seconds at slow therapeutic pace.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { motion } from "framer-motion";

// ─── Color Palette ─────────────────────────────────────────────────────────
const W = {
  bg:      "#FFFFFF",
  body:    "#4A90D9",
  bodyDk:  "#2E6DB4",
  bodyLt:  "#72AEE6",
  skin:    "#FFB896",
  skinDk:  "#E89474",
  hair:    "#2D1B00",
  mat:     "#EBF4FF",
  matEdge: "#B8D9F5",
  arrow:   "#3B82F6",
  hl:      "#F59E0B",  // highlighted / active joint
  hlFill:  "rgba(245,158,11,0.18)",
  shadow:  "rgba(74,144,217,0.12)",
  label:   "#2E6DB4",
  band:    "#22C55E",  // resistance band
  ground:  "#E0F2FE",
} as const;

const T3 = { duration: 3, repeat: Infinity, ease: "easeInOut" } as const;
const T4 = { duration: 4, repeat: Infinity, ease: "easeInOut" } as const;

// ─── Shared sub-components ─────────────────────────────────────────────────
function Head({ cx = 100, cy = 22, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={W.skin} />
      <ellipse cx={cx} cy={cy - r * 0.6} rx={r * 0.85} ry={r * 0.5} fill={W.hair} />
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = W.arrow }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const px = x2 - ux * 8, py = y2 - uy * 8;
  const perpx = -uy * 5, perpy = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={px} y2={py} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <polygon
        points={`${x2},${y2} ${px + perpx},${py + perpy} ${px - perpx},${py - perpy}`}
        fill={color}
      />
    </g>
  );
}

// ─── 1. Glute Bridge ────────────────────────────────────────────────────────
export function AnimGluteBridge() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      {/* Mat */}
      <rect x="10" y="105" width="180" height="8" rx="4" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Body group that lifts */}
      <motion.g
        animate={{ y: [0, -22, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        {/* Torso */}
        <rect x="72" y="72" width="56" height="30" rx="8" fill={W.body} />
        {/* Hip highlight */}
        <motion.ellipse
          cx="100" cy="87" rx="18" ry="10"
          fill={W.hl} opacity="0.5"
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={T3}
        />
        {/* Shoulders / upper body (stays relative) */}
        <rect x="78" y="60" width="44" height="18" rx="6" fill={W.bodyDk} />
        {/* Head */}
        <Head cx={100} cy={46} r={12} />
        {/* Left arm */}
        <rect x="52" y="64" width="22" height="10" rx="5" fill={W.body} transform="rotate(12,63,69)" />
        {/* Right arm */}
        <rect x="126" y="64" width="22" height="10" rx="5" fill={W.body} transform="rotate(-12,137,69)" />
      </motion.g>
      {/* Legs (thigh stays on ground pivot) */}
      <motion.g
        style={{ transformOrigin: "76px 105px" }}
        animate={{ rotate: [0, -30, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <rect x="60" y="95" width="32" height="14" rx="6" fill={W.body} />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "124px 105px" }}
        animate={{ rotate: [0, 30, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <rect x="108" y="95" width="32" height="14" rx="6" fill={W.body} />
      </motion.g>
      {/* Feet */}
      <rect x="44" y="101" width="28" height="10" rx="5" fill={W.bodyDk} />
      <rect x="128" y="101" width="28" height="10" rx="5" fill={W.bodyDk} />
      {/* Upward arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={100} y1={58} x2={100} y2={42} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 2. Bird Dog ────────────────────────────────────────────────────────────
export function AnimBirdDog() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="100" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Torso (horizontal, quadruped) */}
      <rect x="60" y="78" width="80" height="20" rx="8" fill={W.body} />
      {/* Head */}
      <Head cx={152} cy={72} r={10} />
      {/* Support arm (left) */}
      <rect x="134" y="94" width="10" height="20" rx="5" fill={W.bodyDk} />
      {/* Support knee/leg (right) */}
      <rect x="58" y="94" width="10" height="18" rx="5" fill={W.bodyDk} />
      {/* Extending arm */}
      <motion.g
        style={{ transformOrigin: "142px 85px" }}
        animate={{ rotate: [20, -10, 20] }}
        transition={{ ...T4, times: [0, 0.5, 1] }}
      >
        <rect x="142" y="80" width="38" height="9" rx="4" fill={W.hl} />
        <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={T4}>
          <Arrow x1={178} y1={84} x2={192} y2={80} color={W.arrow} />
        </motion.g>
      </motion.g>
      {/* Extending leg */}
      <motion.g
        style={{ transformOrigin: "68px 85px" }}
        animate={{ rotate: [-15, 10, -15] }}
        transition={{ ...T4, times: [0, 0.5, 1] }}
      >
        <rect x="30" y="80" width="40" height="10" rx="5" fill={W.hl} />
        <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={T4}>
          <Arrow x1={34} y1={85} x2={18} y2={82} color={W.arrow} />
        </motion.g>
      </motion.g>
    </svg>
  );
}

// ─── 3. Cat-Cow ─────────────────────────────────────────────────────────────
export function AnimCatCow() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="108" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Spine (wavy path, morphs between cat arch and cow sag) */}
      <motion.path
        animate={{
          d: [
            "M 50,88 C 80,88 120,88 150,88",   // neutral
            "M 50,82 C 80,68 120,68 150,82",   // cat (arch up)
            "M 50,88 C 80,88 120,88 150,88",   // neutral
            "M 50,94 C 80,104 120,104 150,94", // cow (sag down)
            "M 50,88 C 80,88 120,88 150,88",   // neutral
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        stroke={W.hl} strokeWidth="5" fill="none" strokeLinecap="round"
      />
      {/* Torso body */}
      <motion.rect
        x="68" y="80" width="64" height="18" rx="8" fill={W.body}
        animate={{ y: [0, -10, 0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Head */}
      <motion.g
        animate={{ rotate: [0, -20, 0, 15, 0], y: [0, 0, 0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "152px 80px" }}
      >
        <Head cx={152} cy={75} r={10} />
      </motion.g>
      {/* Arms (vertical supports) */}
      <rect x="130" y="96" width="10" height="18" rx="5" fill={W.bodyDk} />
      <rect x="60" y="96" width="10" height="18" rx="5" fill={W.bodyDk} />
      {/* Knees */}
      <rect x="50" y="96" width="14" height="18" rx="5" fill={W.bodyDk} />
      <rect x="136" y="96" width="14" height="18" rx="5" fill={W.bodyDk} />
      {/* Arrows */}
      <motion.g
        animate={{ opacity: [0, 1, 0, 0, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Arrow x1={100} y1={68} x2={100} y2={56} color={W.arrow} />
      </motion.g>
      <motion.g
        animate={{ opacity: [0, 0, 0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Arrow x1={100} y1={104} x2={100} y2={116} color={W.hl} />
      </motion.g>
    </svg>
  );
}

// ─── 4. Dead Bug ────────────────────────────────────────────────────────────
export function AnimDeadBug() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="88" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Torso (supine) */}
      <rect x="62" y="70" width="76" height="20" rx="8" fill={W.body} />
      {/* Head */}
      <Head cx={152} cy={74} r={10} />
      {/* Core highlight */}
      <motion.ellipse cx="100" cy="80" rx="22" ry="8" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T3} />
      {/* Left arm (extends up, alternating) */}
      <motion.g
        style={{ transformOrigin: "72px 72px" }}
        animate={{ rotate: [0, -60, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="52" y="64" width="28" height="9" rx="4" fill={W.hl} />
      </motion.g>
      {/* Right leg (extends, opposite) */}
      <motion.g
        style={{ transformOrigin: "128px 88px" }}
        animate={{ rotate: [0, 50, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="126" y="84" width="34" height="10" rx="5" fill={W.hl} />
      </motion.g>
      {/* Opposite arm/leg (static raised) */}
      <rect x="120" y="50" width="28" height="9" rx="4" fill={W.body} />
      <rect x="40" y="84" width="32" height="10" rx="5" fill={W.body} />
    </svg>
  );
}

// ─── 5. Plank ───────────────────────────────────────────────────────────────
export function AnimPlank() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="100" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Body plank (slight breathing pulse) */}
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="48" y="76" width="104" height="18" rx="8" fill={W.body} />
        {/* Core glow */}
        <motion.ellipse cx="100" cy="85" rx="28" ry="6" fill={W.hl} opacity="0.25"
          animate={{ opacity: [0.1, 0.4, 0.1] }} transition={T3} />
        <Head cx={162} cy={76} r={10} />
        {/* Forearm supports */}
        <rect x="148" y="90" width="10" height="14" rx="4" fill={W.bodyDk} />
        <rect x="42" y="90" width="10" height="14" rx="4" fill={W.bodyDk} />
        {/* Feet */}
        <ellipse cx="46" cy="100" rx="10" ry="5" fill={W.bodyDk} />
      </motion.g>
      {/* Straight-body line */}
      <line x1="46" y1="82" x2="162" y2="82" stroke={W.arrow} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.4" />
    </svg>
  );
}

// ─── 6. Shoulder External Rotation ─────────────────────────────────────────
export function AnimShoulderExtRotation() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={W.bg} />
      {/* Standing figure */}
      <Head cx={100} cy={28} r={13} />
      {/* Torso */}
      <rect x="82" y="40" width="36" height="50" rx="8" fill={W.body} />
      {/* Legs */}
      <rect x="82" y="88" width="16" height="42" rx="6" fill={W.body} />
      <rect x="102" y="88" width="16" height="42" rx="6" fill={W.body} />
      {/* Feet */}
      <ellipse cx="90" cy="133" rx="12" ry="5" fill={W.bodyDk} />
      <ellipse cx="110" cy="133" rx="12" ry="5" fill={W.bodyDk} />
      {/* Static upper arm (elbow at 90°) */}
      <rect x="62" y="58" width="22" height="10" rx="5" fill={W.bodyDk} />
      {/* Highlight shoulder joint */}
      <motion.circle cx="82" cy="63" r="9" fill={W.hl} opacity="0.4"
        animate={{ opacity: [0.2, 0.6, 0.2] }} transition={T3} />
      {/* Forearm rotates */}
      <motion.g
        style={{ transformOrigin: "62px 63px" }}
        animate={{ rotate: [0, -55, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <rect x="34" y="58" width="30" height="10" rx="5" fill={W.hl} />
        {/* Arrow at forearm tip */}
        <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={T3}>
          <Arrow x1={36} y1={63} x2={26} y2={55} color={W.arrow} />
        </motion.g>
      </motion.g>
      {/* Band (dashed line) */}
      <line x1="160" y1="63" x2="95" y2="63" stroke={W.band} strokeWidth="3" strokeDasharray="5,3" />
      <circle cx="160" cy="63" r="5" fill={W.band} />
      {/* Arc indicator */}
      <path d="M 38,55 A 26,26 0 0,1 62,37" stroke={W.arrow} strokeWidth="1.5"
        fill="none" strokeDasharray="4,3" opacity="0.5" />
    </svg>
  );
}

// ─── 7. Lateral Raise ───────────────────────────────────────────────────────
export function AnimLateralRaise() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={W.bg} />
      <Head cx={100} cy={28} r={13} />
      <rect x="82" y="40" width="36" height="50" rx="8" fill={W.body} />
      <rect x="82" y="88" width="16" height="42" rx="6" fill={W.body} />
      <rect x="102" y="88" width="16" height="42" rx="6" fill={W.body} />
      <ellipse cx="90" cy="133" rx="12" ry="5" fill={W.bodyDk} />
      <ellipse cx="110" cy="133" rx="12" ry="5" fill={W.bodyDk} />
      {/* Left arm raises */}
      <motion.g
        style={{ transformOrigin: "82px 52px" }}
        animate={{ rotate: [10, -75, 10] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="46" y="47" width="38" height="10" rx="5" fill={W.hl} />
        <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T4}>
          <Arrow x1={50} y1={52} x2={36} y2={42} color={W.arrow} />
        </motion.g>
      </motion.g>
      {/* Right arm raises (mirror, slight delay) */}
      <motion.g
        style={{ transformOrigin: "118px 52px" }}
        animate={{ rotate: [-10, 75, -10] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="116" y="47" width="38" height="10" rx="5" fill={W.hl} />
        <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T4}>
          <Arrow x1={150} y1={52} x2={164} y2={42} color={W.arrow} />
        </motion.g>
      </motion.g>
      {/* Shoulder highlights */}
      <motion.circle cx="82" cy="52" r="8" fill={W.hl} opacity="0.35"
        animate={{ opacity: [0.15, 0.5, 0.15] }} transition={T4} />
      <motion.circle cx="118" cy="52" r="8" fill={W.hl} opacity="0.35"
        animate={{ opacity: [0.15, 0.5, 0.15] }} transition={T4} />
    </svg>
  );
}

// ─── 8. Cervical Retraction (Chin Tuck) ────────────────────────────────────
export function AnimCervicalRetraction() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={W.bg} />
      {/* Standing torso */}
      <rect x="78" y="50" width="44" height="65" rx="8" fill={W.body} />
      {/* Neck */}
      <rect x="92" y="38" width="16" height="18" rx="6" fill={W.skin} />
      {/* Head moves backward (chin tuck) */}
      <motion.g
        animate={{ x: [0, -8, 0] }}
        transition={{ ...T3, times: [0, 0.4, 1] }}
      >
        <Head cx={100} cy={26} r={14} />
        {/* C-spine highlight */}
        <motion.ellipse cx="100" cy="40" rx="8" ry="6" fill={W.hl} opacity="0.4"
          animate={{ opacity: [0.15, 0.6, 0.15] }} transition={T3} />
      </motion.g>
      {/* Arrow showing retraction */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={115} y1={26} x2={98} y2={26} color={W.arrow} />
      </motion.g>
      {/* Alignment line (wall) */}
      <line x1="130" y1="10" x2="130" y2="120" stroke={W.matEdge} strokeWidth="2" strokeDasharray="5,4" />
      <text x="133" y="16" fontSize="8" fill={W.label}>pared</text>
      {/* Legs */}
      <rect x="78" y="112" width="18" height="36" rx="6" fill={W.body} />
      <rect x="104" y="112" width="18" height="36" rx="6" fill={W.body} />
      <ellipse cx="87" cy="150" rx="12" ry="5" fill={W.bodyDk} />
      <ellipse cx="113" cy="150" rx="12" ry="5" fill={W.bodyDk} />
    </svg>
  );
}

// ─── 9. Ankle Pumps ─────────────────────────────────────────────────────────
export function AnimAnklePumps() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="78" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Supine legs */}
      <rect x="30" y="62" width="140" height="18" rx="8" fill={W.body} />
      {/* Ankle highlight */}
      <motion.circle cx="34" cy="71" r="10" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T3} />
      {/* Foot / ankle pumps */}
      <motion.g
        style={{ transformOrigin: "34px 72px" }}
        animate={{ rotate: [-25, 20, -25] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <ellipse cx="20" cy="72" rx="18" ry="9" fill={W.bodyDk} />
      </motion.g>
      {/* Right foot mirror */}
      <motion.g
        style={{ transformOrigin: "166px 72px" }}
        animate={{ rotate: [25, -20, 25] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <ellipse cx="180" cy="72" rx="18" ry="9" fill={W.bodyDk} />
      </motion.g>
      {/* Arrows */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={20} y1={88} x2={14} y2={96} color={W.arrow} />
        <Arrow x1={18} y1={60} x2={12} y2={52} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 10. Squat ──────────────────────────────────────────────────────────────
export function AnimSquat() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      <rect x="10" y="155" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Body descends */}
      <motion.g
        animate={{ y: [0, 36, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <Head cx={100} cy={28} r={13} />
        <rect x="80" y="40" width="40" height="46" rx="8" fill={W.body} />
        {/* Torso leans slightly */}
      </motion.g>
      {/* Thighs rotate (knee flex) */}
      <motion.g
        style={{ transformOrigin: "88px 95px" }}
        animate={{ rotate: [0, 48, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="76" y="86" width="22" height="38" rx="8" fill={W.body} />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "112px 95px" }}
        animate={{ rotate: [0, -48, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="102" y="86" width="22" height="38" rx="8" fill={W.body} />
      </motion.g>
      {/* Knee highlights */}
      <motion.circle cx="88" cy="124" r="10" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.05, 0.45, 0.05] }} transition={T4} />
      <motion.circle cx="112" cy="124" r="10" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.05, 0.45, 0.05] }} transition={T4} />
      {/* Shins + feet (static low) */}
      <rect x="74" y="138" width="18" height="20" rx="6" fill={W.bodyDk} />
      <rect x="108" y="138" width="18" height="20" rx="6" fill={W.bodyDk} />
      <ellipse cx="83" cy="155" rx="14" ry="5" fill={W.bodyDk} />
      <ellipse cx="117" cy="155" rx="14" ry="5" fill={W.bodyDk} />
      {/* Down arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T4}>
        <Arrow x1={100} y1={42} x2={100} y2={58} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 11. Seated Knee Extension ──────────────────────────────────────────────
export function AnimSeatedKneeExtension() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={W.bg} />
      {/* Chair */}
      <rect x="50" y="90" width="100" height="8" rx="3" fill={W.matEdge} />
      <rect x="130" y="98" width="8" height="40" rx="3" fill={W.matEdge} />
      <rect x="62" y="98" width="8" height="40" rx="3" fill={W.matEdge} />
      <rect x="138" y="50" width="8" height="44" rx="3" fill={W.matEdge} />
      {/* Seated torso */}
      <rect x="78" y="44" width="60" height="50" rx="8" fill={W.body} />
      <Head cx={108} cy={30} r={13} />
      {/* Thigh (static) */}
      <rect x="56" y="82" width="52" height="14" rx="6" fill={W.body} />
      {/* Lower leg extends */}
      <motion.g
        style={{ transformOrigin: "56px 89px" }}
        animate={{ rotate: [50, 0, 50] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="10" y="84" width="50" height="13" rx="6" fill={W.hl} />
        <ellipse cx="12" cy="90" rx="10" ry="8" fill={W.bodyDk} />
        {/* Knee highlight */}
        <motion.circle cx="58" cy="90" r="9" fill={W.hl} opacity="0.4"
          animate={{ opacity: [0.15, 0.6, 0.15] }} transition={T4} />
      </motion.g>
      {/* Arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T4}>
        <Arrow x1={18} y1={108} x2={12} y2={122} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 12. Side-Lying Hip Abduction ───────────────────────────────────────────
export function AnimSideLyingAbduction() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="94" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Torso side-lying */}
      <rect x="44" y="70" width="100" height="22" rx="8" fill={W.body} />
      <Head cx={154} cy={72} r={11} />
      {/* Bottom leg (static) */}
      <rect x="20" y="82" width="50" height="14" rx="6" fill={W.body} />
      {/* Top leg abducts */}
      <motion.g
        style={{ transformOrigin: "68px 78px" }}
        animate={{ rotate: [0, -35, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <rect x="20" y="72" width="52" height="13" rx="6" fill={W.hl} />
        <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
          <Arrow x1={24} y1={70} x2={16} y2={56} color={W.arrow} />
        </motion.g>
      </motion.g>
      {/* Hip highlight */}
      <motion.circle cx="68" cy="82" r="10" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T3} />
    </svg>
  );
}

// ─── 13. Hip Flexor Stretch ─────────────────────────────────────────────────
export function AnimHipFlexorStretch() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      <rect x="10" y="155" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Lunge position */}
      <Head cx={100} cy={26} r={13} />
      <rect x="80" y="38" width="40" height="50" rx="8" fill={W.body} />
      {/* Front leg (knee bent at 90°) */}
      <rect x="60" y="86" width="18" height="40" rx="7" fill={W.body} />
      <rect x="50" y="122" width="30" height="12" rx="6" fill={W.body} />
      {/* Back leg (knee on floor) */}
      <rect x="122" y="86" width="18" height="36" rx="7" fill={W.body} />
      <rect x="118" y="118" width="32" height="12" rx="6" fill={W.bodyDk} />
      {/* Hip highlight (hip flexor) */}
      <motion.ellipse cx="126" cy="90" rx="12" ry="9" fill={W.hl} opacity="0.4"
        animate={{ opacity: [0.15, 0.65, 0.15] }} transition={T4} />
      {/* Pelvis tilt arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T4}>
        <Arrow x1={100} y1={92} x2={100} y2={78} color={W.arrow} />
      </motion.g>
      {/* Stretch intensity label */}
      <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ ...T4, delay: 1 }}>
        <ellipse cx="130" cy="84" rx="16" ry="7" fill={W.hl} opacity="0.8" />
        <text x="130" y="87" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">stretch</text>
      </motion.g>
    </svg>
  );
}

// ─── 14. Romanian Deadlift (RDL) ─────────────────────────────────────────────
export function AnimRDL() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      <rect x="10" y="155" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Hinge motion */}
      <motion.g
        style={{ transformOrigin: "100px 100px" }}
        animate={{ rotate: [0, 40, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        {/* Torso hinges */}
        <rect x="80" y="52" width="40" height="58" rx="8" fill={W.body} />
        <Head cx={100} cy={38} r={13} />
        {/* Arms hang down */}
        <rect x="70" y="80" width="12" height="36" rx="5" fill={W.bodyDk} />
        <rect x="118" y="80" width="12" height="36" rx="5" fill={W.bodyDk} />
        {/* Bar / weight */}
        <rect x="52" y="112" width="96" height="8" rx="4" fill={W.bodyDk} />
        <circle cx="54" cy="116" r="7" fill={W.shadow} stroke={W.bodyDk} strokeWidth="2" />
        <circle cx="146" cy="116" r="7" fill={W.shadow} stroke={W.bodyDk} strokeWidth="2" />
      </motion.g>
      {/* Legs (static) */}
      <rect x="83" y="104" width="16" height="46" rx="7" fill={W.body} />
      <rect x="101" y="104" width="16" height="46" rx="7" fill={W.body} />
      <ellipse cx="91" cy="153" rx="14" ry="5" fill={W.bodyDk} />
      <ellipse cx="109" cy="153" rx="14" ry="5" fill={W.bodyDk} />
      {/* Hamstring highlight */}
      <motion.ellipse cx="100" cy="114" rx="20" ry="8" fill={W.hl} opacity="0.25"
        animate={{ opacity: [0.1, 0.4, 0.1] }} transition={T4} />
    </svg>
  );
}

// ─── 15. Resistance Band Row ────────────────────────────────────────────────
export function AnimBandRow() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={W.bg} />
      <rect x="10" y="148" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Seated figure */}
      <rect x="120" y="100" width="60" height="8" rx="3" fill={W.matEdge} />
      <rect x="170" y="55" width="8" height="55" rx="3" fill={W.matEdge} />
      <rect x="78" y="60" width="48" height="50" rx="8" fill={W.body} />
      <Head cx={102} cy={46} r={13} />
      <rect x="80" y="106" width="18" height="36" rx="6" fill={W.body} />
      <rect x="106" y="106" width="18" height="36" rx="6" fill={W.body} />
      {/* Band anchor */}
      <circle cx="16" cy="90" r="6" fill={W.band} />
      {/* Arms pull band */}
      <motion.g
        animate={{ x: [0, 22, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        {/* Forearms */}
        <rect x="42" y="82" width="40" height="10" rx="5" fill={W.hl} />
        {/* Band stretches */}
        <motion.line
          x1={42} y1={87} x2={16} y2={90}
          stroke={W.band} strokeWidth="4" strokeLinecap="round"
          animate={{ x1: [42, 64, 42] }}
          transition={{ ...T3, times: [0, 0.45, 1] }}
        />
      </motion.g>
      {/* Scapula highlight */}
      <motion.ellipse cx="100" cy="72" rx="16" ry="10" fill={W.hl} opacity="0.2"
        animate={{ opacity: [0.05, 0.4, 0.05] }} transition={T3} />
      {/* Arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={80} y1={87} x2={70} y2={87} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 16. McKenzie Press-Up ──────────────────────────────────────────────────
export function AnimMcKenziePress() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="110" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Prone body */}
      <rect x="40" y="84" width="120" height="20" rx="8" fill={W.body} />
      <Head cx={168} cy={80} r={10} />
      {/* Lumbar highlight */}
      <motion.ellipse cx="100" cy="92" rx="22" ry="8" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T3} />
      {/* Upper torso props up */}
      <motion.g
        style={{ transformOrigin: "100px 92px" }}
        animate={{ rotate: [0, -18, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <rect x="100" y="68" width="68" height="28" rx="8" fill={W.bodyDk} />
        <Head cx={168} cy={72} r={10} />
        {/* Arms as props */}
        <rect x="150" y="92" width="10" height="22" rx="4" fill={W.skin} />
        <rect x="106" y="92" width="10" height="22" rx="4" fill={W.skin} />
      </motion.g>
      {/* Legs static */}
      <rect x="28" y="86" width="48" height="16" rx="6" fill={W.body} />
      {/* Arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={140} y1={74} x2={140} y2={60} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 17. Knee to Chest ──────────────────────────────────────────────────────
export function AnimKneeToChest() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="90" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Supine torso */}
      <rect x="50" y="66" width="100" height="20" rx="8" fill={W.body} />
      <Head cx={158} cy={68} r={10} />
      {/* Lumbar highlight */}
      <motion.ellipse cx="100" cy="76" rx="20" ry="7" fill={W.hl} opacity="0.25"
        animate={{ opacity: [0.1, 0.45, 0.1] }} transition={T3} />
      {/* Knee pulls to chest */}
      <motion.g
        style={{ transformOrigin: "80px 78px" }}
        animate={{ rotate: [0, -60, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        {/* Thigh */}
        <rect x="44" y="72" width="38" height="13" rx="6" fill={W.hl} />
        {/* Lower leg folds */}
        <motion.g
          style={{ transformOrigin: "44px 78px" }}
          animate={{ rotate: [0, 60, 0] }}
          transition={{ ...T3, times: [0, 0.45, 1] }}
        >
          <rect x="16" y="72" width="30" height="12" rx="6" fill={W.body} />
        </motion.g>
      </motion.g>
      {/* Other leg (static) */}
      <rect x="110" y="72" width="50" height="14" rx="6" fill={W.body} />
      <rect x="156" y="76" width="24" height="12" rx="5" fill={W.bodyDk} />
    </svg>
  );
}

// ─── 18. Foam Roller Thoracic ───────────────────────────────────────────────
export function AnimFoamRollerThoracic() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="102" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Foam roller */}
      <ellipse cx="100" cy="94" rx="18" ry="10" fill={W.bodyLt} />
      <rect x="82" y="84" width="36" height="12" rx="6" fill={W.bodyLt} />
      {/* Supine body on roller */}
      <rect x="36" y="68" width="128" height="20" rx="8" fill={W.body} />
      <Head cx={172} cy={70} r={10} />
      {/* Thoracic extension (arches over roller) */}
      <motion.g
        style={{ transformOrigin: "100px 76px" }}
        animate={{ rotate: [0, 8, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        {/* Upper body segment */}
        <rect x="100" y="60" width="64" height="24" rx="8" fill={W.bodyDk} />
        {/* T-spine highlight */}
        <motion.ellipse cx="128" cy="72" rx="20" ry="8" fill={W.hl} opacity="0.3"
          animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T3} />
      </motion.g>
      {/* Knees bent up */}
      <rect x="46" y="84" width="28" height="14" rx="6" fill={W.body} />
      <rect x="66" y="70" width="16" height="28" rx="6" fill={W.body} />
      {/* Arrow */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={128} y1={58} x2={128} y2={44} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 19. Pelvic Tilt ────────────────────────────────────────────────────────
export function AnimPelvicTilt() {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <rect width="200" height="130" fill={W.bg} />
      <rect x="10" y="102" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Supine crook-lying */}
      <rect x="50" y="70" width="100" height="20" rx="8" fill={W.body} />
      <Head cx={156} cy={72} r={10} />
      {/* Lumbar highlight */}
      <motion.ellipse
        cx="100" cy="80" rx="22" ry="7" fill={W.hl}
        animate={{ opacity: [0.15, 0.55, 0.15] }}
        transition={T3}
      />
      {/* Pelvis tilts (lumbar flattens) */}
      <motion.g
        style={{ transformOrigin: "100px 82px" }}
        animate={{ rotate: [0, 12, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <rect x="76" y="78" width="48" height="16" rx="6" fill={W.bodyDk} />
      </motion.g>
      {/* Thighs / knees bent */}
      <rect x="58" y="86" width="22" height="14" rx="6" fill={W.body} />
      <rect x="120" y="86" width="22" height="14" rx="6" fill={W.body} />
      <rect x="52" y="96" width="22" height="10" rx="5" fill={W.body} transform="rotate(-30,63,101)" />
      <rect x="126" y="96" width="22" height="10" rx="5" fill={W.body} transform="rotate(30,137,101)" />
      {/* Rotation arc */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <path d="M 88,96 A 16,10 0 0,0 112,96" stroke={W.arrow} strokeWidth="2.5"
          fill="none" strokeLinecap="round" />
        <Arrow x1={112} y1={96} x2={118} y2={92} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 20. Lunge ──────────────────────────────────────────────────────────────
export function AnimLunge() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      <rect x="10" y="155" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Body descends into lunge */}
      <motion.g
        animate={{ y: [0, 28, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <Head cx={100} cy={26} r={13} />
        <rect x="80" y="38" width="40" height="50" rx="8" fill={W.body} />
        {/* Arms at sides */}
        <rect x="60" y="44" width="22" height="9" rx="4" fill={W.body} />
        <rect x="118" y="44" width="22" height="9" rx="4" fill={W.body} />
      </motion.g>
      {/* Front leg */}
      <motion.g
        style={{ transformOrigin: "88px 95px" }}
        animate={{ rotate: [0, -18, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="72" y="86" width="22" height="44" rx="8" fill={W.body} />
      </motion.g>
      {/* Front shin + foot */}
      <rect x="60" y="130" width="28" height="10" rx="5" fill={W.body} />
      <ellipse cx="74" cy="152" rx="18" ry="6" fill={W.bodyDk} />
      {/* Back leg */}
      <motion.g
        style={{ transformOrigin: "112px 95px" }}
        animate={{ rotate: [0, 22, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="106" y="86" width="22" height="44" rx="8" fill={W.body} />
      </motion.g>
      <rect x="112" y="130" width="28" height="10" rx="5" fill={W.bodyDk} />
      <ellipse cx="126" cy="152" rx="18" ry="6" fill={W.bodyDk} />
      {/* Knee highlights */}
      <motion.circle cx="83" cy="130" r="9" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T4} />
      <motion.circle cx="117" cy="130" r="9" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T4} />
    </svg>
  );
}

// ─── 21. Calf Raise ─────────────────────────────────────────────────────────
export function AnimCalfRaise() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      <rect x="10" y="155" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      <Head cx={100} cy={26} r={13} />
      <rect x="82" y="38" width="36" height="52" rx="8" fill={W.body} />
      <rect x="83" y="87" width="16" height="44" rx="7" fill={W.body} />
      <rect x="101" y="87" width="16" height="44" rx="7" fill={W.body} />
      {/* Heels lift */}
      <motion.g
        animate={{ y: [0, -18, 0] }}
        transition={{ ...T3, times: [0, 0.45, 1] }}
      >
        <ellipse cx="91" cy="138" rx="14" ry="7" fill={W.bodyDk} />
        <ellipse cx="109" cy="138" rx="14" ry="7" fill={W.bodyDk} />
        {/* Ankle highlights */}
        <motion.circle cx="91" cy="134" r="8" fill={W.hl} opacity="0.35"
          animate={{ opacity: [0.1, 0.55, 0.1] }} transition={T3} />
        <motion.circle cx="109" cy="134" r="8" fill={W.hl} opacity="0.35"
          animate={{ opacity: [0.1, 0.55, 0.1] }} transition={T3} />
      </motion.g>
      {/* Wall/support */}
      <line x1="160" y1="30" x2="160" y2="156" stroke={W.matEdge} strokeWidth="2" />
      <rect x="155" y="80" width="10" height="8" rx="3" fill={W.skin} />
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T3}>
        <Arrow x1={100} y1={90} x2={100} y2={74} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── 22. Shoulder Pendulum ──────────────────────────────────────────────────
export function AnimShoulderPendulum() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={W.bg} />
      {/* Table */}
      <rect x="80" y="52" width="90" height="8" rx="3" fill={W.matEdge} />
      <rect x="154" y="60" width="8" height="56" rx="3" fill={W.matEdge} />
      {/* Bent-over figure (leaning on table) */}
      <rect x="82" y="58" width="50" height="14" rx="6" fill={W.body} transform="rotate(-8,107,65)" />
      <Head cx={138} cy={46} r={11} />
      <rect x="100" y="62" width="12" height="56" rx="6" fill={W.body} />
      {/* Arm swings (pendulum) */}
      <motion.g
        style={{ transformOrigin: "106px 68px" }}
        animate={{ rotate: [-22, 22, -22] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="100" y="70" width="12" height="46" rx="5" fill={W.hl} />
        <ellipse cx="106" cy="118" rx="10" ry="6" fill={W.skin} />
        {/* Shoulder highlight */}
        <motion.circle cx="106" cy="68" r="10" fill={W.hl} opacity="0.3"
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 3.5, repeat: Infinity }} />
      </motion.g>
      {/* Arc */}
      <path d="M 78,118 A 30,40 0 0,0 134,118" stroke={W.arrow} strokeWidth="1.5"
        fill="none" strokeDasharray="4,3" opacity="0.4" />
      {/* Legs */}
      <rect x="94" y="114" width="14" height="38" rx="6" fill={W.body} />
      <rect x="110" y="114" width="14" height="38" rx="6" fill={W.body} />
      <ellipse cx="101" cy="154" rx="12" ry="5" fill={W.bodyDk} />
      <ellipse cx="117" cy="154" rx="12" ry="5" fill={W.bodyDk} />
    </svg>
  );
}

// ─── 23. Wall Angel ─────────────────────────────────────────────────────────
export function AnimWallAngel() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      {/* Wall */}
      <rect x="130" y="0" width="6" height="170" fill={W.matEdge} />
      {/* Standing figure */}
      <Head cx={100} cy={26} r={13} />
      <rect x="82" y="38" width="36" height="52" rx="8" fill={W.body} />
      <rect x="83" y="88" width="16" height="44" rx="7" fill={W.body} />
      <rect x="101" y="88" width="16" height="44" rx="7" fill={W.body} />
      <ellipse cx="91" cy="134" rx="14" ry="5" fill={W.bodyDk} />
      <ellipse cx="109" cy="134" rx="14" ry="5" fill={W.bodyDk} />
      {/* Arms slide up wall */}
      <motion.g
        style={{ transformOrigin: "82px 55px" }}
        animate={{ rotate: [0, -55, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="54" y="50" width="30" height="10" rx="5" fill={W.hl} />
        {/* Forearm (bent at 90°) */}
        <rect x="56" y="35" width="10" height="20" rx="4" fill={W.hl} />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "118px 55px" }}
        animate={{ rotate: [0, 55, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="116" y="50" width="30" height="10" rx="5" fill={W.hl} />
        <rect x="134" y="35" width="10" height="20" rx="4" fill={W.hl} />
      </motion.g>
      {/* Shoulder highlights */}
      <motion.circle cx="82" cy="52" r="8" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T4} />
      <motion.circle cx="118" cy="52" r="8" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T4} />
    </svg>
  );
}

// ─── 24. Step-Up ────────────────────────────────────────────────────────────
export function AnimStepUp() {
  return (
    <svg viewBox="0 0 200 170" className="w-full h-full">
      <rect width="200" height="170" fill={W.bg} />
      <rect x="10" y="155" width="180" height="7" rx="3" fill={W.mat} stroke={W.matEdge} strokeWidth="1" />
      {/* Step platform */}
      <rect x="50" y="130" width="100" height="26" rx="4" fill={W.bodyLt} />
      <rect x="52" y="128" width="96" height="6" rx="3" fill={W.matEdge} />
      {/* Body rises with step */}
      <motion.g
        animate={{ y: [0, -28, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <Head cx={100} cy={28} r={13} />
        <rect x="82" y="40" width="36" height="50" rx="8" fill={W.body} />
      </motion.g>
      {/* Lead leg on step */}
      <motion.g
        style={{ transformOrigin: "90px 102px" }}
        animate={{ rotate: [0, -30, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="74" y="88" width="20" height="44" rx="7" fill={W.hl} />
        <ellipse cx="84" cy="135" rx="14" ry="6" fill={W.bodyDk} />
      </motion.g>
      {/* Back leg lifts */}
      <motion.g
        style={{ transformOrigin: "110px 102px" }}
        animate={{ rotate: [0, 20, 0] }}
        transition={{ ...T4, times: [0, 0.45, 1] }}
      >
        <rect x="106" y="88" width="20" height="44" rx="7" fill={W.body} />
        <ellipse cx="116" cy="135" rx="14" ry="6" fill={W.bodyDk} />
      </motion.g>
      {/* Knee highlight */}
      <motion.circle cx="84" cy="132" r="10" fill={W.hl} opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={T4} />
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={T4}>
        <Arrow x1={100} y1={58} x2={100} y2={42} color={W.arrow} />
      </motion.g>
    </svg>
  );
}

// ─── ENGINE MAP ─────────────────────────────────────────────────────────────
// Maps exercise IDs to their animated components.
// Covers all exercises in ALL_EXERCISES + common aliases.
export const ENGINE_MAP: Record<string, React.FC> = {
  // Hombro / Shoulder
  "shoulder-external-rotation": AnimShoulderExtRotation,
  "shoulder-internal-rotation": AnimShoulderExtRotation,
  "lateral-raise": AnimLateralRaise,
  "shoulder-pendulum": AnimShoulderPendulum,
  "wall-angel": AnimWallAngel,
  "shoulder-press": AnimLateralRaise,
  "anterior-raise": AnimLateralRaise,
  "shoulder-flexion": AnimLateralRaise,
  "shoulder-abduction": AnimLateralRaise,
  "scapular-retraction": AnimBandRow,
  "chest-stretch": AnimWallAngel,

  // Cervical / Neck
  "cervical-retraction": AnimCervicalRetraction,
  "chin-tuck": AnimCervicalRetraction,
  "cervical-flexion": AnimCervicalRetraction,
  "cervical-extension": AnimCervicalRetraction,
  "cervical-lateral-flexion": AnimCervicalRetraction,
  "cervical-rotation": AnimCervicalRetraction,

  // Lumbar / Core
  "bird-dog": AnimBirdDog,
  "dead-bug": AnimDeadBug,
  "plank": AnimPlank,
  "cat-cow": AnimCatCow,
  "pelvic-tilt": AnimPelvicTilt,
  "knee-to-chest": AnimKneeToChest,
  "mckenzie-press": AnimMcKenziePress,
  "mckenzie-extension": AnimMcKenziePress,
  "core-stability": AnimPlank,
  "side-plank": AnimPlank,
  "bridge": AnimGluteBridge,
  "lumbar-flexion": AnimKneeToChest,
  "foam-roller-thoracic": AnimFoamRollerThoracic,
  "thoracic-extension": AnimFoamRollerThoracic,

  // Cadera / Hip
  "glute-bridge": AnimGluteBridge,
  "hip-flexor-stretch": AnimHipFlexorStretch,
  "side-lying-abduction": AnimSideLyingAbduction,
  "hip-abduction": AnimSideLyingAbduction,
  "hip-extension": AnimRDL,
  "clamshell": AnimSideLyingAbduction,
  "hip-thrust": AnimGluteBridge,
  "donkey-kick": AnimBirdDog,
  "fire-hydrant": AnimSideLyingAbduction,
  "pigeon-stretch": AnimHipFlexorStretch,

  // Rodilla / Knee
  "seated-knee-extension": AnimSeatedKneeExtension,
  "knee-extension": AnimSeatedKneeExtension,
  "squat": AnimSquat,
  "wall-squat": AnimSquat,
  "mini-squat": AnimSquat,
  "terminal-knee-extension": AnimSeatedKneeExtension,
  "step-up": AnimStepUp,
  "hamstring-curl": AnimRDL,
  "quad-set": AnimSeatedKneeExtension,
  "straight-leg-raise": AnimDeadBug,
  "lunge": AnimLunge,
  "split-squat": AnimLunge,

  // Tobillo / Ankle
  "ankle-pumps": AnimAnklePumps,
  "ankle-dorsiflexion": AnimAnklePumps,
  "ankle-circles": AnimAnklePumps,
  "calf-raise": AnimCalfRaise,
  "single-leg-calf-raise": AnimCalfRaise,
  "ankle-eversion": AnimAnklePumps,
  "ankle-inversion": AnimAnklePumps,

  // Espalda / Back
  "resistance-band-row": AnimBandRow,
  "band-row": AnimBandRow,
  "rdl": AnimRDL,
  "romanian-deadlift": AnimRDL,
  "deadlift": AnimRDL,
  "good-morning": AnimRDL,
  "back-extension": AnimMcKenziePress,

  // Espalda torácica
  "thoracic-rotation": AnimCatCow,
  "thoracic-foam-roller": AnimFoamRollerThoracic,

  // Glúteo
  "glute-activation": AnimGluteBridge,
  "glute-squeeze": AnimGluteBridge,
};
