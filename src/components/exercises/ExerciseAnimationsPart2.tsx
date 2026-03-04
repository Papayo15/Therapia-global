"use client";

/**
 * ExerciseAnimations — Part 2 (25 exercises)
 * Equipment-based exercises using "Thera" mascot.
 */

import { C, Face, Arc } from "./ExerciseCharacter";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Ground() { return <ellipse cx="100" cy="186" rx="60" ry="7" fill={C.ground} />; }
function Mat() { return <rect x="20" y="176" width="160" height="10" rx="5" fill="#A7F3D0" />; }

function StandLegs() {
  return (
    <g>
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <line x1="116" y1="112" x2="118" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="118" y1="148" x2="118" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="118" cy="148" r="8" fill={C.pants} />
      <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
    </g>
  );
}
function StandTorso() {
  return <path d="M74,52 L70,106 L130,106 L126,52 Q113,47 100,47 Q87,47 74,52Z" fill={C.shirt} />;
}
function StandArms() {
  return (
    <g>
      <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="56" cy="122" r="7" fill={C.skin} />
      <line x1="126" y1="58" x2="142" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="142" y1="93" x2="144" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="144" cy="122" r="7" fill={C.skin} />
    </g>
  );
}
function NeckFace() {
  return (
    <g>
      <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
      <Face x={100} y={25} />
    </g>
  );
}
function DB({ x, y }: { x: number; y: number }) {
  return (
    <g fill={C.equipment}>
      <rect x={x - 2} y={y - 12} width="4" height="24" rx="2" />
      <rect x={x - 7} y={y - 14} width="14" height="7" rx="3" />
      <rect x={x - 7} y={y + 7} width="14" height="7" rx="3" />
    </g>
  );
}
function Band({ x1, y1, x2, y2 }: { x1: number | string; y1: number | string; x2: number | string; y2: number | string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />;
}
function Ball({ cx, cy, r = 26 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
      <ellipse cx={cx - r * 0.25} cy={cy - r * 0.25} rx={r * 0.2} ry={r * 0.15} fill="white" opacity="0.4" />
    </g>
  );
}
function Bosu({ cx = 100, y = 175 }: { cx?: number; y?: number }) {
  return (
    <g>
      <rect x={cx - 40} y={y} width="80" height="8" rx="3" fill="#374151" />
      <ellipse cx={cx} cy={y} rx="40" ry="18" fill="#60A5FA" />
      <ellipse cx={cx} cy={y} rx="28" ry="12" fill="#93C5FD" opacity="0.5" />
    </g>
  );
}

// ─── 1. Ball Bridge ───────────────────────────────────────────────────────────
export function AnimBallBridge() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes bb_h { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        .bb-h { animation:bb_h 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="22" cy="115" r="13" fill={C.skin} />
      <ellipse cx="22" cy="108" rx="12" ry="8" fill={C.hair} />
      <circle cx="17" cy="113" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="113" r="2" fill="#1C1C1E" />
      <line x1="35" y1="112" x2="75" y2="112" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <g className="bb-h">
        <rect x="75" y="104" width="36" height="18" rx="8" fill={C.highlight} />
        <line x1="80" y1="115" x2="80" y2="140" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="80" y1="140" x2="95" y2="140" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <line x1="107" y1="115" x2="107" y2="140" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="107" y1="140" x2="122" y2="140" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="97" cy="140" rx="10" ry="5" fill={C.shoes} />
        <ellipse cx="124" cy="140" rx="10" ry="5" fill={C.shoes} />
      </g>
      <Ball cx={158} cy={140} r={22} />
      <line x1="122" y1="138" x2="136" y2="140" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <text x="110" y="166" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Puente con Balón</text>
    </svg>
  );
}

// ─── 2. Ball Hamstring Curl ───────────────────────────────────────────────────
export function AnimBallHamstringCurl() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes bhc { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-45deg)} }
        .bhc-legs { animation:bhc 2.5s ease-in-out infinite; transform-origin:88px 110px; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="22" cy="110" r="13" fill={C.skin} />
      <ellipse cx="22" cy="103" rx="12" ry="8" fill={C.hair} />
      <circle cx="17" cy="108" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="108" r="2" fill="#1C1C1E" />
      <line x1="35" y1="110" x2="88" y2="110" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <rect x="80" y="104" width="38" height="14" rx="7" fill={C.highlight} />
      <g className="bhc-legs">
        <line x1="88" y1="110" x2="130" y2="110" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="130" cy="110" r="8" fill={C.highlight} />
        <line x1="130" y1="110" x2="160" y2="110" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      </g>
      <Ball cx={165} cy={120} r={22} />
      <text x="110" y="165" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Curl Isquios c/Balón</text>
    </svg>
  );
}

