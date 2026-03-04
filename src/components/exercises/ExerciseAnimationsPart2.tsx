"use client";

/**
 * ExerciseAnimations — Part 2
 * ─────────────────────────────────────────────────────────────────────────────
 * 🟡 PELOTA TERAPÉUTICA (5 exercises)
 * 🔴 LIGAS / BANDAS (5 exercises)
 * 🔵 MANCUERNAS / PESAS (5 exercises)
 * 🟢 PESO CORPORAL (5 exercises)
 * 🟠 BOSU / FITBALL (5 exercises)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PilatesBall, ExerciseMat, ResistanceBand, Dumbbell, StepBox, FoamRoller } from "./Equipment";

// ══════════════════════════════════════════════════════════════════════════════
// 🟡 PELOTA TERAPÉUTICA
// ══════════════════════════════════════════════════════════════════════════════

/** Ball Bridge — glúteos + core */
export function AnimBallBridge() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes bridgeUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        .bridge-hips { animation: bridgeUp 2.2s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={110} y={148} width={210} height={10} />
      <PilatesBall cx={155} cy={120} r={22} />
      {/* Lying body */}
      <rect x="18" y="92" width="82" height="20" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="12" cy="102" r="12" fill="#232d4a" />
      {/* Arms on floor */}
      <rect x="30" y="108" width="30" height="8" rx="4" fill="#232d4a" opacity="0.6" />
      <rect x="56" y="108" width="30" height="8" rx="4" fill="#232d4a" opacity="0.6" />
      {/* Hips elevating */}
      <g className="bridge-hips">
        <rect x="96" y="82" width="28" height="22" rx="8" fill="#3362ff" opacity="0.9" />
        {/* Thighs on ball */}
        <rect x="120" y="90" width="38" height="14" rx="6" fill="#232d4a" />
        {/* Calves on ball */}
        <rect x="154" y="96" width="30" height="12" rx="5" fill="#232d4a" />
      </g>
      {/* Hip highlight */}
      <circle cx="110" cy="96" r="14" fill="#f59e0b" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <text x="110" y="157" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Ball Bridge — Glutes + Core</text>
    </svg>
  );
}

/** Ball Hamstring Curl — isquiotibiales */
export function AnimBallHamstringCurl() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes curl { 0%,100%{transform:translateX(0) rotate(0)} 50%{transform:translateX(-30px) rotate(-25deg)} }
        .curl-legs { animation: curl 2s ease-in-out infinite; transform-origin: 120px 110px; }
      `}</style>
      <ExerciseMat x={110} y={148} width={210} height={10} />
      {/* Body lying */}
      <rect x="18" y="90" width="80" height="20" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="12" cy="100" r="12" fill="#232d4a" />
      <rect x="94" y="88" width="24" height="22" rx="8" fill="#3362ff" opacity="0.8" />
      {/* Arms on floor */}
      <rect x="30" y="106" width="60" height="8" rx="4" fill="#232d4a" opacity="0.6" />
      {/* Legs with ball */}
      <g className="curl-legs">
        <rect x="116" y="92" width="52" height="14" rx="6" fill="#232d4a" />
        <PilatesBall cx={185} cy={104} r={18} />
      </g>
      <text x="110" y="157" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Ball Hamstring Curl</text>
    </svg>
  );
}

/** Ball Push-Up — pectorales + estabilización */
export function AnimBallPushUp() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <style>{`
        @keyframes pushUp { 0%,100%{transform:translateY(8px)} 50%{transform:translateY(-8px)} }
        .pushup-body { animation: pushUp 1.8s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={110} y={168} width={210} height={10} />
      <PilatesBall cx={110} cy={135} r={26} />
      <g className="pushup-body">
        {/* Head */}
        <circle cx="28" cy="90" r="12" fill="#232d4a" />
        {/* Torso prone */}
        <rect x="38" y="84" width="80" height="18" rx="8" fill="#232d4a" opacity="0.9" />
        {/* Arms on ball */}
        <rect x="82" y="96" width="14" height="26" rx="6" fill="#232d4a" />
        <rect x="104" y="96" width="14" height="26" rx="6" fill="#232d4a" />
        {/* Legs extended */}
        <rect x="116" y="84" width="60" height="14" rx="6" fill="#232d4a" />
        <ellipse cx="180" cy="91" rx="12" ry="6" fill="#232d4a" />
      </g>
      <text x="110" y="176" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Ball Push-Up (Unstable)</text>
    </svg>
  );
}

