"use client";

/**
 * ExerciseAnimations — Part 1
 * 15 exercise animations using "Thera", the Therapia Global mascot.
 * Each animation features a colorful human character with face, clothing,
 * highlighted muscle area, and a motion arc showing direction of movement.
 */

import { C, Face, Arc } from "./ExerciseCharacter";

// ─── Shared standing body parts (rendered bottom-up for correct z-order) ──────

function Ground() {
  return <ellipse cx="100" cy="186" rx="52" ry="7" fill={C.ground} />;
}

// Static left arm hanging down
function LeftArmStatic() {
  return (
    <g>
      <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="56" cy="122" r="7" fill={C.skin} />
    </g>
  );
}

// Static right arm hanging down
function RightArmStatic() {
  return (
    <g>
      <line x1="126" y1="58" x2="142" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="142" y1="93" x2="144" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="144" cy="122" r="7" fill={C.skin} />
    </g>
  );
}

// Legs
function Legs({ leftHighlight = false, rightHighlight = false }) {
  const lColor = leftHighlight ? C.highlight : C.pants;
  const rColor = rightHighlight ? C.highlight : C.pants;
  return (
    <g>
      <line x1="82" y1="148" x2="82" y2="177" stroke={lColor} strokeWidth="13" strokeLinecap="round" />
      <line x1="118" y1="148" x2="118" y2="177" stroke={rColor} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={lColor} />
      <circle cx="118" cy="148" r="8" fill={rColor} />
      <line x1="84" y1="112" x2="82" y2="148" stroke={lColor} strokeWidth="16" strokeLinecap="round" />
      <line x1="116" y1="112" x2="118" y2="148" stroke={rColor} strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
    </g>
  );
}

// Torso + hips
function Torso({ lumbarHighlight = false, coreHighlight = false }) {
  const bodyColor = C.shirt;
  const lumbarColor = lumbarHighlight ? C.highlight : C.pants;
  return (
    <g>
      <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={bodyColor} />
      {coreHighlight && (
        <rect x="77" y="70" width="46" height="20" rx="6" fill={C.highlight} opacity="0.4" />
      )}
      {lumbarHighlight && (
        <rect x="77" y="88" width="46" height="18" rx="6" fill={C.highlight} opacity="0.5" />
      )}
      <rect x="74" y="104" width="52" height="12" rx="6" fill={lumbarColor} />
    </g>
  );
}

function Neck() {
  return <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />;
}

// ─── 1. Shoulder External Rotation ───────────────────────────────────────────
export function AnimShoulderExternalRotation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ser_fore { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        .ser-fore { animation:ser_fore 2.2s ease-in-out infinite; transform-origin:142px 90px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={142} cy={90} r={34} a1={-110} a2={20} color={C.highlight} />
      <Ground />
      <Legs />
      <Torso />
      {/* Right upper arm — bent 90° */}
      <line x1="126" y1="58" x2="142" y2="90" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      {/* Right forearm — animated rotation */}
      <g className="ser-fore">
        <line x1="142" y1="90" x2="172" y2="88" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="173" cy="88" r="7" fill={C.skin} />
      </g>
      <LeftArmStatic />
      {/* Shoulder highlight */}
      <circle cx="126" cy="57" r="10" fill={C.highlight} opacity="0.35" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Rotación Externa Hombro</text>
    </svg>
  );
}

// ─── 2. Shoulder Abduction ────────────────────────────────────────────────────
export function AnimShoulderAbduction() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes sab_arm { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-75deg)} }
        .sab-arm { animation:sab_arm 2.5s ease-in-out infinite; transform-origin:126px 56px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={126} cy={56} r={60} a1={30} a2={-60} color={C.highlight} />
      <Ground />
      <Legs />
      <Torso />
      <LeftArmStatic />
      {/* Right arm — lifts sideways */}
      <g className="sab-arm">
        <line x1="126" y1="56" x2="152" y2="90" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="152" y1="90" x2="155" y2="117" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="155" cy="120" r="7" fill={C.skin} />
      </g>
      <circle cx="126" cy="56" r="10" fill={C.highlight} opacity="0.4" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Abducción de Hombro</text>
    </svg>
  );
}