// ─── 3. Ball Push Up ──────────────────────────────────────────────────────────
export function AnimBallPushUp() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bpu3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .bpu3-body { animation:bpu3 2s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ball cx={55} cy={148} r={26} />
      <g className="bpu3-body">
        <circle cx="158" cy="98" r="13" fill={C.skin} />
        <ellipse cx="158" cy="91" rx="12" ry="8" fill={C.hair} />
        <circle cx="153" cy="96" r="2" fill="#1C1C1E" />
        <circle cx="163" cy="96" r="2" fill="#1C1C1E" />
        <line x1="145" y1="102" x2="86" y2="122" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
        <line x1="86" y1="122" x2="56" y2="124" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="145" y1="108" x2="152" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="160" y1="106" x2="168" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="152" cy="150" rx="12" ry="5" fill={C.shoes} />
        <ellipse cx="168" cy="150" rx="12" ry="5" fill={C.shoes} />
      </g>
      <text x="100" y="175" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Push-Up con Balón</text>
    </svg>
  );
}

// ─── 4. Ball Lumbar Extension ─────────────────────────────────────────────────
export function AnimBallLumbarExtension() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ble2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-22deg)} }
        .ble2-upper { animation:ble2 3s ease-in-out infinite; transform-origin:100px 118px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ball cx={100} cy={148} r={32} />
      <line x1="68" y1="138" x2="132" y2="138" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="64" cy="148" rx="13" ry="5" fill={C.shoes} />
      <ellipse cx="136" cy="148" rx="13" ry="5" fill={C.shoes} />
      <rect x="78" y="118" width="44" height="14" rx="6" fill={C.highlight} opacity="0.35" />
      <g className="ble2-upper">
        <path d="M78,100 L74,130 L126,130 L122,100 Q112,95 100,95 Q88,95 78,100Z" fill={C.shirt} />
        <rect x="95" y="90" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={73} />
      </g>
      <text x="100" y="192" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Ext. Lumbar c/Balón</text>
    </svg>
  );
}

// ─── 5. Ball Lateral Flex ─────────────────────────────────────────────────────
export function AnimBallLateralFlex() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes blf2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(28deg)} }
        .blf2-upper { animation:blf2 3s ease-in-out infinite; transform-origin:100px 105px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={100} cy={105} r={60} a1={-90} a2={-60} color={C.highlight} />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <g className="blf2-upper">
        <StandTorso />
        <StandArms />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Flex. Lateral c/Balón</text>
    </svg>
  );
}

// ─── 6. Band Hip Abduction ────────────────────────────────────────────────────
export function AnimBandHipAbduction() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bha2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(28deg)} }
        .bha2-leg { animation:bha2 2.5s ease-in-out infinite; transform-origin:116px 112px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={116} cy={112} r={52} a1={88} a2={116} color={C.highlight} />
      <Ground />
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <Band x1="82" y1="152" x2="118" y2="152" />
      <g className="bha2-leg">
        <line x1="116" y1="112" x2="118" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="118" cy="148" r="8" fill={C.highlight} />
        <line x1="118" y1="148" x2="118" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      </g>
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <StandTorso />
      <StandArms />
      <NeckFace />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Abd. Cadera c/Banda</text>
    </svg>
  );
}

