"use client";

/**
 * ExerciseAnimations — Part 3 (8 exercises)
 * Therapeutic / rehabilitation exercises using "Thera" mascot.
 */

import { C, Face, Arc } from "./ExerciseCharacter";

function Mat() { return <rect x="20" y="176" width="160" height="10" rx="5" fill="#A7F3D0" />; }
function Ground() { return <ellipse cx="100" cy="186" rx="60" ry="7" fill={C.ground} />; }

// ─── 1. Cat-Cow ───────────────────────────────────────────────────────────────
export function AnimCatCow() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full">
      <style>{`
        @keyframes cc_back { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.75)} }
        @keyframes cc_head { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(30deg)} }
        .cc-back { animation:cc_back 3s ease-in-out infinite; transform-origin:100px 85px; }
        .cc-head { animation:cc_head 3s ease-in-out infinite; transform-origin:30px 75px; }
      `}</style>
      <rect width="200" height="180" fill={C.bg} rx="12" />
      <Mat />
      {/* Floor ground */}
      {/* Right hand */}
      <ellipse cx="158" cy="140" rx="12" ry="6" fill={C.skin} />
      {/* Right knee */}
      <ellipse cx="148" cy="155" rx="10" ry="6" fill={C.shoes} />
      {/* Left hand */}
      <ellipse cx="42" cy="140" rx="12" ry="6" fill={C.skin} />
      {/* Left knee */}
      <ellipse cx="52" cy="155" rx="10" ry="6" fill={C.shoes} />
      {/* Arms */}
      <line x1="42" y1="140" x2="55" y2="100" stroke={C.skin} strokeWidth="13" strokeLinecap="round" />
      <line x1="158" y1="140" x2="145" y2="100" stroke={C.skin} strokeWidth="13" strokeLinecap="round" />
      {/* Legs back */}
      <line x1="52" y1="155" x2="60" y2="100" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <line x1="148" y1="155" x2="140" y2="100" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      {/* Spine — animated */}
      <g className="cc-back">
        <path d="M55,100 Q100,72 145,100" stroke={C.shirt} strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M55,100 Q100,82 145,100" stroke={C.highlight} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.6" />
      </g>
      {/* Head */}
      <g className="cc-head">
        <circle cx="30" cy="88" r="14" fill={C.skin} />
        <ellipse cx="30" cy="81" rx="13" ry="8" fill={C.hair} />
        <circle cx="25" cy="86" r="2" fill="#1C1C1E" />
        <circle cx="35" cy="86" r="2" fill="#1C1C1E" />
      </g>
      <text x="100" y="176" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Cat-Cow (Columna)</text>
    </svg>
  );
}

// ─── 2. Nerve Flossing Sciatica ───────────────────────────────────────────────
export function AnimNerveFlossingSciatica() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes nf2_leg { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-40deg)} }
        @keyframes nf2_head { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(15deg)} }
        .nf2-leg { animation:nf2_leg 2.5s ease-in-out infinite; transform-origin:100px 140px; }
        .nf2-head { animation:nf2_head 2.5s ease-in-out infinite reverse; transform-origin:100px 43px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      {/* Seated on edge */}
      <rect x="60" y="140" width="80" height="10" rx="5" fill="#CBD5E1" />
      <rect x="74" y="104" width="52" height="40" rx="6" fill={C.pants} />
      {/* Static left leg down */}
      <line x1="84" y1="140" x2="82" y2="177" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      {/* Animated right leg extending */}
      <g className="nf2-leg">
        <line x1="116" y1="140" x2="118" y2="177" stroke={C.highlight} strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
        {/* Sciatic nerve indicator */}
        <line x1="116" y1="144" x2="118" y2="170" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4,3" opacity="0.8" />
      </g>
      {/* Torso */}
      <path d="M74,52 L72,106 L128,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />
      {/* Arms at sides */}
      <line x1="74" y1="68" x2="55" y2="95" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <circle cx="55" cy="98" r="7" fill={C.skin} />
      <line x1="126" y1="68" x2="145" y2="95" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <circle cx="145" cy="98" r="7" fill={C.skin} />
      <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
      <g className="nf2-head">
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flossing Nervio Ciático</text>
    </svg>
  );
}