/** Ball Lumbar Extension — columna lumbar */
export function AnimBallLumbarExtension() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <style>{`
        @keyframes lumbarExt { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-22deg)} }
        .lumbar-ext { animation: lumbarExt 2.8s ease-in-out infinite; transform-origin: 92px 112px; }
      `}</style>
      <ExerciseMat x={110} y={170} width={210} height={10} />
      <PilatesBall cx={110} cy={128} r={30} />
      <g className="lumbar-ext">
        {/* Upper body draping over ball */}
        <rect x="40" y="95" width="56" height="20" rx="8" fill="#232d4a" opacity="0.9" />
        <circle cx="32" cy="105" r="12" fill="#232d4a" />
        {/* Arms crossed on chest */}
        <rect x="44" y="108" width="28" height="8" rx="4" fill="#364060" />
      </g>
      {/* Lower body static */}
      <rect x="136" y="110" width="50" height="16" rx="7" fill="#232d4a" />
      <rect x="138" y="124" width="16" height="36" rx="7" fill="#232d4a" />
      <rect x="156" y="124" width="16" height="36" rx="7" fill="#232d4a" />
      <ellipse cx="146" cy="162" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="164" cy="162" rx="11" ry="5" fill="#232d4a" />
      <text x="110" y="178" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Ball Lumbar Extension</text>
    </svg>
  );
}

/** Ball Lateral Flexion — flexión lateral */
export function AnimBallLateralFlex() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <style>{`
        @keyframes lateralFlex { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-28deg)} }
        .lat-flex { animation: lateralFlex 3s ease-in-out infinite; transform-origin: 110px 115px; }
      `}</style>
      <ExerciseMat x={110} y={170} width={210} height={10} />
      <PilatesBall cx={110} cy={132} r={28} />
      <g className="lat-flex">
        <rect x="82" y="70" width="56" height="18" rx="8" fill="#232d4a" opacity="0.9" />
        <circle cx="110" cy="58" r="12" fill="#232d4a" />
        <rect x="50" y="78" width="38" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="132" y="78" width="38" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="84" y="86" width="50" height="28" rx="8" fill="#3362ff" opacity="0.8" />
      </g>
      <rect x="80" y="134" width="18" height="32" rx="8" fill="#232d4a" />
      <rect x="122" y="134" width="18" height="32" rx="8" fill="#232d4a" />
      <text x="110" y="178" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Ball Lateral Flexion</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 🔴 LIGAS / BANDAS ELÁSTICAS
// ══════════════════════════════════════════════════════════════════════════════

/** Band Hip Abduction — abductores de cadera */
export function AnimBandHipAbduction() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes abduct { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(28deg)} }
        .abduct-leg { animation: abduct 2.2s ease-in-out infinite; transform-origin: 80px 150px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={12} />
      {/* Standing on left leg */}
      <circle cx="100" cy="36" r="14" fill="#232d4a" />
      <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
      <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="56" y="70" width="22" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      <rect x="122" y="70" width="22" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      {/* Support leg */}
      <rect x="78" y="116" width="16" height="72" rx="7" fill="#232d4a" />
      <ellipse cx="86" cy="191" rx="11" ry="5" fill="#232d4a" />
      {/* Abducting leg */}
      <g className="abduct-leg">
        <rect x="106" y="116" width="16" height="70" rx="7" fill="#3362ff" opacity="0.85" />
        <ellipse cx="114" cy="188" rx="11" ry="5" fill="#3362ff" opacity="0.85" />
      </g>
      {/* Band around ankles */}
      <line x1="87" y1="178" x2="110" y2="178" stroke="#ef4444" strokeWidth="5" strokeLinecap="round">
        <animate attributeName="x2" values="110;130;110" dur="2.2s" repeatCount="indefinite" />
      </line>
      <text x="100" y="214" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Band Hip Abduction</text>
    </svg>
  );
}