// ─── 7. Band Pull Apart ───────────────────────────────────────────────────────
export function AnimBandPullApart() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bpa2 { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.3)} }
        .bpa2-arms { animation:bpa2 2.2s ease-in-out infinite; transform-origin:100px 78px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <StandTorso />
      <g className="bpa2-arms">
        <line x1="74" y1="68" x2="38" y2="78" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="126" y1="68" x2="162" y2="78" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <circle cx="36" cy="78" r="7" fill={C.skin} />
        <circle cx="164" cy="78" r="7" fill={C.skin} />
        <line x1="38" y1="78" x2="162" y2="78" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="56" r="10" fill={C.highlight} opacity="0.3" />
      <NeckFace />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Apertura Pectoral c/Banda</text>
    </svg>
  );
}

// ─── 8. Band Glute Kickback ───────────────────────────────────────────────────
export function AnimBandGluteKickback() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bgk2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-45deg)} }
        .bgk2-leg { animation:bgk2 2.5s ease-in-out infinite; transform-origin:116px 112px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={116} cy={112} r={50} a1={90} a2={48} color={C.highlight} />
      <Ground />
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="177" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <Band x1="82" y1="152" x2="118" y2="152" />
      <g className="bgk2-leg">
        <line x1="116" y1="112" x2="118" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="118" cy="148" r="8" fill={C.highlight} />
        <line x1="118" y1="148" x2="118" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      </g>
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <StandTorso />
      <StandArms />
      <NeckFace />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Kickback Glúteo c/Banda</text>
    </svg>
  );
}

// ─── 9. Band Shoulder Rotation ────────────────────────────────────────────────
export function AnimBandShoulderRotation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bsr2 { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        .bsr2-fore { animation:bsr2 2.2s ease-in-out infinite; transform-origin:142px 88px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={142} cy={88} r={34} a1={-110} a2={20} color={C.highlight} />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <StandTorso />
      <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="56" cy="122" r="7" fill={C.skin} />
      <line x1="126" y1="58" x2="142" y2="88" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <Band x1="56" y1="100" x2="142" y2="88" />
      <g className="bsr2-fore">
        <line x1="142" y1="88" x2="170" y2="86" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="172" cy="86" r="7" fill={C.skin} />
      </g>
      <NeckFace />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Rotación Hombro c/Banda</text>
    </svg>
  );
}

// ─── 10. Band Calf Raise ──────────────────────────────────────────────────────
export function AnimBandCalfRaise() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bcr2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        .bcr2-body { animation:bcr2 2s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ground />
      <g className="bcr2-body">
        <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
        <line x1="82" y1="148" x2="82" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <circle cx="82" cy="148" r="8" fill={C.pants} />
        <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
        <line x1="116" y1="112" x2="118" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
        <line x1="118" y1="148" x2="118" y2="177" stroke={C.highlight} strokeWidth="13" strokeLinecap="round" />
        <circle cx="118" cy="148" r="8" fill={C.pants} />
        <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
        <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
        <StandTorso />
        <line x1="74" y1="68" x2="50" y2="80" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="126" y1="68" x2="150" y2="80" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <Band x1="50" y1="80" x2="150" y2="80" />
        <circle cx="50" cy="80" r="6" fill={C.skin} />
        <circle cx="150" cy="80" r="6" fill={C.skin} />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Elevación Talones c/Banda</text>
    </svg>
  );
}

// ─── 11. Dumbbell Bicep Curl ──────────────────────────────────────────────────
export function AnimDumbbellBicepCurl() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes dbc2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-110deg)} }
        .dbc2-fore { animation:dbc2 2s ease-in-out infinite; transform-origin:142px 90px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={142} cy={90} r={34} a1={80} a2={-30} color={C.highlight} />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <StandTorso />
      <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="56" cy="122" r="7" fill={C.skin} />
      <DB x={56} y={130} />
      <line x1="126" y1="58" x2="142" y2="90" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <rect x="134" y="62" width="12" height="26" rx="6" fill={C.highlight} opacity="0.4" />
      <g className="dbc2-fore">
        <line x1="142" y1="90" x2="144" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="144" cy="121" r="7" fill={C.skin} />
        <DB x={144} y={132} />
      </g>
      <NeckFace />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Curl Bícep c/Mancuerna</text>
    </svg>
  );
}