// ─── 3. Shoulder Flexion ──────────────────────────────────────────────────────
export function AnimShoulderFlexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes sfl_arm { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-110deg)} }
        .sfl-arm { animation:sfl_arm 2.8s ease-in-out infinite; transform-origin:126px 56px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={126} cy={56} r={58} a1={30} a2={-90} color={C.arc} />
      <Ground />
      <Legs />
      <Torso />
      <LeftArmStatic />
      <g className="sfl-arm">
        <line x1="126" y1="56" x2="142" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="142" y1="93" x2="144" y2="120" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="144" cy="123" r="7" fill={C.skin} />
      </g>
      <circle cx="126" cy="56" r="10" fill={C.arc} opacity="0.4" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flexión de Hombro</text>
    </svg>
  );
}

// ─── 4. Elbow Flexion ─────────────────────────────────────────────────────────
export function AnimElbowFlexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ef_fore { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-110deg)} }
        .ef-fore { animation:ef_fore 2s ease-in-out infinite; transform-origin:142px 90px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={142} cy={90} r={34} a1={80} a2={-30} color={C.highlight} />
      <Ground />
      <Legs />
      <Torso />
      <LeftArmStatic />
      <line x1="126" y1="58" x2="142" y2="90" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <g className="ef-fore">
        <line x1="142" y1="90" x2="144" y2="120" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="144" cy="123" r="7" fill={C.skin} />
      </g>
      {/* Biceps highlight */}
      <rect x="132" y="62" width="12" height="26" rx="6" fill={C.highlight} opacity="0.35" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flexión de Codo</text>
    </svg>
  );
}

// ─── 5. Wrist Extension ───────────────────────────────────────────────────────
export function AnimWristExtension() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes we_wrist { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        .we-wrist { animation:we_wrist 2s ease-in-out infinite; transform-origin:155px 80px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={155} cy={80} r={22} a1={120} a2={-60} color={C.highlight} />
      <Ground />
      <Legs />
      <Torso />
      <LeftArmStatic />
      {/* Right arm bent — forearm horizontal */}
      <line x1="126" y1="58" x2="142" y2="82" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="142" y1="82" x2="155" y2="80" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <g className="we-wrist">
        <rect x="153" y="73" width="22" height="14" rx="6" fill={C.skin} />
      </g>
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Extensión de Muñeca</text>
    </svg>
  );
}

// ─── 6. Hip Flexion ───────────────────────────────────────────────────────────
export function AnimHipFlexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes hf_leg { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-55deg)} }
        .hf-leg { animation:hf_leg 2.5s ease-in-out infinite; transform-origin:116px 110px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={116} cy={110} r={55} a1={88} a2={30} color={C.highlight} />
      <Ground />
      {/* Static left leg */}
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      {/* Animated right leg */}
      <g className="hf-leg">
        <line x1="116" y1="110" x2="118" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="118" cy="148" r="8" fill={C.highlight} />
        <line x1="118" y1="148" x2="118" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      </g>
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flexión de Cadera</text>
    </svg>
  );
}

// ─── 7. Hip Abduction ─────────────────────────────────────────────────────────
export function AnimHipAbduction() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ha_leg { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(25deg)} }
        .ha-leg { animation:ha_leg 2.8s ease-in-out infinite; transform-origin:116px 110px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={116} cy={110} r={52} a1={88} a2={115} color={C.highlight} />
      <Ground />
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <g className="ha-leg">
        <line x1="116" y1="110" x2="118" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="118" cy="148" r="8" fill={C.highlight} />
        <line x1="118" y1="148" x2="118" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      </g>
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Abducción de Cadera</text>
    </svg>
  );
}

// ─── 8. Knee Flexion ──────────────────────────────────────────────────────────
export function AnimKneeFlexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes kf_calf { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-90deg)} }
        .kf-calf { animation:kf_calf 2.2s ease-in-out infinite; transform-origin:118px 148px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={118} cy={148} r={34} a1={85} a2={-5} color={C.highlight} />
      <Ground />
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <line x1="116" y1="112" x2="118" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <circle cx="118" cy="148" r="9" fill={C.highlight} />
      <g className="kf-calf">
        <line x1="118" y1="148" x2="118" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      </g>
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flexión de Rodilla</text>
    </svg>
  );
}

