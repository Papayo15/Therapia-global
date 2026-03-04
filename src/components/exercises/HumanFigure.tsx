"use client";

/**
 * HumanFigure — Base SVG component
 * Anatomically proportioned stick figure with animatable joints.
 * All joints are accessible via CSS class names for targeted animation.
 */

import { cn } from "@/lib/utils";

export interface HumanFigureProps {
  /** Overall figure color */
  color?: string;
  /** Highlighted muscles/regions */
  highlight?: ("shoulder-l" | "shoulder-r" | "lumbar" | "hip" | "knee" | "ankle" | "cervical" | "elbow" | "core")[];
  /** Extra className on root SVG */
  className?: string;
  /** Size in px */
  size?: number;
  /** Pose variant */
  pose?: "standing" | "supine" | "prone" | "seated" | "quadruped" | "sidelying";
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  "shoulder-l": "#3362ff",
  "shoulder-r": "#3362ff",
  "lumbar":     "#ef4444",
  "hip":        "#f59e0b",
  "knee":       "#10b981",
  "ankle":      "#8b5cf6",
  "cervical":   "#ec4899",
  "elbow":      "#06b6d4",
  "core":       "#f97316",
};

// Standing figure
function StandingFigure({ color, highlight = [] }: { color: string; highlight: string[] }) {
  const getColor = (region: string) =>
    highlight.includes(region) ? HIGHLIGHT_COLORS[region] : color;

  return (
    <g className="figure-standing">
      {/* Head */}
      <circle cx="50" cy="14" r="9" fill={color} className="figure-head" />

      {/* Neck */}
      <rect x="47" y="23" width="6" height="7" rx="2" fill={color} className="figure-neck" />

      {/* Torso */}
      <rect x="34" y="30" width="32" height="38" rx="6"
        fill={getColor("core")}
        opacity={highlight.includes("core") ? 1 : 0.9}
        className="figure-torso"
      />

      {/* Cervical highlight */}
      {highlight.includes("cervical") && (
        <rect x="43" y="28" width="14" height="10" rx="4"
          fill={HIGHLIGHT_COLORS["cervical"]} opacity="0.8"
        />
      )}

      {/* Lumbar highlight */}
      {highlight.includes("lumbar") && (
        <rect x="37" y="52" width="26" height="14" rx="4"
          fill={HIGHLIGHT_COLORS["lumbar"]} opacity="0.8"
        />
      )}

      {/* Left upper arm */}
      <rect x="21" y="32" width="11" height="24" rx="5"
        fill={getColor("shoulder-l")}
        className="figure-arm-upper-l"
        style={{ transformOrigin: "26px 34px" }}
      />
      {/* Left forearm */}
      <rect x="22" y="56" width="10" height="20" rx="5"
        fill={color} className="figure-arm-lower-l"
        style={{ transformOrigin: "27px 57px" }}
      />
      {/* Left hand */}
      <ellipse cx="27" cy="79" rx="5" ry="4" fill={color} className="figure-hand-l" />

      {/* Right upper arm */}
      <rect x="68" y="32" width="11" height="24" rx="5"
        fill={getColor("shoulder-r")}
        className="figure-arm-upper-r"
        style={{ transformOrigin: "74px 34px" }}
      />
      {/* Right forearm */}
      <rect x="68" y="56" width="10" height="20" rx="5"
        fill={color} className="figure-arm-lower-r"
        style={{ transformOrigin: "73px 57px" }}
      />
      {/* Right hand */}
      <ellipse cx="73" cy="79" rx="5" ry="4" fill={color} className="figure-hand-r" />

      {/* Hips */}
      <rect x="34" y="68" width="32" height="10" rx="5"
        fill={getColor("hip")}
        className="figure-hips"
      />

      {/* Left thigh */}
      <rect x="34" y="77" width="13" height="32" rx="6"
        fill={color}
        className="figure-thigh-l"
        style={{ transformOrigin: "40px 78px" }}
      />
      {/* Left knee */}
      <circle cx="40" cy="112" r="6"
        fill={getColor("knee")}
        className="figure-knee-l"
      />
      {/* Left calf */}
      <rect x="35" y="116" width="11" height="26" rx="5"
        fill={color}
        className="figure-calf-l"
        style={{ transformOrigin: "40px 117px" }}
      />
      {/* Left ankle/foot */}
      <ellipse cx="40" cy="145" rx="8" ry="5"
        fill={getColor("ankle")}
        className="figure-foot-l"
      />

      {/* Right thigh */}
      <rect x="53" y="77" width="13" height="32" rx="6"
        fill={color}
        className="figure-thigh-r"
        style={{ transformOrigin: "60px 78px" }}
      />
      {/* Right knee */}
      <circle cx="60" cy="112" r="6"
        fill={getColor("knee")}
        className="figure-knee-r"
      />
      {/* Right calf */}
      <rect x="54" y="116" width="11" height="26" rx="5"
        fill={color}
        className="figure-calf-r"
        style={{ transformOrigin: "60px 117px" }}
      />
      {/* Right ankle/foot */}
      <ellipse cx="60" cy="145" rx="8" ry="5"
        fill={getColor("ankle")}
        className="figure-foot-r"
      />
    </g>
  );
}