// ─── 12. Dumbbell Bent Row ────────────────────────────────────────────────────
export function AnimDumbbellBentRow() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes dbr2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
        .dbr2-arm { animation:dbr2 2.2s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      {/* Bent forward torso */}
      <path d="M74,62 L68,106 L100,106 L100,62 Q87,57 74,62Z" fill={C.shirt} transform="rotate(40 82 90)" />
      <circle cx="55" cy="52" r="13" fill={C.skin} />
      <ellipse cx="55" cy="45" rx="12" ry="8" fill={C.hair} />
      <circle cx="50" cy="50" r="2" fill="#1C1C1E" />
      <circle cx="60" cy="50" r="2" fill="#1C1C1E" />
      {/* Static support arm */}
      <line x1="68" y1="82" x2="55" y2="110" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="55" cy="113" r="6" fill={C.skin} />
      {/* Pulling arm animated */}
      <g className="dbr2-arm">
        <line x1="112" y1="82" x2="132" y2="112" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="132" cy="115" r="6" fill={C.skin} />
        <DB x={132} y={126} />
      </g>
      <rect x="80" y="66" width="40" height="14" rx="6" fill={C.highlight} opacity="0.3" />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Remo c/Mancuerna</text>
    </svg>
  );
}

// ─── 13. Romanian Deadlift ────────────────────────────────────────────────────
export function AnimRomanianDeadlift() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes rdl2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(48deg)} }
        .rdl2-upper { animation:rdl2 3s ease-in-out infinite; transform-origin:100px 105px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <rect x="77" y="88" width="46" height="18" rx="6" fill={C.highlight} opacity="0.25" />
      <g className="rdl2-upper">
        <StandTorso />
        <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="58" y1="93" x2="60" y2="120" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="60" cy="123" r="7" fill={C.skin} />
        <DB x={60} y={135} />
        <line x1="126" y1="58" x2="142" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="142" y1="93" x2="140" y2="120" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="140" cy="123" r="7" fill={C.skin} />
        <DB x={140} y={135} />
        <rect x="95" y="43" width="10" height="9" rx="3" fill={C.skin} />
        <Face x={100} y={25} />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Peso Muerto Rumano</text>
    </svg>
  );
}

// ─── 14. Tricep Extension ─────────────────────────────────────────────────────
export function AnimTricepExtension() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes te2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(90deg)} }
        .te2-fore { animation:te2 2s ease-in-out infinite; transform-origin:126px 40px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Arc cx={126} cy={40} r={32} a1={-90} a2={0} color={C.highlight} />
      <Ground />
      <StandLegs />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <StandTorso />
      <line x1="74" y1="58" x2="58" y2="93" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <line x1="58" y1="93" x2="56" y2="118" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="56" cy="122" r="7" fill={C.skin} />
      <line x1="126" y1="56" x2="126" y2="40" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <rect x="118" y="42" width="12" height="22" rx="6" fill={C.highlight} opacity="0.4" />
      <g className="te2-fore">
        <line x1="126" y1="40" x2="126" y2="68" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
        <circle cx="126" cy="71" r="7" fill={C.skin} />
        <DB x={126} y={82} />
      </g>
      <NeckFace />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Extensión Tríceps</text>
    </svg>
  );
}

// ─── 15. Goblet Squat ─────────────────────────────────────────────────────────
export function AnimGobletSquat() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes gs2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(26px)} }
        .gs2-body { animation:gs2 2.8s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ground />
      <ellipse cx="82" cy="180" rx="14" ry="6" fill={C.shoes} />
      <ellipse cx="118" cy="180" rx="14" ry="6" fill={C.shoes} />
      <g className="gs2-body">
        <line x1="84" y1="112" x2="78" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="78" cy="148" r="8" fill={C.highlight} />
        <line x1="78" y1="148" x2="82" y2="172" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <line x1="116" y1="112" x2="122" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="122" cy="148" r="8" fill={C.highlight} />
        <line x1="122" y1="148" x2="118" y2="172" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
        <StandTorso />
        <line x1="74" y1="66" x2="80" y2="84" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <line x1="126" y1="66" x2="120" y2="84" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <rect x="88" y="83" width="24" height="16" rx="7" fill={C.equipment} />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Sentadilla Goblet</text>
    </svg>
  );
}