/** Band Pull Apart — retractores escapulares */
export function AnimBandPullApart() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes pullApart { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.5)} }
        .pull-arms { animation: pullApart 2s ease-in-out infinite; transform-origin: 100px 88px; }
      `}</style>
      <ExerciseMat x={100} y={188} width={180} height={10} />
      <circle cx="100" cy="36" r="14" fill="#232d4a" />
      <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
      <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="80" y="116" width="16" height="62" rx="7" fill="#232d4a" />
      <rect x="104" y="116" width="16" height="62" rx="7" fill="#232d4a" />
      <ellipse cx="88"  cy="181" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="112" cy="181" rx="11" ry="5" fill="#232d4a" />
      {/* Arms holding band */}
      <g className="pull-arms">
        <rect x="38" y="82" width="36" height="12" rx="5" fill="#232d4a" />
        <rect x="126" y="82" width="36" height="12" rx="5" fill="#232d4a" />
        {/* Band */}
        <rect x="73" y="83" width="54" height="10" rx="4" fill="#ef4444" opacity="0.85" />
        <ellipse cx="73"  cy="88" rx="8" ry="7" fill="#364060" />
        <ellipse cx="127" cy="88" rx="8" ry="7" fill="#364060" />
      </g>
      {/* Scapula highlight */}
      <rect x="78" y="60" width="44" height="28" rx="8" fill="#10b981" opacity="0.2">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x="100" y="196" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Band Pull Apart — Scapular</text>
    </svg>
  );
}

/** Band Glute Kickback */
export function AnimBandGluteKickback() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes kickback { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-50deg)} }
        .kick-leg { animation: kickback 2s ease-in-out infinite; transform-origin: 125px 90px; }
      `}</style>
      <ExerciseMat x={110} y={148} width={210} height={10} />
      {/* Quadruped */}
      <circle cx="28" cy="72" r="12" fill="#232d4a" />
      <rect x="38" y="66" width="8" height="8" rx="2" fill="#232d4a" />
      <rect x="44" y="56" width="84" height="22" rx="9" fill="#232d4a" opacity="0.9" />
      <rect x="40" y="78" width="12" height="30" rx="5" fill="#232d4a" />
      <rect x="68" y="78" width="12" height="30" rx="5" fill="#232d4a" />
      <ellipse cx="46" cy="111" rx="8" ry="5" fill="#232d4a" />
      <ellipse cx="74" cy="111" rx="8" ry="5" fill="#232d4a" />
      {/* Support leg */}
      <rect x="96" y="78" width="12" height="30" rx="5" fill="#232d4a" />
      <ellipse cx="102" cy="111" rx="8" ry="5" fill="#232d4a" />
      {/* Kicking leg */}
      <g className="kick-leg">
        <rect x="119" y="72" width="38" height="12" rx="5" fill="#3362ff" opacity="0.85" />
        <circle cx="160" cy="78" r="6" fill="#f59e0b" />
        <rect x="162" y="72" width="8" height="22" rx="4" fill="#3362ff" opacity="0.85" />
      </g>
      {/* Band from ankle to wall */}
      <line x1="36" y1="116" x2="122" y2="88" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 2" />
      <rect x="28" y="105" width="10" height="22" rx="3" fill="#ef4444" opacity="0.6" />
      <text x="110" y="156" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Band Glute Kickback</text>
    </svg>
  );
}