// ─── 9. Ankle Dorsiflexion ────────────────────────────────────────────────────
export function AnimAnkleDorsiflexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ad_foot { 0%,100%{transform:rotate(20deg)} 50%{transform:rotate(-10deg)} }
        .ad-foot { animation:ad_foot 2s ease-in-out infinite; transform-origin:82px 178px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={82} cy={178} r={22} a1={100} a2={160} color={C.highlight} />
      <Ground />
      <line x1="116" y1="112" x2="118" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="118" y1="148" x2="118" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="118" cy="148" r="8" fill={C.pants} />
      <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="178" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <g className="ad-foot">
        <ellipse cx="82" cy="180" rx="16" ry="6" fill={C.highlight} />
      </g>
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Dorsiflexión Tobillo</text>
    </svg>
  );
}

// ─── 10. Lumbar Flexion ───────────────────────────────────────────────────────
export function AnimLumbarFlexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes lf_upper { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(55deg)} }
        .lf-upper { animation:lf_upper 3s ease-in-out infinite; transform-origin:100px 105px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={100} cy={105} r={60} a1={-90} a2={-35} color={C.highlight} />
      <Ground />
      <Legs />
      {/* Lumbar highlight */}
      <rect x="77" y="90" width="46" height="18" rx="6" fill={C.highlight} opacity="0.3" />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      {/* Upper body bends forward */}
      <g className="lf-upper">
        <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />
        <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="56" cy="122" r="7" fill={C.skin} />
        <line x1="126" y1="58" x2="142" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="142" y1="93" x2="144" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="144" cy="122" r="7" fill={C.skin} />
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flexión Lumbar</text>
    </svg>
  );
}

// ─── 11. Lumbar Extension ─────────────────────────────────────────────────────
export function AnimLumbarExtension() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes le_upper { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-20deg)} }
        .le-upper { animation:le_upper 3s ease-in-out infinite; transform-origin:100px 105px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={100} cy={105} r={55} a1={-90} a2={-110} color={C.arc} />
      <Ground />
      <Legs />
      <rect x="77" y="90" width="46" height="18" rx="6" fill={C.arc} opacity="0.2" />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <g className="le-upper">
        <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />
        <LeftArmStatic />
        <RightArmStatic />
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Extensión Lumbar</text>
    </svg>
  );
}

// ─── 12. Lumbar Rotation ──────────────────────────────────────────────────────
export function AnimLumbarRotation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes lr_upper { 0%,100%{transform:rotateY(0deg) rotate(0deg)} 50%{transform:rotateY(30deg) rotate(0deg)} }
        @keyframes lr_rot { 0%,100%{transform:scaleX(1)} 40%{transform:scaleX(0.4)} 50%{transform:scaleX(-0.4)} 90%,100%{transform:scaleX(1)} }
        .lr-upper { animation:lr_rot 3s ease-in-out infinite; transform-origin:100px 75px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      {/* Rotation arrows */}
      <text x="50" y="75" fontSize="20" fill={C.highlight} opacity="0.7">↺</text>
      <text x="132" y="75" fontSize="20" fill={C.highlight} opacity="0.7">↻</text>
      <Ground />
      <Legs />
      <rect x="77" y="90" width="46" height="18" rx="6" fill={C.highlight} opacity="0.25" />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <g className="lr-upper">
        <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />
        <LeftArmStatic />
        <RightArmStatic />
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Rotación Lumbar</text>
    </svg>
  );
}

// ─── 13. Neck Flexion ─────────────────────────────────────────────────────────
export function AnimNeckFlexion() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes nf_head { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(35deg)} }
        .nf-head { animation:nf_head 2.5s ease-in-out infinite; transform-origin:100px 43px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={100} cy={43} r={32} a1={-90} a2={-50} color={C.highlight} />
      <Ground />
      <Legs />
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      {/* Cervical highlight */}
      <rect x="88" y="40" width="24" height="12" rx="6" fill={C.highlight} opacity="0.35" />
      <g className="nf-head">
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flexión Cervical</text>
    </svg>
  );
}

// ─── 14. Neck Rotation ────────────────────────────────────────────────────────
export function AnimNeckRotation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes nr_head { 0%{transform:scaleX(1)} 30%{transform:scaleX(0.3)} 50%{transform:scaleX(-0.5)} 80%{transform:scaleX(1)} 100%{transform:scaleX(1)} }
        .nr-head { animation:nr_head 2.8s ease-in-out infinite; transform-origin:100px 25px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <text x="66" y="30" fontSize="16" fill={C.highlight} opacity="0.7">←</text>
      <text x="116" y="30" fontSize="16" fill={C.highlight} opacity="0.7">→</text>
      <Ground />
      <Legs />
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <rect x="88" y="40" width="24" height="12" rx="6" fill={C.highlight} opacity="0.35" />
      <g className="nr-head">
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Rotación Cervical</text>
    </svg>
  );
}