// ─── 3. Pelvic Tilt ───────────────────────────────────────────────────────────
export function AnimPelvicTilt() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes pt_hips { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-8deg)} }
        .pt-hips { animation:pt_hips 2.8s ease-in-out infinite; transform-origin:100px 108px; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Mat />
      {/* Supine: head on left */}
      <circle cx="22" cy="108" r="13" fill={C.skin} />
      <ellipse cx="22" cy="101" rx="12" ry="8" fill={C.hair} />
      <circle cx="17" cy="106" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="106" r="2" fill="#1C1C1E" />
      <line x1="35" y1="108" x2="80" y2="108" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      {/* Arms flat */}
      <line x1="45" y1="116" x2="45" y2="140" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <line x1="63" y1="116" x2="63" y2="140" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      {/* Pelvic/hip area animated */}
      <g className="pt-hips">
        <rect x="80" y="100" width="44" height="18" rx="7" fill={C.highlight} />
        <text x="102" y="113" textAnchor="middle" fontSize="7" fontWeight="800" fill="white">PELVIS</text>
        {/* Bent legs */}
        <line x1="85" y1="115" x2="85" y2="138" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="85" y1="138" x2="100" y2="138" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <line x1="110" y1="115" x2="110" y2="138" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="110" y1="138" x2="125" y2="138" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="102" cy="138" rx="10" ry="5" fill={C.shoes} />
        <ellipse cx="127" cy="138" rx="10" ry="5" fill={C.shoes} />
      </g>
      <text x="110" y="166" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Inclinación Pélvica</text>
    </svg>
  );
}

// ─── 4. Child's Pose ──────────────────────────────────────────────────────────
export function AnimChildsPose() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes cp_arms { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
        .cp-arms { animation:cp_arms 3s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      <Mat />
      {/* Knees/hips on right */}
      <ellipse cx="165" cy="148" rx="20" ry="10" fill={C.pants} />
      <ellipse cx="148" cy="152" rx="15" ry="7" fill={C.shoes} />
      <ellipse cx="178" cy="152" rx="15" ry="7" fill={C.shoes} />
      {/* Torso stretched forward */}
      <line x1="148" y1="140" x2="80" y2="128" stroke={C.shirt} strokeWidth="22" strokeLinecap="round" />
      {/* Lumbar highlight */}
      <line x1="148" y1="138" x2="100" y2="126" stroke={C.highlight} strokeWidth="8" opacity="0.4" strokeLinecap="round" />
      {/* Arms stretched forward */}
      <g className="cp-arms">
        <line x1="80" y1="128" x2="32" y2="122" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="80" y1="132" x2="32" y2="138" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="28" cy="122" rx="10" ry="5" fill={C.skin} />
        <ellipse cx="28" cy="138" rx="10" ry="5" fill={C.skin} />
      </g>
      {/* Head down */}
      <circle cx="68" cy="118" r="13" fill={C.skin} />
      <ellipse cx="68" cy="111" rx="12" ry="8" fill={C.hair} />
      <text x="110" y="156" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Postura del Niño</text>
    </svg>
  );
}

// ─── 5. Lumbar Rotation (floor) ───────────────────────────────────────────────
export function AnimLumbarRotation() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes lr2_legs { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(35deg)} }
        .lr2-legs { animation:lr2_legs 3s ease-in-out infinite; transform-origin:100px 115px; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="20" cy="110" r="13" fill={C.skin} />
      <ellipse cx="20" cy="103" rx="12" ry="8" fill={C.hair} />
      <circle cx="15" cy="108" r="2" fill="#1C1C1E" />
      <circle cx="25" cy="108" r="2" fill="#1C1C1E" />
      <line x1="33" y1="110" x2="78" y2="110" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      {/* Arms spread out */}
      <line x1="45" y1="103" x2="22" y2="82" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
      <circle cx="20" cy="80" r="7" fill={C.skin} />
      <line x1="65" y1="100" x2="72" y2="78" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
      <circle cx="73" cy="75" r="7" fill={C.skin} />
      {/* Hips + legs rotating */}
      <rect x="78" y="104" width="44" height="14" rx="6" fill={C.highlight} opacity="0.4" />
      <g className="lr2-legs">
        <rect x="78" y="104" width="44" height="14" rx="6" fill={C.pants} />
        <line x1="85" y1="115" x2="85" y2="142" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="85" y1="142" x2="100" y2="142" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <line x1="110" y1="115" x2="110" y2="142" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="110" y1="142" x2="125" y2="142" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="102" cy="142" rx="10" ry="5" fill={C.shoes} />
        <ellipse cx="127" cy="142" rx="10" ry="5" fill={C.shoes} />
      </g>
      <text x="110" y="166" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Rotación Lumbar (suelo)</text>
    </svg>
  );
}