/** Band Shoulder External Rotation (seated) */
export function AnimBandShoulderRotation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bandRotOut { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-55deg)} }
        .band-arm { animation: bandRotOut 2.2s ease-in-out infinite; transform-origin: 88px 110px; }
      `}</style>
      {/* Chair */}
      <rect x="68" y="105" width="78" height="8" rx="3" fill="#9ba5be" opacity="0.4" />
      <rect x="68" y="113" width="6" height="55" rx="3" fill="#9ba5be" opacity="0.3" />
      <rect x="140" y="113" width="6" height="55" rx="3" fill="#9ba5be" opacity="0.3" />
      <rect x="58" y="95" width="6" height="75" rx="3" fill="#9ba5be" opacity="0.3" />
      {/* Figure seated */}
      <circle cx="107" cy="38" r="13" fill="#232d4a" />
      <rect x="100" y="51" width="14" height="10" rx="3" fill="#232d4a" />
      <rect x="80" y="60" width="54" height="50" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="78" y="106" width="60" height="16" rx="7" fill="#232d4a" />
      <rect x="80" y="118" width="16" height="40" rx="7" fill="#232d4a" />
      <rect x="104" y="118" width="16" height="40" rx="7" fill="#232d4a" />
      {/* Static arm */}
      <rect x="138" y="74" width="12" height="28" rx="5" fill="#232d4a" />
      <rect x="138" y="100" width="12" height="22" rx="5" fill="#364060" />
      {/* Rotating arm with band */}
      <g className="band-arm">
        <rect x="80" y="100" width="12" height="24" rx="5" fill="#3362ff" opacity="0.85" />
        <ellipse cx="86" cy="127" rx="8" ry="6" fill="#364060" />
      </g>
      {/* Band between hands */}
      <line x1="88" y1="125" x2="142" y2="112" stroke="#ef4444" strokeWidth="4" strokeLinecap="round">
        <animate attributeName="x1" values="88;96;88" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="y1" values="125;108;125" dur="2.2s" repeatCount="indefinite" />
      </line>
      <text x="107" y="192" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Band Shoulder Rotation</text>
    </svg>
  );
}

/** Band Calf Raise */
export function AnimBandCalfRaise() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes calfRaise { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes bandTighten { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.7)} }
        .calf-body  { animation: calfRaise   1.8s ease-in-out infinite; }
        .band-tight { animation: bandTighten 1.8s ease-in-out infinite; transform-origin: 100px 175px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      {/* Band anchored under foot */}
      <g className="band-tight">
        <ellipse cx="90"  cy="196" rx="10" ry="4" fill="#ef4444" opacity="0.7" />
        <ellipse cx="110" cy="196" rx="10" ry="4" fill="#ef4444" opacity="0.7" />
        <line x1="90" y1="192" x2="90"  y2="145" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <line x1="110" y1="192" x2="110" y2="145" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="calf-body">
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
        <rect x="56" y="72" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="124" y="72" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="80" y="116" width="16" height="40" rx="7" fill="#232d4a" />
        <rect x="104" y="116" width="16" height="40" rx="7" fill="#232d4a" />
        <circle cx="88"  cy="158" r="7" fill="#8b5cf6" />
        <circle cx="112" cy="158" r="7" fill="#8b5cf6" />
        {/* Raised calves */}
        <rect x="81"  y="163" width="14" height="26" rx="6" fill="#232d4a" />
        <rect x="105" y="163" width="14" height="26" rx="6" fill="#232d4a" />
        <ellipse cx="88"  cy="192" rx="11" ry="5" fill="#232d4a" />
        <ellipse cx="112" cy="192" rx="11" ry="5" fill="#232d4a" />
      </g>
      <text x="100" y="214" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Band Calf Raise</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 🔵 MANCUERNAS / PESAS
// ══════════════════════════════════════════════════════════════════════════════

/** Dumbbell Bicep Curl */
export function AnimDumbbellBicepCurl() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes curlUp { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-110deg)} }
        @keyframes curlUpR { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(110deg)} }
        .curl-l { animation: curlUp  1.8s ease-in-out infinite; transform-origin: 72px 100px; }
        .curl-r { animation: curlUpR 1.8s ease-in-out infinite; transform-origin: 128px 100px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      <circle cx="100" cy="36" r="14" fill="#232d4a" />
      <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
      <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="80" y="116" width="16" height="44" rx="7" fill="#232d4a" />
      <rect x="104" y="116" width="16" height="44" rx="7" fill="#232d4a" />
      <ellipse cx="88"  cy="163" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="112" cy="163" rx="11" ry="5" fill="#232d4a" />
      {/* Upper arms static */}
      <rect x="58" y="64" width="13" height="30" rx="5" fill="#232d4a" />
      <rect x="129" y="64" width="13" height="30" rx="5" fill="#232d4a" />
      {/* Curling forearms */}
      <g className="curl-l">
        <rect x="58" y="93" width="13" height="28" rx="5" fill="#3362ff" opacity="0.9" />
        <Dumbbell x={64} y={126} angle={0} weight="medium" />
      </g>
      <g className="curl-r">
        <rect x="129" y="93" width="13" height="28" rx="5" fill="#3362ff" opacity="0.9" />
        <Dumbbell x={136} y={126} angle={0} weight="medium" />
      </g>
      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Dumbbell Bicep Curl</text>
    </svg>
  );
}

/** Dumbbell Bent-Over Row */
export function AnimDumbbellBentRow() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes bentRow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        .bent-arms { animation: bentRow 2s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={100} y={188} width={180} height={10} />
      {/* Hinged figure */}
      <circle cx="50" cy="58" r="13" fill="#232d4a" />
      <rect x="61" y="68" width="66" height="20" rx="9" fill="#232d4a" opacity="0.9" />
      <rect x="62" y="86" width="16" height="42" rx="7" fill="#232d4a" transform="rotate(-15,70,86)" />
      <rect x="90" y="86" width="16" height="42" rx="7" fill="#232d4a" transform="rotate(-15,98,86)" />
      <ellipse cx="70"  cy="130" rx="11" ry="5" fill="#232d4a" transform="rotate(-15,70,130)" />
      <ellipse cx="98"  cy="130" rx="11" ry="5" fill="#232d4a" transform="rotate(-15,98,130)" />
      {/* Rowing arms */}
      <g className="bent-arms">
        <rect x="102" y="76" width="12" height="32" rx="5" fill="#3362ff" opacity="0.9" transform="rotate(15,108,80)" />
        <rect x="118" y="76" width="12" height="32" rx="5" fill="#3362ff" opacity="0.9" transform="rotate(15,124,80)" />
        <Dumbbell x={110} y={115} angle={0} weight="medium" />
        <Dumbbell x={130} y={115} angle={0} weight="medium" />
      </g>
      <text x="100" y="196" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Dumbbell Bent-Over Row</text>
    </svg>
  );
}

/** Dumbbell Romanian Deadlift */
export function AnimRomanianDeadlift() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes rdl { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(48deg)} }
        .rdl-hinge { animation: rdl 2.5s ease-in-out infinite; transform-origin: 100px 115px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      <g className="rdl-hinge">
        <circle cx="100" cy="36" r="13" fill="#232d4a" />
        <rect x="93" y="49" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="58" width="44" height="56" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms hanging with dumbbells */}
        <rect x="66" y="90" width="12" height="38" rx="5" fill="#3362ff" opacity="0.9" />
        <rect x="122" y="90" width="12" height="38" rx="5" fill="#3362ff" opacity="0.9" />
        <Dumbbell x={72}  y={134} angle={0} weight="heavy" />
        <Dumbbell x={128} y={134} angle={0} weight="heavy" />
      </g>
      {/* Legs static */}
      <rect x="82"  y="113" width="16" height="60" rx="7" fill="#232d4a" />
      <rect x="102" y="113" width="16" height="60" rx="7" fill="#232d4a" />
      <ellipse cx="90"  cy="176" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="110" cy="176" rx="11" ry="5" fill="#232d4a" />
      {/* Hamstring highlight */}
      <rect x="82" y="115" width="36" height="55" rx="7" fill="#ef4444" opacity="0.12">
        <animate attributeName="opacity" values="0.08;0.2;0.08" dur="2.5s" repeatCount="indefinite" />
      </rect>
      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Romanian Deadlift</text>
    </svg>
  );
}

/** Dumbbell Tricep Extension */
export function AnimTricepExtension() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes tricep { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(80deg)} }
        .tri-l { animation: tricep 2s ease-in-out infinite; transform-origin: 72px 82px; }
        .tri-r { animation: tricep 2s ease-in-out infinite; transform-origin: 128px 82px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      <circle cx="100" cy="36" r="14" fill="#232d4a" />
      <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
      <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="80" y="116" width="16" height="44" rx="7" fill="#232d4a" />
      <rect x="104" y="116" width="16" height="44" rx="7" fill="#232d4a" />
      <ellipse cx="88" cy="163"  rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="112" cy="163" rx="11" ry="5" fill="#232d4a" />
      {/* Arms overhead static upper */}
      <rect x="60" y="52" width="12" height="28" rx="5" fill="#232d4a" transform="rotate(-20,66,55)" />
      <rect x="128" y="52" width="12" height="28" rx="5" fill="#232d4a" transform="rotate(20,134,55)" />
      {/* Tricep extension forearms */}
      <g className="tri-l">
        <rect x="60" y="78" width="12" height="32" rx="5" fill="#3362ff" opacity="0.9" />
        <Dumbbell x={66} y={115} angle={0} weight="light" />
      </g>
      <g className="tri-r">
        <rect x="128" y="78" width="12" height="32" rx="5" fill="#3362ff" opacity="0.9" />
        <Dumbbell x={134} y={115} angle={0} weight="light" />
      </g>
      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Overhead Tricep Extension</text>
    </svg>
  );
}

/** Dumbbell Goblet Squat */
export function AnimGobletSquat() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes goblet { 0%,100%{transform:translateY(0)} 50%{transform:translateY(32px)} }
        .goblet-body { animation: goblet 2.3s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      <g className="goblet-body">
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="60" width="44" height="52" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms holding dumbbell in front */}
        <rect x="72" y="76" width="18" height="10" rx="4" fill="#232d4a" />
        <rect x="110" y="76" width="18" height="10" rx="4" fill="#232d4a" />
        <Dumbbell x={100} y={80} angle={90} weight="heavy" />
        {/* Legs in squat */}
        <rect x="80" y="110" width="16" height="42" rx="7" fill="#232d4a" />
        <rect x="104" y="110" width="16" height="42" rx="7" fill="#232d4a" />
        <circle cx="88"  cy="154" r="8" fill="#f59e0b" />
        <circle cx="112" cy="154" r="8" fill="#f59e0b" />
        <rect x="81"  y="160" width="14" height="30" rx="6" fill="#232d4a" />
        <rect x="105" y="160" width="14" height="30" rx="6" fill="#232d4a" />
        <ellipse cx="88"  cy="192" rx="11" ry="5" fill="#232d4a" />
        <ellipse cx="112" cy="192" rx="11" ry="5" fill="#232d4a" />
      </g>
      <text x="100" y="214" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Goblet Squat</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 🟢 PESO CORPORAL
// ══════════════════════════════════════════════════════════════════════════════

/** Bodyweight Plank */
export function AnimPlank() {
  return (
    <svg viewBox="0 0 220 140" className="w-full h-full">
      <style>{`
        @keyframes breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06)} }
        .plank-body { animation: breathe 3s ease-in-out infinite; transform-origin: 110px 88px; }
      `}</style>
      <ExerciseMat x={110} y={128} width={210} height={10} />
      <g className="plank-body">
        <circle cx="26" cy="78" r="12" fill="#232d4a" />
        <rect x="36" y="72" width="90" height="18" rx="8" fill="#232d4a" opacity="0.9" />
        {/* Elbows on floor */}
        <rect x="38" y="88" width="14" height="24" rx="5" fill="#232d4a" />
        <rect x="62" y="88" width="14" height="24" rx="5" fill="#232d4a" />
        <ellipse cx="45" cy="114" rx="10" ry="5" fill="#3362ff" opacity="0.7" />
        <ellipse cx="69" cy="114" rx="10" ry="5" fill="#3362ff" opacity="0.7" />
        {/* Legs extended */}
        <rect x="124" y="72" width="60" height="14" rx="6" fill="#232d4a" />
        <rect x="180" y="84" width="14" height="28" rx="6" fill="#232d4a" />
        <ellipse cx="187" cy="114" rx="10" ry="5" fill="#232d4a" />
      </g>
      {/* Core highlight */}
      <rect x="82" y="72" width="46" height="18" rx="6" fill="#f97316" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
      </rect>
      <text x="110" y="136" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Plank — Core Isometric</text>
    </svg>
  );
}

/** Bodyweight Lunge */
export function AnimLunge() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes lungeDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(24px)} }
        .lunge-body { animation: lungeDown 2.2s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      <g className="lunge-body">
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="60" width="44" height="52" rx="10" fill="#232d4a" opacity="0.9" />
        <rect x="56" y="72" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="124" y="72" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        {/* Front leg bent */}
        <rect x="76" y="110" width="16" height="40" rx="7" fill="#3362ff" opacity="0.85" />
        <circle cx="84" cy="152" r="8" fill="#f59e0b" />
        <rect x="76" y="158" width="16" height="28" rx="6" fill="#3362ff" opacity="0.85" />
        <ellipse cx="84" cy="188" rx="11" ry="5" fill="#232d4a" />
        {/* Back leg extending */}
        <rect x="110" y="110" width="16" height="40" rx="7" fill="#232d4a" />
        <circle cx="118" cy="152" r="8" fill="#f59e0b" />
        <rect x="110" y="158" width="16" height="28" rx="6" fill="#232d4a" />
        <ellipse cx="118" cy="188" rx="11" ry="5" fill="#232d4a" />
      </g>
      <text x="100" y="214" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Bodyweight Lunge</text>
    </svg>
  );
}

/** Glute Bridge (no equipment) */
export function AnimGluteBridge() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes bridgeNoEquip { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-24px)} }
        .bridge-up { animation: bridgeNoEquip 2s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={110} y={148} width={210} height={10} />
      <rect x="18" y="88" width="80" height="20" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="12" cy="98" r="12" fill="#232d4a" />
      <rect x="30" y="104" width="56" height="8" rx="4" fill="#232d4a" opacity="0.6" />
      <g className="bridge-up">
        <rect x="94" y="78" width="30" height="26" rx="9" fill="#3362ff" opacity="0.9" />
        <rect x="92" y="100" width="16" height="34" rx="7" fill="#232d4a" />
        <rect x="115" y="100" width="16" height="34" rx="7" fill="#232d4a" />
        <circle cx="100" cy="136" r="7" fill="#f59e0b" />
        <circle cx="123" cy="136" r="7" fill="#f59e0b" />
        <rect x="93"  y="141" width="13" height="6" rx="3" fill="#232d4a" />
        <rect x="115" y="141" width="13" height="6" rx="3" fill="#232d4a" />
      </g>
      <circle cx="112" cy="88" r="12" fill="#ef4444" opacity="0.15">
        <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="110" y="156" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Glute Bridge</text>
    </svg>
  );
}

/** Dead Bug — Core motor control */
export function AnimDeadBug() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes deadBugArm { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-70deg)} }
        @keyframes deadBugLeg { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(60deg)} }
        .db-arm { animation: deadBugArm 2.5s ease-in-out infinite; transform-origin: 80px 78px; }
        .db-leg { animation: deadBugLeg 2.5s ease-in-out infinite; transform-origin: 140px 95px; }
      `}</style>
      <ExerciseMat x={110} y={148} width={210} height={10} />
      {/* Lying supine */}
      <rect x="30" y="82" width="80" height="20" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="24" cy="92" r="12" fill="#232d4a" />
      {/* Hip area */}
      <rect x="106" y="84" width="30" height="20" rx="8" fill="#3362ff" opacity="0.8" />
      {/* Extending arm */}
      <g className="db-arm">
        <rect x="70" y="62" width="10" height="28" rx="5" fill="#3362ff" opacity="0.85" />
        <ellipse cx="75" cy="62" rx="7" ry="5" fill="#3362ff" opacity="0.85" />
      </g>
      {/* Static arm */}
      <rect x="90" y="62" width="10" height="24" rx="5" fill="#232d4a" />
      {/* Extending leg */}
      <g className="db-leg">
        <rect x="134" y="80" width="12" height="36" rx="5" fill="#10b981" opacity="0.9" />
        <ellipse cx="140" cy="118" rx="9" ry="6" fill="#10b981" opacity="0.9" />
      </g>
      {/* Static leg up */}
      <rect x="150" y="70" width="12" height="38" rx="5" fill="#232d4a" />
      <ellipse cx="156" cy="108" rx="9" ry="6" fill="#232d4a" />
      <text x="110" y="156" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Dead Bug — Motor Control</text>
    </svg>
  );
}