// ─── 15. Bridging (Supine) ────────────────────────────────────────────────────
export function AnimBridging() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes br_hips { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-28px)} }
        .br-hips { animation:br_hips 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      {/* Floor/mat */}
      <rect x="10" y="128" width="200" height="8" rx="4" fill={C.ground} />
      {/* Movement arrow */}
      <text x="100" y="50" fontSize="18" fill={C.highlight} opacity="0.7" textAnchor="middle">↑</text>
      {/* Head */}
      <circle cx="22" cy="110" r="14" fill={C.skin} />
      <ellipse cx="22" cy="102" rx="13" ry="8" fill={C.hair} />
      <circle cx="17" cy="108" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="108" r="2" fill="#1C1C1E" />
      {/* Shoulders/torso static */}
      <line x1="36" y1="108" x2="78" y2="108" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      {/* Animated: hips + legs */}
      <g className="br-hips">
        {/* Hips highlight */}
        <rect x="78" y="100" width="36" height="18" rx="8" fill={C.highlight} />
        {/* Left leg bent */}
        <line x1="82" y1="110" x2="82" y2="128" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
        <line x1="82" y1="128" x2="94" y2="126" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        {/* Right leg bent */}
        <line x1="108" y1="110" x2="108" y2="128" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
        <line x1="108" y1="128" x2="120" y2="126" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        {/* Feet */}
        <ellipse cx="96" cy="126" rx="10" ry="6" fill={C.shoes} />
        <ellipse cx="122" cy="126" rx="10" ry="6" fill={C.shoes} />
      </g>
      <text x="110" y="155" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Puente (Bridging)</text>
    </svg>
  );
}

// ─── 16. Bird Dog ─────────────────────────────────────────────────────────────
export function AnimBirdDog() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full">
      <style>{`
        @keyframes bd_arm { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-30deg)} }
        @keyframes bd_leg { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(20deg)} }
        .bd-arm { animation:bd_arm 2.5s ease-in-out infinite; transform-origin:55px 95px; }
        .bd-leg { animation:bd_leg 2.5s ease-in-out infinite; transform-origin:145px 100px; }
      `}</style>
      <rect width="200" height="180" fill={C.bg} rx="12" />
      <rect x="20" y="150" width="160" height="10" rx="5" fill="#A7F3D0" />
      <ellipse cx="42" cy="148" rx="12" ry="6" fill={C.skin} />
      <ellipse cx="52" cy="155" rx="10" ry="6" fill={C.shoes} />
      <ellipse cx="158" cy="148" rx="12" ry="6" fill={C.skin} />
      <ellipse cx="148" cy="155" rx="10" ry="6" fill={C.shoes} />
      <line x1="42" y1="140" x2="55" y2="100" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="158" y1="140" x2="145" y2="100" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="52" y1="152" x2="65" y2="100" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <line x1="148" y1="152" x2="135" y2="100" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <path d="M55,100 Q100,80 145,100" stroke={C.shirt} strokeWidth="22" strokeLinecap="round" fill="none" />
      <rect x="80" y="90" width="40" height="12" rx="5" fill={C.highlight} opacity="0.35" />
      <g className="bd-arm">
        <line x1="55" y1="95" x2="28" y2="82" stroke={C.highlight} strokeWidth="12" strokeLinecap="round" />
        <circle cx="24" cy="80" r="7" fill={C.skin} />
      </g>
      <g className="bd-leg">
        <line x1="145" y1="100" x2="172" y2="110" stroke={C.highlight} strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="176" cy="112" rx="12" ry="6" fill={C.shoes} />
      </g>
      <circle cx="30" cy="88" r="14" fill={C.skin} />
      <ellipse cx="30" cy="81" rx="13" ry="8" fill={C.hair} />
      <circle cx="25" cy="86" r="2" fill="#1C1C1E" />
      <circle cx="35" cy="86" r="2" fill="#1C1C1E" />
      <text x="100" y="175" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Bird Dog</text>
    </svg>
  );
}