// ─── 16. Plank ────────────────────────────────────────────────────────────────
export function AnimPlank() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes plank2 { 0%,100%{opacity:0.35} 50%{opacity:0.9} }
        .plank2-core { animation:plank2 2s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="185" cy="100" r="13" fill={C.skin} />
      <ellipse cx="185" cy="93" rx="12" ry="8" fill={C.hair} />
      <circle cx="180" cy="98" r="2" fill="#1C1C1E" />
      <circle cx="190" cy="98" r="2" fill="#1C1C1E" />
      <line x1="172" y1="104" x2="60" y2="118" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <rect className="plank2-core" x="100" y="110" width="50" height="12" rx="6" fill={C.highlight} />
      <line x1="60" y1="118" x2="35" y2="118" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <ellipse cx="30" cy="118" rx="12" ry="6" fill={C.skin} />
      <line x1="172" y1="118" x2="172" y2="150" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <line x1="185" y1="118" x2="185" y2="150" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <ellipse cx="172" cy="152" rx="12" ry="5" fill={C.shoes} />
      <ellipse cx="185" cy="152" rx="12" ry="5" fill={C.shoes} />
      <text x="110" y="158" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Plancha Abdominal</text>
    </svg>
  );
}

// ─── 17. Lunge ────────────────────────────────────────────────────────────────
export function AnimLunge() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes lunge2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(22px)} }
        .lunge2-body { animation:lunge2 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Ground />
      <ellipse cx="140" cy="183" rx="14" ry="6" fill={C.shoes} />
      <g className="lunge2-body">
        <line x1="116" y1="112" x2="140" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <line x1="140" y1="148" x2="140" y2="176" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <circle cx="140" cy="148" r="8" fill={C.highlight} />
        <line x1="84" y1="112" x2="80" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
        <line x1="80" y1="148" x2="82" y2="176" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <circle cx="80" cy="148" r="8" fill={C.pants} />
        <ellipse cx="82" cy="179" rx="14" ry="6" fill={C.shoes} />
        <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
        <StandTorso />
        <StandArms />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Zancada (Lunge)</text>
    </svg>
  );
}

// ─── 18. Glute Bridge ─────────────────────────────────────────────────────────
export function AnimGluteBridge() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes glb2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-24px)} }
        .glb2-hips { animation:glb2 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="160" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="20" cy="110" r="13" fill={C.skin} />
      <ellipse cx="20" cy="103" rx="12" ry="8" fill={C.hair} />
      <circle cx="15" cy="108" r="2" fill="#1C1C1E" />
      <circle cx="25" cy="108" r="2" fill="#1C1C1E" />
      <line x1="33" y1="110" x2="75" y2="110" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <line x1="40" y1="118" x2="40" y2="140" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <line x1="58" y1="118" x2="58" y2="140" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <g className="glb2-hips">
        <rect x="75" y="103" width="38" height="16" rx="7" fill={C.highlight} />
        <text x="94" y="115" textAnchor="middle" fontSize="7" fontWeight="800" fill="white">GLÚTEO</text>
        <line x1="80" y1="113" x2="80" y2="136" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="80" y1="136" x2="95" y2="136" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <line x1="108" y1="113" x2="108" y2="136" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="108" y1="136" x2="122" y2="136" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="97" cy="136" rx="10" ry="5" fill={C.shoes} />
        <ellipse cx="124" cy="136" rx="10" ry="5" fill={C.shoes} />
      </g>
      <text x="110" y="157" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Puente de Glúteos</text>
    </svg>
  );
}