// ─── 6. McKenzie Press ────────────────────────────────────────────────────────
export function AnimMcKenziePress() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes mk_upper { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-22deg)} }
        .mk-upper { animation:mk_upper 3s ease-in-out infinite; transform-origin:100px 118px; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Mat />
      {/* Prone: feet on right */}
      <ellipse cx="192" cy="152" rx="15" ry="6" fill={C.shoes} />
      <ellipse cx="176" cy="152" rx="15" ry="6" fill={C.shoes} />
      <line x1="178" y1="148" x2="100" y2="140" stroke={C.pants} strokeWidth="20" strokeLinecap="round" />
      {/* Lumbar highlight */}
      <rect x="95" y="132" width="50" height="12" rx="5" fill={C.highlight} opacity="0.4" />
      {/* Upper body lifting */}
      <g className="mk-upper">
        <line x1="100" y1="140" x2="55" y2="132" stroke={C.shirt} strokeWidth="22" strokeLinecap="round" />
        {/* Arms pressing up */}
        <line x1="68" y1="128" x2="48" y2="115" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="48" y1="115" x2="42" y2="138" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="42" cy="140" rx="10" ry="5" fill={C.skin} />
        <line x1="85" y1="126" x2="70" y2="112" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="70" y1="112" x2="64" y2="136" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="64" cy="138" rx="10" ry="5" fill={C.skin} />
        {/* Head up */}
        <circle cx="38" cy="112" r="13" fill={C.skin} />
        <ellipse cx="38" cy="105" rx="12" ry="8" fill={C.hair} />
        <circle cx="33" cy="110" r="2" fill="#1C1C1E" />
        <circle cx="43" cy="110" r="2" fill="#1C1C1E" />
        <path d="M34,118 Q38,122 42,118" stroke="#1C1C1E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
      <text x="110" y="166" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Extensión McKenzie</text>
    </svg>
  );
}

// ─── 7. Knee to Chest ────────────────────────────────────────────────────────
export function AnimKneeToChest() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes ktc { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-35deg)} }
        .ktc-leg { animation:ktc 2.8s ease-in-out infinite; transform-origin:100px 115px; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="22" cy="108" r="13" fill={C.skin} />
      <ellipse cx="22" cy="101" rx="12" ry="8" fill={C.hair} />
      <circle cx="17" cy="106" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="106" r="2" fill="#1C1C1E" />
      <line x1="35" y1="108" x2="78" y2="108" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <line x1="38" y1="116" x2="38" y2="138" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="38" cy="140" r="6" fill={C.skin} />
      {/* Static right leg flat */}
      <line x1="115" y1="114" x2="155" y2="114" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <ellipse cx="160" cy="114" rx="12" ry="6" fill={C.shoes} />
      {/* Animated left leg pulling to chest */}
      <g className="ktc-leg">
        <rect x="78" y="106" width="44" height="14" rx="6" fill={C.highlight} />
        <line x1="100" y1="115" x2="100" y2="145" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="100" cy="145" r="8" fill={C.highlight} />
        <line x1="100" y1="145" x2="120" y2="145" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="122" cy="145" rx="10" ry="5" fill={C.shoes} />
      </g>
      {/* Arm holding knee */}
      <line x1="60" y1="112" x2="80" y2="128" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <text x="110" y="157" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Rodilla al Pecho</text>
    </svg>
  );
}

// ─── 8. Prone Hip Extension ───────────────────────────────────────────────────
export function AnimProneHipExtension() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes phe { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-25deg)} }
        .phe-leg { animation:phe 2.5s ease-in-out infinite; transform-origin:130px 140px; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      <Mat />
      <Arc cx={130} cy={140} r={38} a1={-10} a2={-38} color={C.highlight} />
      {/* Static left leg */}
      <line x1="100" y1="140" x2="70" y2="140" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="65" cy="140" rx="12" ry="6" fill={C.shoes} />
      {/* Animated right leg lifting */}
      <g className="phe-leg">
        <line x1="130" y1="140" x2="165" y2="140" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <ellipse cx="170" cy="140" rx="12" ry="6" fill={C.shoes} />
      </g>
      {/* Hips */}
      <rect x="100" y="132" width="46" height="16" rx="7" fill={C.highlight} opacity="0.4" />
      <rect x="100" y="132" width="46" height="16" rx="7" fill={C.pants} opacity="0.6" />
      {/* Torso flat */}
      <line x1="100" y1="138" x2="48" y2="132" stroke={C.shirt} strokeWidth="22" strokeLinecap="round" />
      {/* Arms */}
      <line x1="65" y1="126" x2="42" y2="118" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
      <ellipse cx="38" cy="116" rx="10" ry="5" fill={C.skin} />
      {/* Head */}
      <circle cx="38" cy="108" r="13" fill={C.skin} />
      <ellipse cx="38" cy="101" rx="12" ry="8" fill={C.hair} />
      <circle cx="33" cy="106" r="2" fill="#1C1C1E" />
      <circle cx="43" cy="106" r="2" fill="#1C1C1E" />
      <text x="110" y="157" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Extensión Cadera (prono)</text>
    </svg>
  );
}