/** Wall Sit */
export function AnimWallSit() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes wallPulse { 0%,100%{opacity:0.15} 50%{opacity:0.35} }
        .quad-high { animation: wallPulse 2s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      {/* Wall */}
      <rect x="148" y="20" width="14" height="188" rx="4" fill="#e4e7f0" />
      {/* Figure against wall */}
      <circle cx="100" cy="36" r="14" fill="#232d4a" />
      <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
      <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="56" y="72" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      <rect x="124" y="72" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      {/* 90-degree legs */}
      <rect x="80" y="116" width="52" height="18" rx="8" fill="#232d4a" />
      {/* Shins down */}
      <rect x="80" y="132" width="16" height="56" rx="7" fill="#232d4a" />
      <rect x="116" y="132" width="16" height="56" rx="7" fill="#232d4a" />
      <ellipse cx="88"  cy="191" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="124" cy="191" rx="11" ry="5" fill="#232d4a" />
      {/* Quad highlight */}
      <rect x="80" y="116" width="52" height="18" rx="8" fill="#ef4444" className="quad-high" />
      <text x="100" y="214" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Wall Sit — Isometric Quad</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 🟠 BOSU / FITBALL (equilibrio + propiocepción)
// ══════════════════════════════════════════════════════════════════════════════

/** Bosu Single Leg Balance */
export function AnimBosuBalance() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes wobble { 0%,100%{transform:rotate(-4deg)} 25%{transform:rotate(4deg)} 75%{transform:rotate(-2deg)} }
        .bosu-figure { animation: wobble 2s ease-in-out infinite; transform-origin: 100px 165px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      {/* Bosu dome */}
      <ellipse cx="100" cy="172" rx="44" ry="8" fill="#f97316" opacity="0.5" />
      <path d="M56,172 A44,44 0 0,1 144,172" fill="#f97316" opacity="0.85" />
      {/* Flat base */}
      <rect x="54" y="172" width="92" height="8" rx="3" fill="#ea580c" />
      <g className="bosu-figure">
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="60" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms out for balance */}
        <rect x="40" y="70" width="36" height="10" rx="5" fill="#232d4a" opacity="0.75" />
        <rect x="124" y="70" width="36" height="10" rx="5" fill="#232d4a" opacity="0.75" />
        {/* Standing leg */}
        <rect x="86" y="116" width="16" height="50" rx="7" fill="#232d4a" />
        <ellipse cx="94" cy="168" rx="11" ry="5" fill="#232d4a" />
        {/* Raised knee */}
        <rect x="104" y="116" width="16" height="30" rx="7" fill="#3362ff" opacity="0.9" />
        <circle cx="112" cy="148" r="8" fill="#f59e0b" />
      </g>
      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Bosu Single Leg Balance</text>
    </svg>
  );
}