// Supine (lying on back) figure
function SupineFigure({ color, highlight = [] }: { color: string; highlight: string[] }) {
  return (
    <g className="figure-supine" transform="translate(10, 50)">
      {/* Head */}
      <circle cx="8" cy="25" r="9" fill={color} />
      {/* Neck */}
      <rect x="16" y="22" width="8" height="6" rx="2" fill={color} />
      {/* Torso */}
      <rect x="23" y="18" width="42" height="16" rx="6" fill={color} opacity="0.9" />
      {/* Hips */}
      <rect x="64" y="18" width="14" height="16" rx="5" fill={color} />
      {/* Upper arms */}
      <rect x="26" y="8" width="10" height="20" rx="4" fill={color}
        style={{ transformOrigin: "31px 12px" }} className="figure-arm-upper-l" />
      <rect x="38" y="8" width="10" height="20" rx="4" fill={color}
        style={{ transformOrigin: "43px 12px" }} className="figure-arm-upper-r" />
      {/* Left leg */}
      <rect x="77" y="14" width="24" height="12" rx="5" fill={color}
        className="figure-thigh-l" style={{ transformOrigin: "78px 20px" }} />
      <circle cx="104" cy="20" r="6" fill={color} className="figure-knee-l" />
      <rect x="108" y="14" width="22" height="12" rx="5" fill={color}
        className="figure-calf-l" style={{ transformOrigin: "109px 20px" }} />
      {/* Right leg */}
      <rect x="77" y="30" width="24" height="12" rx="5" fill={color}
        className="figure-thigh-r" style={{ transformOrigin: "78px 36px" }} />
      <circle cx="104" cy="36" r="6" fill={color} className="figure-knee-r" />
      <rect x="108" y="30" width="22" height="12" rx="5" fill={color}
        className="figure-calf-r" style={{ transformOrigin: "109px 36px" }} />
    </g>
  );
}

// Quadruped (hands and knees)
function QuadrupedFigure({ color }: { color: string }) {
  return (
    <g className="figure-quadruped" transform="translate(5, 20)">
      {/* Head */}
      <circle cx="15" cy="42" r="9" fill={color} />
      <rect x="23" y="39" width="8" height="6" rx="2" fill={color} />
      {/* Torso horizontal */}
      <rect x="30" y="33" width="44" height="16" rx="7" fill={color} opacity="0.9" />
      {/* Left arm down */}
      <rect x="28" y="48" width="11" height="28" rx="5" fill={color}
        className="figure-arm-upper-l" style={{ transformOrigin: "33px 49px" }} />
      <ellipse cx="33" cy="80" rx="8" ry="5" fill={color} />
      {/* Right arm down */}
      <rect x="52" y="48" width="11" height="28" rx="5" fill={color}
        className="figure-arm-upper-r" style={{ transformOrigin: "57px 49px" }} />
      <ellipse cx="57" cy="80" rx="8" ry="5" fill={color} />
      {/* Left leg back */}
      <rect x="64" y="48" width="28" height="11" rx="5" fill={color}
        className="figure-thigh-l" style={{ transformOrigin: "65px 53px" }} />
      <circle cx="95" cy="53" r="6" fill={color} />
      <rect x="97" y="48" width="8" height="22" rx="4" fill={color}
        className="figure-calf-l" />
      <ellipse cx="101" cy="72" rx="8" ry="4" fill={color} />
      {/* Right leg back */}
      <rect x="64" y="62" width="28" height="11" rx="5" fill={color}
        className="figure-thigh-r" style={{ transformOrigin: "65px 67px" }} />
      <circle cx="95" cy="67" r="6" fill={color} />
      <rect x="97" y="62" width="8" height="22" rx="4" fill={color}
        className="figure-calf-r" />
      <ellipse cx="101" cy="86" rx="8" ry="4" fill={color} />
    </g>
  );
}

export function HumanFigure({
  color = "#232d4a",
  highlight = [],
  className,
  size = 160,
  pose = "standing",
}: HumanFigureProps) {
  const viewBoxes: Record<string, string> = {
    standing:  "0 0 100 155",
    supine:    "0 0 160 90",
    prone:     "0 0 160 90",
    seated:    "0 0 100 130",
    quadruped: "0 0 120 100",
    sidelying: "0 0 160 90",
  };

  return (
    <svg
      viewBox={viewBoxes[pose]}
      width={size}
      height={size}
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      {pose === "standing"   && <StandingFigure color={color} highlight={highlight} />}
      {pose === "supine"     && <SupineFigure color={color} highlight={highlight} />}
      {pose === "quadruped"  && <QuadrupedFigure color={color} />}
    </svg>
  );
}