// ─── 17. Hip Flexor Stretch ───────────────────────────────────────────────────
export function AnimHipFlexorStretch() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes hfs { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-15deg)} }
        .hfs-upper { animation:hfs 3s ease-in-out infinite; transform-origin:100px 105px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <rect x="20" y="176" width="160" height="10" rx="5" fill="#A7F3D0" />
      <ellipse cx="140" cy="179" rx="14" ry="6" fill={C.shoes} />
      <line x1="140" y1="115" x2="140" y2="174" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <line x1="84" y1="115" x2="82" y2="148" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="174" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="177" rx="14" ry="6" fill={C.shoes} />
      <rect x="78" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <rect x="100" y="100" width="32" height="12" rx="5" fill={C.highlight} opacity="0.4" />
      <g className="hfs-upper">
        <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />
        <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="56" cy="122" r="7" fill={C.skin} />
        <line x1="126" y1="58" x2="142" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="142" y1="93" x2="144" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="144" cy="122" r="7" fill={C.skin} />
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Estiramiento Flexor Cadera</text>
    </svg>
  );
}

// ─── 18. Resistance Band Row ──────────────────────────────────────────────────
export function AnimResistanceBandRow() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes rbr_arms { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-22px)} }
        .rbr-arms { animation:rbr_arms 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <rect x="20" y="176" width="160" height="10" rx="5" fill="#A7F3D0" />
      <rect x="170" y="130" width="12" height="50" rx="4" fill="#9CA3AF" />
      <line x1="170" y1="142" x2="148" y2="85" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
      <line x1="170" y1="148" x2="148" y2="95" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
      <Legs />
      <Torso />
      <g className="rbr-arms">
        <line x1="74" y1="68" x2="148" y2="82" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <circle cx="150" cy="82" r="7" fill={C.skin} />
        <line x1="74" y1="74" x2="148" y2="92" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <circle cx="150" cy="92" r="7" fill={C.skin} />
      </g>
      <rect x="62" y="58" width="30" height="36" rx="8" fill={C.highlight} opacity="0.3" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Remo con Banda</text>
    </svg>
  );
}

// ─── 19. Dumbbell Lateral Raise ───────────────────────────────────────────────
export function AnimDumbbellLateralRaise() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes dlr { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-70deg)} }
        .dlr-arm { animation:dlr 2.5s ease-in-out infinite; transform-origin:74px 56px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={74} cy={56} r={58} a1={30} a2={-55} color={C.highlight} />
      <Legs />
      <Torso />
      <RightArmStatic />
      <g className="dlr-arm">
        <line x1="74" y1="56" x2="50" y2="90" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="50" y1="90" x2="48" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="48" cy="121" r="7" fill={C.skin} />
        <g fill={C.equipment}>
          <rect x={41} y={122} width="4" height="20" rx="2" />
          <rect x={35} y={120} width="16" height="6" rx="3" />
          <rect x={35} y={136} width="16" height="6" rx="3" />
        </g>
      </g>
      <circle cx="74" cy="56" r="10" fill={C.highlight} opacity="0.35" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Elevación Lateral c/Mancuerna</text>
    </svg>
  );
}

// ─── 20. Cervical Retraction ──────────────────────────────────────────────────
export function AnimCervicalRetraction() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes cr2 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-8px)} }
        .cr2-head { animation:cr2 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <text x="80" y="30" fontSize="14" fill={C.highlight} opacity="0.7">←</text>
      <Legs />
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <rect x="86" y="38" width="28" height="12" rx="6" fill={C.highlight} opacity="0.35" />
      <g className="cr2-head">
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Retracción Cervical</text>
    </svg>
  );
}

// ─── 21. Ankle Pumps ──────────────────────────────────────────────────────────
export function AnimAnklePumps() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ap { 0%,100%{transform:rotate(20deg)} 50%{transform:rotate(-15deg)} }
        .ap-feet { animation:ap 1.5s ease-in-out infinite; transform-origin:100px 178px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={82} cy={178} r={24} a1={100} a2={160} color={C.highlight} />
      <Arc cx={118} cy={178} r={24} a1={100} a2={160} color={C.highlight} />
      <Legs />
      <Torso />
      <RightArmStatic />
      <LeftArmStatic />
      <g className="ap-feet">
        <ellipse cx="82" cy="180" rx="16" ry="6" fill={C.highlight} />
        <ellipse cx="118" cy="180" rx="16" ry="6" fill={C.highlight} />
      </g>
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Bombeo de Tobillos</text>
    </svg>
  );
}