/** Bosu Squat — proprioception */
export function AnimBosuSquat() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes bosuSq { 0%,100%{transform:translateY(0)} 50%{transform:translateY(28px)} }
        .bosu-sq { animation: bosuSq 2.4s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      {/* Bosu */}
      <rect x="58" y="168" width="84" height="10" rx="3" fill="#ea580c" />
      <path d="M58,168 A42,42 0 0,1 142,168" fill="#f97316" opacity="0.85" />
      <g className="bosu-sq">
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="60" width="44" height="52" rx="10" fill="#232d4a" opacity="0.9" />
        <rect x="56" y="68" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="124" y="68" width="20" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="80" y="110" width="16" height="38" rx="7" fill="#232d4a" />
        <rect x="104" y="110" width="16" height="38" rx="7" fill="#232d4a" />
        <circle cx="88"  cy="150" r="8" fill="#f59e0b" />
        <circle cx="112" cy="150" r="8" fill="#f59e0b" />
        <rect x="81"  y="156" width="14" height="22" rx="6" fill="#232d4a" />
        <rect x="105" y="156" width="14" height="22" rx="6" fill="#232d4a" />
        <ellipse cx="88"  cy="180" rx="11" ry="5" fill="#232d4a" />
        <ellipse cx="112" cy="180" rx="11" ry="5" fill="#232d4a" />
      </g>
      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Bosu Squat — Proprioception</text>
    </svg>
  );
}