// ─── 19. Dead Bug ─────────────────────────────────────────────────────────────
export function AnimDeadBug() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes db2_a { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-40deg)} 75%{transform:rotate(40deg)} }
        .db2-rarm { animation:db2_a 3s ease-in-out infinite; transform-origin:88px 92px; }
        .db2-lleg { animation:db2_a 3s ease-in-out infinite reverse; transform-origin:132px 110px; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Mat />
      <circle cx="22" cy="96" r="13" fill={C.skin} />
      <ellipse cx="22" cy="89" rx="12" ry="8" fill={C.hair} />
      <circle cx="17" cy="94" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="94" r="2" fill="#1C1C1E" />
      <line x1="35" y1="96" x2="75" y2="96" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <rect x="66" y="89" width="52" height="14" rx="6" fill={C.highlight} opacity="0.3" />
      <line x1="56" y1="89" x2="42" y2="62" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
      <circle cx="40" cy="59" r="7" fill={C.skin} />
      <g className="db2-rarm">
        <line x1="88" y1="92" x2="74" y2="62" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
        <circle cx="72" cy="59" r="7" fill={C.skin} />
      </g>
      <rect x="113" y="91" width="46" height="18" rx="8" fill={C.pants} />
      <line x1="148" y1="100" x2="148" y2="132" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <line x1="148" y1="132" x2="168" y2="132" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
      <ellipse cx="170" cy="132" rx="10" ry="5" fill={C.shoes} />
      <g className="db2-lleg">
        <line x1="132" y1="110" x2="132" y2="142" stroke={C.highlight} strokeWidth="14" strokeLinecap="round" />
        <line x1="132" y1="142" x2="110" y2="142" stroke={C.highlight} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="108" cy="142" rx="10" ry="5" fill={C.shoes} />
      </g>
      <text x="110" y="166" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Dead Bug</text>
    </svg>
  );
}

// ─── 20. Wall Sit ─────────────────────────────────────────────────────────────
export function AnimWallSit() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes ws2 { 0%,100%{opacity:0.3} 50%{opacity:0.75} }
        .ws2-quads { animation:ws2 2s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <rect x="155" y="10" width="16" height="170" rx="4" fill="#CBD5E1" />
      <rect x="20" y="175" width="145" height="10" rx="4" fill={C.ground} />
      <rect className="ws2-quads" x="82" y="110" width="52" height="28" rx="8" fill={C.highlight} />
      <line x1="84" y1="138" x2="82" y2="175" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <line x1="116" y1="138" x2="118" y2="175" stroke={C.pants} strokeWidth="15" strokeLinecap="round" />
      <circle cx="118" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="178" rx="14" ry="6" fill={C.shoes} />
      <ellipse cx="118" cy="178" rx="14" ry="6" fill={C.shoes} />
      <path d="M76,60 L74,112 L126,112 L124,60 Q113,55 100,55 Q87,55 76,60Z" fill={C.shirt} />
      <rect x="74" y="108" width="52" height="12" rx="6" fill={C.pants} />
      <line x1="76" y1="80" x2="82" y2="118" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
      <circle cx="82" cy="120" r="6" fill={C.skin} />
      <line x1="124" y1="80" x2="118" y2="118" stroke={C.skin} strokeWidth="11" strokeLinecap="round" />
      <circle cx="118" cy="120" r="6" fill={C.skin} />
      <rect x="95" y="50" width="10" height="9" rx="3" fill={C.skin} />
      <Face x={100} y={33} />
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Sentadilla en Pared</text>
    </svg>
  );
}

// ─── 21–25. BOSU exercises ────────────────────────────────────────────────────
export function AnimBosuBalance() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bosu2_bal { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        .bosu2-body { animation:bosu2_bal 2.5s ease-in-out infinite; transform-origin:100px 155px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Bosu />
      <g className="bosu2-body">
        <StandLegs />
        <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
        <StandTorso />
        <StandArms />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Equilibrio BOSU</text>
    </svg>
  );
}

export function AnimBosuSquat() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bsq2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(22px)} }
        .bsq2-body { animation:bsq2 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Bosu />
      <ellipse cx="82" cy="162" rx="14" ry="5" fill={C.shoes} />
      <ellipse cx="118" cy="162" rx="14" ry="5" fill={C.shoes} />
      <g className="bsq2-body">
        <line x1="84" y1="112" x2="78" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="78" cy="148" r="8" fill={C.highlight} />
        <line x1="78" y1="148" x2="82" y2="157" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <line x1="116" y1="112" x2="122" y2="148" stroke={C.highlight} strokeWidth="16" strokeLinecap="round" />
        <circle cx="122" cy="148" r="8" fill={C.highlight} />
        <line x1="122" y1="148" x2="118" y2="157" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
        <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
        <StandTorso />
        <StandArms />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Sentadilla BOSU</text>
    </svg>
  );
}