// ─── 22. Foam Roller Thoracic ─────────────────────────────────────────────────
export function AnimFoamRollerThoracic() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes frt { 0%,100%{transform:translateX(0)} 50%{transform:translateX(20px)} }
        .frt-body { animation:frt 3s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      <rect x="20" y="148" width="180" height="8" rx="4" fill={C.ground} />
      <g className="frt-body">
        <circle cx="30" cy="110" r="13" fill={C.skin} />
        <ellipse cx="30" cy="103" rx="12" ry="8" fill={C.hair} />
        <circle cx="25" cy="108" r="2" fill="#1C1C1E" />
        <circle cx="35" cy="108" r="2" fill="#1C1C1E" />
        {/* Foam roller under thoracic */}
        <ellipse cx="100" cy="140" rx="60" ry="12" fill="#F97316" />
        <ellipse cx="100" cy="128" rx="60" ry="12" fill="#FB923C" />
        <line x1="43" y1="112" x2="165" y2="128" stroke={C.shirt} strokeWidth="20" strokeLinecap="round" />
        <rect x="75" y="118" width="50" height="12" rx="5" fill={C.highlight} opacity="0.4" />
        <line x1="50" y1="120" x2="38" y2="140" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
        <circle cx="38" cy="142" r="6" fill={C.skin} />
        <line x1="58" y1="118" x2="46" y2="140" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
        <circle cx="46" cy="142" r="6" fill={C.skin} />
        <line x1="165" y1="128" x2="190" y2="128" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="196" cy="128" rx="12" ry="6" fill={C.shoes} />
        <line x1="160" y1="130" x2="180" y2="148" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="182" cy="150" rx="12" ry="5" fill={C.shoes} />
      </g>
      <text x="110" y="158" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Foam Roller Torácico</text>
    </svg>
  );
}

// ─── 23. Seated Knee Extension ────────────────────────────────────────────────
export function AnimSeatedKneeExtension() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ske { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-65deg)} }
        .ske-leg { animation:ske 2.5s ease-in-out infinite; transform-origin:118px 148px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <rect x="55" y="148" width="90" height="10" rx="5" fill="#CBD5E1" />
      <Arc cx={118} cy={148} r={36} a1={85} a2={20} color={C.highlight} />
      <rect x="74" y="104" width="52" height="48" rx="6" fill={C.pants} />
      <line x1="84" y1="148" x2="82" y2="176" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <ellipse cx="82" cy="179" rx="14" ry="6" fill={C.shoes} />
      <circle cx="118" cy="148" r="9" fill={C.highlight} />
      <g className="ske-leg">
        <line x1="118" y1="148" x2="118" y2="176" stroke={C.highlight} strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="118" cy="179" rx="14" ry="6" fill={C.shoes} />
      </g>
      <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />
      <line x1="74" y1="68" x2="58" y2="100" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <circle cx="58" cy="103" r="7" fill={C.skin} />
      <line x1="126" y1="68" x2="142" y2="100" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <circle cx="142" cy="103" r="7" fill={C.skin} />
      <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Extensión Rodilla Sentado</text>
    </svg>
  );
}

// ─── 24. Shoulder Press ───────────────────────────────────────────────────────
export function AnimShoulderPress() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes sp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        .sp-arms { animation:sp 2.2s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Legs />
      <Torso />
      <g className="sp-arms">
        <line x1="74" y1="58" x2="50" y2="35" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <circle cx="48" cy="32" r="7" fill={C.skin} />
        <g fill={C.equipment}>
          <rect x={40} y={15} width="4" height="20" rx="2" />
          <rect x={34} y={13} width="16" height="6" rx="3" />
          <rect x={34} y={29} width="16" height="6" rx="3" />
        </g>
        <line x1="126" y1="58" x2="150" y2="35" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <circle cx="152" cy="32" r="7" fill={C.skin} />
        <g fill={C.equipment}>
          <rect x={148} y={15} width="4" height="20" rx="2" />
          <rect x={142} y={13} width="16" height="6" rx="3" />
          <rect x={142} y={29} width="16" height="6" rx="3" />
        </g>
      </g>
      <circle cx="74" cy="56" r="10" fill={C.highlight} opacity="0.35" />
      <circle cx="126" cy="56" r="10" fill={C.highlight} opacity="0.35" />
      <Neck />
      <Face x={100} y={25} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Press de Hombros</text>
    </svg>
  );
}