/** Bosu Push-Up */
export function AnimBosuPushUp() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <style>{`
        @keyframes bosuPush { 0%,100%{transform:translateY(6px)} 50%{transform:translateY(-10px)} }
        .bosu-push { animation: bosuPush 1.8s ease-in-out infinite; }
      `}</style>
      <ExerciseMat x={110} y={168} width={210} height={10} />
      {/* Bosu upside down */}
      <ellipse cx="90" cy="140" rx="36" ry="14" fill="#f97316" opacity="0.85" />
      <circle cx="90" cy="128" r="8" fill="#ea580c" opacity="0.5" />
      <g className="bosu-push">
        <circle cx="28" cy="80" r="12" fill="#232d4a" />
        <rect x="38" y="74" width="80" height="18" rx="8" fill="#232d4a" opacity="0.9" />
        <rect x="68" y="90" width="12" height="36" rx="5" fill="#232d4a" />
        <rect x="90" y="90" width="12" height="36" rx="5" fill="#232d4a" />
        <rect x="116" y="74" width="62" height="14" rx="6" fill="#232d4a" />
        <ellipse cx="180" cy="81" rx="11" ry="6" fill="#232d4a" />
        <rect x="168" y="86" width="13" height="32" rx="5" fill="#232d4a" />
      </g>
      <text x="110" y="177" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Bosu Push-Up (Unstable)</text>
    </svg>
  );
}