export function AnimBosuPushUp() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes bpu4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .bpu4-upper { animation:bpu4 2s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Bosu cx={75} y={148} />
      <g className="bpu4-upper">
        <circle cx="185" cy="96" r="13" fill={C.skin} />
        <ellipse cx="185" cy="89" rx="12" ry="8" fill={C.hair} />
        <circle cx="180" cy="94" r="2" fill="#1C1C1E" />
        <circle cx="190" cy="94" r="2" fill="#1C1C1E" />
        <line x1="172" y1="100" x2="80" y2="122" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
        <line x1="80" y1="122" x2="55" y2="130" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="50" cy="130" rx="10" ry="5" fill={C.skin} />
        <line x1="155" y1="110" x2="158" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <line x1="170" y1="107" x2="173" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="158" cy="150" rx="12" ry="5" fill={C.shoes} />
        <ellipse cx="173" cy="150" rx="12" ry="5" fill={C.shoes} />
      </g>
      <text x="110" y="165" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Push-Up BOSU</text>
    </svg>
  );
}

export function AnimBosuHipHinge() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bhh2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(42deg)} }
        .bhh2-upper { animation:bhh2 3s ease-in-out infinite; transform-origin:100px 105px; }
      `}</style>
      <rect width="200" height="200" fill={C.bg} rx="12" />
      <Bosu />
      <line x1="84" y1="112" x2="82" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="82" y1="148" x2="82" y2="170" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="82" cy="148" r="8" fill={C.pants} />
      <ellipse cx="82" cy="172" rx="14" ry="5" fill={C.shoes} />
      <line x1="116" y1="112" x2="118" y2="148" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <line x1="118" y1="148" x2="118" y2="170" stroke={C.pants} strokeWidth="13" strokeLinecap="round" />
      <circle cx="118" cy="148" r="8" fill={C.pants} />
      <ellipse cx="118" cy="172" rx="14" ry="5" fill={C.shoes} />
      <rect x="74" y="104" width="52" height="12" rx="6" fill={C.pants} />
      <g className="bhh2-upper">
        <StandTorso />
        <StandArms />
        <NeckFace />
      </g>
      <text x="100" y="197" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Hip Hinge BOSU</text>
    </svg>
  );
}

export function AnimBosuPlank() {
  return (
    <svg viewBox="0 0 220 170" className="w-full h-full">
      <style>{`
        @keyframes bpl2 { 0%,100%{opacity:0.3} 50%{opacity:0.85} }
        .bpl2-core { animation:bpl2 2s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="170" fill={C.bg} rx="12" />
      <Bosu cx={75} y={145} />
      <circle cx="185" cy="102" r="13" fill={C.skin} />
      <ellipse cx="185" cy="95" rx="12" ry="8" fill={C.hair} />
      <circle cx="180" cy="100" r="2" fill="#1C1C1E" />
      <circle cx="190" cy="100" r="2" fill="#1C1C1E" />
      <line x1="172" y1="106" x2="72" y2="120" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <rect className="bpl2-core" x="100" y="112" width="50" height="12" rx="6" fill={C.highlight} />
      <line x1="72" y1="120" x2="48" y2="125" stroke={C.skin} strokeWidth="12" strokeLinecap="round" />
      <ellipse cx="44" cy="125" rx="10" ry="5" fill={C.skin} />
      <line x1="175" y1="118" x2="175" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <line x1="188" y1="115" x2="188" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
      <ellipse cx="175" cy="150" rx="12" ry="5" fill={C.shoes} />
      <ellipse cx="188" cy="150" rx="12" ry="5" fill={C.shoes} />
      <text x="110" y="165" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Plancha BOSU</text>
    </svg>
  );
}