/** Bosu Hip Hinge */
export function AnimBosuHipHinge() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes bosuHinge { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(42deg)} }
        .bosu-hinge { animation: bosuHinge 2.6s ease-in-out infinite; transform-origin: 100px 112px; }
      `}</style>
      <ExerciseMat x={100} y={208} width={180} height={10} />
      <rect x="58" y="172" width="84" height="10" rx="3" fill="#ea580c" />
      <path d="M58,172 A42,42 0 0,1 142,172" fill="#f97316" opacity="0.85" />
      <g className="bosu-hinge">
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        <rect x="78" y="60" width="44" height="52" rx="10" fill="#232d4a" opacity="0.9" />
        <rect x="64" y="88" width="16" height="10" rx="4" fill="#232d4a" opacity="0.7" />
        <rect x="120" y="88" width="16" height="10" rx="4" fill="#232d4a" opacity="0.7" />
      </g>
      <rect x="82" y="112" width="36" height="60" rx="8" fill="#232d4a" />
      <rect x="80" y="112" width="16" height="60" rx="7" fill="#232d4a" />
      <rect x="104" y="112" width="16" height="60" rx="7" fill="#232d4a" />
      <ellipse cx="88"  cy="174" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="112" cy="174" rx="11" ry="5" fill="#232d4a" />
      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Bosu Hip Hinge Balance</text>
    </svg>
  );
}

/** Bosu Plank */
export function AnimBosuPlank() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes bosuBreath { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.05)} }
        .bosu-pl { animation: bosuBreath 3s ease-in-out infinite; transform-origin: 90px 84px; }
      `}</style>
      <ExerciseMat x={110} y={148} width={210} height={10} />
      {/* Bosu upside down */}
      <ellipse cx="72" cy="118" rx="36" ry="14" fill="#f97316" opacity="0.85" />
      <circle  cx="72" cy="106" r="8" fill="#ea580c" opacity="0.5" />
      <g className="bosu-pl">
        <circle cx="24" cy="76" r="12" fill="#232d4a" />
        <rect x="34" y="70" width="100" height="18" rx="8" fill="#232d4a" opacity="0.9" />
        {/* Arms on bosu */}
        <rect x="50" y="86" width="12" height="28" rx="5" fill="#232d4a" />
        <rect x="74" y="86" width="12" height="28" rx="5" fill="#232d4a" />
        {/* Legs extended */}
        <rect x="132" y="70" width="60" height="14" rx="6" fill="#232d4a" />
        <rect x="186" y="82" width="13" height="30" rx="5" fill="#232d4a" />
        <ellipse cx="192" cy="114" rx="10" ry="5" fill="#232d4a" />
      </g>
      <text x="110" y="156" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Bosu Plank — Core Unstable</text>
    </svg>
  );
}

// ─── Extended Registry ────────────────────────────────────────────────────────
export const EXERCISE_ANIMATIONS_P2: Record<string, React.FC> = {
  // 🟡 Ball
  "ball-bridge":            AnimBallBridge,
  "ball-hamstring-curl":    AnimBallHamstringCurl,
  "ball-push-up":           AnimBallPushUp,
  "ball-lumbar-extension":  AnimBallLumbarExtension,
  "ball-lateral-flex":      AnimBallLateralFlex,
  // 🔴 Band
  "band-hip-abduction":     AnimBandHipAbduction,
  "band-pull-apart":        AnimBandPullApart,
  "band-glute-kickback":    AnimBandGluteKickback,
  "band-shoulder-rotation": AnimBandShoulderRotation,
  "band-calf-raise":        AnimBandCalfRaise,
  // 🔵 Dumbbell
  "dumbbell-bicep-curl":    AnimDumbbellBicepCurl,
  "dumbbell-bent-row":      AnimDumbbellBentRow,
  "romanian-deadlift":      AnimRomanianDeadlift,
  "tricep-extension":       AnimTricepExtension,
  "goblet-squat":           AnimGobletSquat,
  // 🟢 Bodyweight
  "plank":                  AnimPlank,
  "lunge":                  AnimLunge,
  "glute-bridge":           AnimGluteBridge,
  "dead-bug":               AnimDeadBug,
  "wall-sit":               AnimWallSit,
  // 🟠 Bosu
  "bosu-balance":           AnimBosuBalance,
  "bosu-squat":             AnimBosuSquat,
  "bosu-push-up":           AnimBosuPushUp,
  "bosu-hip-hinge":         AnimBosuHipHinge,
  "bosu-plank":             AnimBosuPlank,
};
