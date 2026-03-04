"use client";

/**
 * ExerciseAnimations
 * ─────────────────────────────────────────────────────────────────────────────
 * Each exercise is a self-contained SVG animation using CSS keyframes.
 * All animations loop and are 100% client-side — no video required.
 *
 * Equipment:
 *   🔴 Resistance band     🟡 Pilates ball
 *   🏋️  Dumbbell / barbell  🔵 Medicine ball
 *   🟢 Elastic tube        🟠 Foam roller
 *   🟣 Step box            ⚫ Kettlebell
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Dumbbell, PilatesBall, ResistanceBand, ElasticTube,
  FoamRoller, ExerciseMat, StepBox, Kettlebell, MedicineBall } from "./Equipment";

// ─── Animation CSS ────────────────────────────────────────────────────────────
// Injected once per animation component via <style> tag

const BASE_STYLE = `
  .anim-slow   { animation-duration: 2.5s; }
  .anim-medium { animation-duration: 1.8s; }
  .anim-fast   { animation-duration: 1.2s; }
  [class*="anim-"] { animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
`;

// ─── 1. Shoulder External Rotation (Resistance Band) ─────────────────────────
export function AnimShoulderExternalRotation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        ${BASE_STYLE}
        @keyframes shoulderRotate {
          0%, 100% { transform: rotate(-30deg); }
          50%       { transform: rotate(20deg);  }
        }
        .arm-rotate { animation: shoulderRotate 2.2s ease-in-out infinite; transform-origin: 90px 85px; }
        @keyframes bandStretch {
          0%, 100% { d: path("M60,95 Q80,80 120,88"); }
          50%       { d: path("M60,95 Q80,105 120,88"); }
        }
      `}</style>

      <ExerciseMat x={100} y={180} width={160} height={12} />

      {/* Body - standing, arm at side */}
      {/* Head */}
      <circle cx="100" cy="30" r="16" fill="#232d4a" />
      {/* Torso */}
      <rect x="78" y="48" width="44" height="56" rx="10" fill="#232d4a" opacity="0.9" />
      {/* Left arm static */}
      <rect x="60" y="52" width="14" height="36" rx="6" fill="#232d4a" />
      <rect x="62" y="88" width="12" height="28" rx="5" fill="#364060" />
      {/* Right upper arm static */}
      <rect x="126" y="52" width="14" height="28" rx="6" fill="#232d4a" />

      {/* Right forearm — animated */}
      <g className="arm-rotate">
        <rect x="128" y="80" width="12" height="34" rx="5" fill="#364060" />
        <ellipse cx="134" cy="118" rx="8" ry="6" fill="#364060" />
        {/* Dumbbell in hand */}
        <Dumbbell x={134} y={122} angle={90} weight="light" />
      </g>

      {/* Band anchored to wall */}
      <rect x="30" y="88" width="8" height="20" rx="3" fill="#9ba5be" />
      <ResistanceBand x={38} y={98} color="#ef4444" stretched />

      {/* Labels */}
      <text x="100" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Shoulder External Rotation
      </text>

      {/* Motion arrow */}
      <path d="M155,78 A22,22 0 0,1 155,112" fill="none" stroke="#3362ff" strokeWidth="2"
        strokeDasharray="4 3" strokeLinecap="round" />
      <polygon points="152,112 158,112 155,119" fill="#3362ff" />
    </svg>
  );
}

// ─── 2. Bird Dog (No equipment / core) ───────────────────────────────────────
export function AnimBirdDog() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes armExtend {
          0%, 100% { transform: translateX(-8px) rotate(10deg); }
          50%       { transform: translateX(10px) rotate(-20deg); }
        }
        @keyframes legExtend {
          0%, 100% { transform: translateX(8px) rotate(-10deg); }
          50%       { transform: translateX(-10px) rotate(20deg); }
        }
        .bird-arm { animation: armExtend 2.4s ease-in-out infinite; transform-origin: 60px 70px; }
        .bird-leg { animation: legExtend 2.4s ease-in-out infinite; transform-origin: 155px 80px; }
      `}</style>

      <ExerciseMat x={110} y={125} width={200} height={12} />

      {/* Head */}
      <circle cx="28" cy="72" r="14" fill="#232d4a" />
      <rect x="41" y="68" width="10" height="8" rx="2" fill="#232d4a" />
      {/* Torso horizontal */}
      <rect x="50" y="58" width="86" height="24" rx="10" fill="#232d4a" opacity="0.9" />

      {/* Left (front) arm — animated extending forward */}
      <g className="bird-arm">
        <rect x="35" y="70" width="30" height="12" rx="5" fill="#3362ff" />
        <ellipse cx="66" cy="76" rx="8" ry="6" fill="#3362ff" />
      </g>

      {/* Right (back) arm — static down */}
      <rect x="88" y="82" width="12" height="30" rx="5" fill="#232d4a" />
      <ellipse cx="94" cy="114" rx="8" ry="5" fill="#232d4a" />

      {/* Left (front) leg — static down */}
      <rect x="118" y="82" width="12" height="30" rx="5" fill="#232d4a" />
      <ellipse cx="124" cy="114" rx="8" ry="5" fill="#232d4a" />

      {/* Right (back) leg — animated extending back */}
      <g className="bird-leg">
        <rect x="145" y="68" width="36" height="12" rx="5" fill="#10b981" />
        <ellipse cx="181" cy="74" rx="8" ry="6" fill="#10b981" />
      </g>

      {/* Labels */}
      <text x="110" y="148" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Bird Dog — Core Stability
      </text>
      {/* Opposing arrows */}
      <text x="50" y="50" fontSize="8" fill="#3362ff">← Extend</text>
      <text x="152" y="50" fontSize="8" fill="#10b981">Extend →</text>
    </svg>
  );
}

// ─── 3. Hip Flexor Stretch ───────────────────────────────────────────────────
export function AnimHipFlexorStretch() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes hipRock {
          0%, 100% { transform: rotate(0deg);    }
          50%       { transform: rotate(-12deg);  }
        }
        @keyframes frontKneeBend {
          0%, 100% { transform: rotate(0deg);   }
          50%       { transform: rotate(8deg);   }
        }
        .hip-rock     { animation: hipRock 3s ease-in-out infinite; transform-origin: 95px 125px; }
        .front-knee   { animation: frontKneeBend 3s ease-in-out infinite; transform-origin: 75px 128px; }
      `}</style>

      <ExerciseMat x={100} y={185} width={180} height={12} />

      {/* Head */}
      <circle cx="100" cy="38" r="14" fill="#232d4a" />
      <rect x="93" y="51" width="14" height="10" rx="3" fill="#232d4a" />
      {/* Torso */}
      <rect x="80" y="60" width="40" height="50" rx="10" fill="#232d4a" opacity="0.9" />
      {/* Arms out for balance */}
      <rect x="42" y="65" width="36" height="10" rx="5" fill="#232d4a" />
      <rect x="122" y="65" width="36" height="10" rx="5" fill="#232d4a" />

      {/* Front leg (left) — lunging */}
      <g className="front-knee">
        <rect x="70" y="108" width="16" height="36" rx="7" fill="#232d4a" />
        <circle cx="78" cy="147" r="8" fill="#f59e0b" />
        <rect x="71" y="153" width="14" height="22" rx="6" fill="#232d4a" />
        <ellipse cx="78" cy="178" rx="12" ry="5" fill="#232d4a" />
      </g>

      {/* Back leg (right) — knee on ground */}
      <g className="hip-rock">
        <rect x="112" y="108" width="16" height="30" rx="7" fill="#3362ff" opacity="0.85" />
        <circle cx="120" cy="140" r="8" fill="#f59e0b" />
        <rect x="113" y="146" width="14" height="22" rx="6" fill="#3362ff" opacity="0.85" />
        <ellipse cx="120" cy="172" rx="12" ry="5" fill="#3362ff" opacity="0.85" />
      </g>

      {/* Hip highlight pulse */}
      <circle cx="100" cy="112" r="14" fill="#ef4444" opacity="0.15">
        <animate attributeName="r" values="14;18;14" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.3;0.15" dur="3s" repeatCount="indefinite" />
      </circle>

      <text x="100" y="196" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Hip Flexor Stretch
      </text>
      <text x="100" y="96" textAnchor="middle" fontSize="8" fill="#ef4444">
        Iliopsoas stretch ↕
      </text>
    </svg>
  );
}

// ─── 4. Resistance Band Row ──────────────────────────────────────────────────
export function AnimResistanceBandRow() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full">
      <style>{`
        @keyframes rowPull {
          0%, 100% { transform: translateX(0px);   }
          50%       { transform: translateX(-22px); }
        }
        @keyframes elbowBend {
          0%, 100% { transform: rotate(0deg);   }
          50%       { transform: rotate(-45deg); }
        }
        .row-torso  { animation: rowPull 2s ease-in-out infinite; transform-origin: 120px 90px; }
        .elbow-l    { animation: elbowBend 2s ease-in-out infinite; transform-origin: 78px 92px; }
        .elbow-r    { animation: elbowBend 2s ease-in-out infinite; transform-origin: 78px 110px; }
      `}</style>

      <ExerciseMat x={110} y={175} width={200} height={12} />

      {/* Wall anchor */}
      <rect x="6" y="75" width="12" height="60" rx="4" fill="#364060" />
      <circle cx="12" cy="95"  r="5" fill="#9ba5be" />
      <circle cx="12" cy="115" r="5" fill="#9ba5be" />

      {/* Band */}
      <g>
        <line x1="17" y1="92"  x2="76" y2="90"  stroke="#ef4444" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="x2" values="76;54;76" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="17" y1="112" x2="76" y2="112" stroke="#ef4444" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="x2" values="76;54;76" dur="2s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Figure */}
      <g className="row-torso">
        {/* Head */}
        <circle cx="155" cy="55" r="14" fill="#232d4a" />
        <rect x="148" y="68" width="14" height="10" rx="3" fill="#232d4a" />
        {/* Torso */}
        <rect x="130" y="76" width="48" height="58" rx="10" fill="#232d4a" opacity="0.9" />

        {/* Left arm pulling */}
        <g className="elbow-l">
          <rect x="60" y="82" width="68" height="14" rx="6" fill="#3362ff" opacity="0.85" />
          <ellipse cx="62" cy="89" rx="9" ry="7" fill="#364060" />
        </g>
        {/* Right arm pulling */}
        <g className="elbow-r">
          <rect x="60" y="100" width="68" height="14" rx="6" fill="#3362ff" opacity="0.85" />
          <ellipse cx="62" cy="107" rx="9" ry="7" fill="#364060" />
        </g>

        {/* Legs */}
        <rect x="132" y="132" width="18" height="38" rx="8" fill="#232d4a" />
        <rect x="158" y="132" width="18" height="38" rx="8" fill="#232d4a" />
        <ellipse cx="141" cy="173" rx="12" ry="5" fill="#232d4a" />
        <ellipse cx="167" cy="173" rx="12" ry="5" fill="#232d4a" />
      </g>

      <text x="110" y="193" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Resistance Band Row
      </text>
    </svg>
  );
}

// ─── 5. Dumbbell Lateral Raise ────────────────────────────────────────────────
export function AnimDumbbellLateralRaise() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes raiseL {
          0%, 100% { transform: rotate(10deg);   }
          50%       { transform: rotate(-80deg);  }
        }
        @keyframes raiseR {
          0%, 100% { transform: rotate(-10deg);  }
          50%       { transform: rotate(80deg);   }
        }
        .arm-raise-l { animation: raiseL 2.2s ease-in-out infinite; transform-origin: 72px 78px; }
        .arm-raise-r { animation: raiseR 2.2s ease-in-out infinite; transform-origin: 128px 78px; }
      `}</style>

      <ExerciseMat x={100} y={185} width={180} height={12} />

      {/* Head */}
      <circle cx="100" cy="32" r="14" fill="#232d4a" />
      <rect x="93" y="45" width="14" height="10" rx="3" fill="#232d4a" />
      {/* Torso */}
      <rect x="78" y="54" width="44" height="60" rx="10" fill="#232d4a" opacity="0.9" />
      {/* Legs */}
      <rect x="80" y="112" width="16" height="42" rx="7" fill="#232d4a" />
      <rect x="104" y="112" width="16" height="42" rx="7" fill="#232d4a" />
      <ellipse cx="88" cy="158" rx="12" ry="5" fill="#232d4a" />
      <ellipse cx="112" cy="158" rx="12" ry="5" fill="#232d4a" />

      {/* Left arm + dumbbell */}
      <g className="arm-raise-l">
        <rect x="50" y="72" width="22" height="12" rx="5" fill="#232d4a" />
        <Dumbbell x={40} y={78} angle={90} weight="light" />
      </g>

      {/* Right arm + dumbbell */}
      <g className="arm-raise-r">
        <rect x="128" y="72" width="22" height="12" rx="5" fill="#232d4a" />
        <Dumbbell x={160} y={78} angle={90} weight="light" />
      </g>

      <text x="100" y="196" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Dumbbell Lateral Raise
      </text>
    </svg>
  );
}

// ─── 6. Pilates Ball Wall Squat ───────────────────────────────────────────────
export function AnimBallWallSquat() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes squat {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(30px);  }
        }
        @keyframes ballSquish {
          0%, 100% { ry: 22; }
          50%       { ry: 18; }
        }
        .squat-body { animation: squat 2.5s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={100} y={205} width={180} height={12} />

      {/* Wall */}
      <rect x="158" y="20" width="14" height="180" rx="4" fill="#e4e7f0" />

      {/* Ball against wall (moves with body) */}
      <g className="squat-body">
        {/* Head */}
        <circle cx="90" cy="42" r="14" fill="#232d4a" />
        <rect x="83" y="55" width="14" height="10" rx="3" fill="#232d4a" />
        {/* Torso */}
        <rect x="70" y="64" width="44" height="50" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Ball between back and wall */}
        <PilatesBall cx={148} cy={88} r={22} color="#fbbf24" />
        {/* Arms slightly forward */}
        <rect x="30" y="75" width="38" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="32" y="82" width="36" height="8" rx="4" fill="#364060" />
        {/* Legs in squat */}
        <rect x="72" y="112" width="18" height="38" rx="8" fill="#232d4a" />
        <rect x="96" y="112" width="18" height="38" rx="8" fill="#232d4a" />
        {/* Knees */}
        <circle cx="81"  cy="152" r="8" fill="#f59e0b" />
        <circle cx="105" cy="152" r="8" fill="#f59e0b" />
        {/* Calves */}
        <rect x="73" y="158" width="16" height="28" rx="7" fill="#232d4a" />
        <rect x="97" y="158" width="16" height="28" rx="7" fill="#232d4a" />
        <ellipse cx="81"  cy="188" rx="12" ry="5" fill="#232d4a" />
        <ellipse cx="105" cy="188" rx="12" ry="5" fill="#232d4a" />
      </g>

      {/* Arrows */}
      <path d="M52,85 L52,120" stroke="#3362ff" strokeWidth="2" strokeDasharray="4 3"
        fill="none" strokeLinecap="round" />
      <polygon points="48,120 56,120 52,128" fill="#3362ff" />
      <path d="M52,85 L52,55" stroke="#3362ff" strokeWidth="2" strokeDasharray="4 3"
        fill="none" strokeLinecap="round" />
      <polygon points="48,55 56,55 52,47" fill="#3362ff" />

      <text x="100" y="212" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Ball Wall Squat
      </text>
    </svg>
  );
}

// ─── 7. Cervical Retraction (Chin Tuck) ──────────────────────────────────────
export function AnimCervicalRetraction() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <style>{`
        @keyframes chinTuck {
          0%, 100% { transform: translateX(6px);  }
          50%       { transform: translateX(-6px); }
        }
        .head-move { animation: chinTuck 2.5s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={100} y={185} width={180} height={12} />

      {/* Torso and lower body static */}
      <rect x="78" y="78" width="44" height="60" rx="10" fill="#232d4a" opacity="0.9" />
      <rect x="78" y="136" width="18" height="42" rx="8" fill="#232d4a" />
      <rect x="104" y="136" width="18" height="42" rx="8" fill="#232d4a" />
      <ellipse cx="87"  cy="180" rx="12" ry="5" fill="#232d4a" />
      <ellipse cx="113" cy="180" rx="12" ry="5" fill="#232d4a" />
      {/* Arms at side */}
      <rect x="56" y="82" width="20" height="42" rx="8" fill="#232d4a" />
      <rect x="124" y="82" width="20" height="42" rx="8" fill="#232d4a" />

      {/* Head + neck animated */}
      <g className="head-move">
        <rect x="90" y="58" width="20" height="20" rx="5" fill="#232d4a" />
        <circle cx="100" cy="40" r="16" fill="#232d4a" />
        {/* Face indicator */}
        <circle cx="106" cy="36" r="3" fill="white" opacity="0.6" />
        <circle cx="106" cy="44" r="2" fill="white" opacity="0.4" />
      </g>

      {/* Arrows showing movement */}
      <path d="M130,40 L148,40" stroke="#3362ff" strokeWidth="2" strokeDasharray="4 3" fill="none" />
      <path d="M130,56 L148,56" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" fill="none" />
      <text x="150" y="44" fontSize="8" fill="#3362ff">← Retract</text>
      <text x="150" y="60" fontSize="8" fill="#ef4444">← Wrong</text>

      {/* Cervical spine highlight */}
      <rect x="93" y="55" width="14" height="24" rx="4" fill="#ec4899" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2.5s" repeatCount="indefinite" />
      </rect>

      <text x="100" y="195" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Cervical Retraction (Chin Tuck)
      </text>
    </svg>
  );
}

// ─── 8. Ankle Pumps ──────────────────────────────────────────────────────────
export function AnimAnklePumps() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes dorsiflex {
          0%, 100% { transform: rotate(-30deg); }
          50%       { transform: rotate(20deg);  }
        }
        @keyframes plantarflex {
          0%, 100% { transform: rotate(30deg);  }
          50%       { transform: rotate(-20deg); }
        }
        .foot-l { animation: dorsiflex  1.5s ease-in-out infinite; transform-origin: 70px 115px; }
        .foot-r { animation: plantarflex 1.5s ease-in-out infinite; transform-origin: 145px 115px; }
      `}</style>

      <ExerciseMat x={110} y={148} width={200} height={10} />

      {/* Mat surface */}
      {/* Person lying supine — torso & head */}
      <rect x="20"  y="90"  width="80"  height="20" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="16" cy="100" r="12" fill="#232d4a" />

      {/* Left leg horizontal */}
      <rect x="98"  y="90"  width="40"  height="14" rx="6" fill="#232d4a" />
      <circle cx="140" cy="97" r="7" fill="#8b5cf6" />
      {/* Left foot animated */}
      <g className="foot-l">
        <rect x="140" y="90" width="22" height="14" rx="5" fill="#232d4a" />
        <ellipse cx="164" cy="97" rx="10" ry="6" fill="#8b5cf6" />
      </g>

      {/* Right leg horizontal */}
      <rect x="98" y="110" width="40" height="14" rx="6" fill="#232d4a" />
      <circle cx="140" cy="117" r="7" fill="#8b5cf6" />
      {/* Right foot animated (opposite phase) */}
      <g className="foot-r">
        <rect x="140" y="110" width="22" height="14" rx="5" fill="#232d4a" />
        <ellipse cx="164" cy="117" rx="10" ry="6" fill="#8b5cf6" />
      </g>

      {/* Labels */}
      <text x="185" y="95"  fontSize="8" fill="#3362ff">↑ Dorsiflex</text>
      <text x="185" y="120" fontSize="8" fill="#10b981">↓ Plantarflex</text>
      <text x="110" y="154" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Ankle Pumps
      </text>
    </svg>
  );
}

// ─── 9. Kettlebell Swing ──────────────────────────────────────────────────────
export function AnimKettlebellSwing() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes swing {
          0%   { transform: rotate(40deg);  }
          50%  { transform: rotate(-35deg); }
          100% { transform: rotate(40deg);  }
        }
        @keyframes hipHinge {
          0%, 100% { transform: translateY(0px) rotate(0deg);    }
          50%       { transform: translateY(20px) rotate(20deg);  }
        }
        .kb-swing { animation: swing    1.6s ease-in-out infinite; transform-origin: 100px 110px; }
        .hinge    { animation: hipHinge 1.6s ease-in-out infinite; transform-origin: 100px 120px; }
      `}</style>

      <ExerciseMat x={100} y={208} width={180} height={12} />

      {/* Head */}
      <circle cx="100" cy="35" r="14" fill="#232d4a" />
      <rect x="93" y="48" width="14" height="10" rx="3" fill="#232d4a" />

      {/* Hinging body */}
      <g className="hinge">
        {/* Torso */}
        <rect x="78" y="56" width="44" height="54" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms swinging with KB */}
        <g className="kb-swing">
          <rect x="82" y="108" width="14" height="34" rx="6" fill="#3362ff" opacity="0.85" />
          <rect x="104" y="108" width="14" height="34" rx="6" fill="#3362ff" opacity="0.85" />
          <Kettlebell x={100} y={155} />
        </g>

        {/* Legs */}
        <rect x="80" y="108" width="16" height="42" rx="8" fill="#232d4a" />
        <rect x="104" y="108" width="16" height="42" rx="8" fill="#232d4a" />
        <circle cx="88"  cy="153" r="7" fill="#f59e0b" />
        <circle cx="112" cy="153" r="7" fill="#f59e0b" />
        <rect x="81"  y="158" width="14" height="28" rx="6" fill="#232d4a" />
        <rect x="105" y="158" width="14" height="28" rx="6" fill="#232d4a" />
        <ellipse cx="88"  cy="188" rx="11" ry="5" fill="#232d4a" />
        <ellipse cx="112" cy="188" rx="11" ry="5" fill="#232d4a" />
      </g>

      <text x="100" y="212" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Kettlebell Swing
      </text>
    </svg>
  );
}

// ─── 10. Elastic Band Squat ───────────────────────────────────────────────────
export function AnimBandSquat() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes squat2 {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(28px); }
        }
        @keyframes bandWide {
          0%, 100% { transform: scaleX(1);   }
          50%       { transform: scaleX(1.3); }
        }
        .body2       { animation: squat2   2.4s ease-in-out infinite; }
        .band-around { animation: bandWide 2.4s ease-in-out infinite; transform-origin: 100px 148px; }
      `}</style>

      <ExerciseMat x={100} y={205} width={180} height={12} />

      {/* Static head */}
      <circle cx="100" cy="36" r="14" fill="#232d4a" />

      <g className="body2">
        <rect x="93" y="50" width="14" height="10" rx="3" fill="#232d4a" />
        {/* Torso */}
        <rect x="78" y="58" width="44" height="56" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms forward for balance */}
        <rect x="30" y="74" width="46" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="124" y="74" width="46" height="10" rx="5" fill="#232d4a" opacity="0.7" />

        {/* Band around thighs */}
        <g className="band-around">
          <rect x="58" y="140" width="84" height="16" rx="6" fill="#ef4444" opacity="0.7" />
        </g>

        {/* Thighs */}
        <rect x="80" y="112" width="16" height="38" rx="7" fill="#232d4a" />
        <rect x="104" y="112" width="16" height="38" rx="7" fill="#232d4a" />
        {/* Knees */}
        <circle cx="88"  cy="152" r="8" fill="#f59e0b" />
        <circle cx="112" cy="152" r="8" fill="#f59e0b" />
        {/* Calves */}
        <rect x="81"  y="158" width="14" height="28" rx="6" fill="#232d4a" />
        <rect x="105" y="158" width="14" height="28" rx="6" fill="#232d4a" />
        <ellipse cx="88"  cy="188" rx="11" ry="5" fill="#232d4a" />
        <ellipse cx="112" cy="188" rx="11" ry="5" fill="#232d4a" />
      </g>

      {/* Resistance arrows on knees */}
      <text x="44"  y="152" fontSize="9" fill="#ef4444">→</text>
      <text x="148" y="152" fontSize="9" fill="#ef4444">←</text>

      <text x="100" y="212" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Band Squat (Knee resistance)
      </text>
    </svg>
  );
}

// ─── 11. Foam Roller Thoracic Extension ──────────────────────────────────────
export function AnimFoamRollerThoracic() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes extend {
          0%, 100% { transform: rotate(0deg);    }
          50%       { transform: rotate(-18deg);  }
        }
        .thoracic-extend { animation: extend 3s ease-in-out infinite; transform-origin: 110px 80px; }
      `}</style>

      <ExerciseMat x={110} y={145} width={210} height={10} />
      <FoamRoller x={110} y={115} />

      {/* Lying on foam roller */}
      <g className="thoracic-extend">
        {/* Torso */}
        <rect x="45" y="70" width="90" height="22" rx="8" fill="#232d4a" opacity="0.9" />
        {/* Head falling back */}
        <rect x="22" y="72" width="22" height="18" rx="6" fill="#364060" />
        <circle cx="16" cy="81" r="12" fill="#232d4a" />
        {/* Arms behind head */}
        <rect x="46" y="58" width="30" height="10" rx="5" fill="#232d4a" />
        <rect x="64" y="52" width="26" height="10" rx="5" fill="#232d4a" />
        {/* Legs bent */}
        <rect x="133" y="80" width="22" height="14" rx="6" fill="#232d4a"
          style={{ transformOrigin: "134px 87px" }} />
        <circle cx="157" cy="87" r="7" fill="#8b5cf6" />
        <rect x="155" y="95" width="14" height="28" rx="6" fill="#232d4a" />

        <rect x="148" y="80" width="22" height="14" rx="6" fill="#232d4a" />
        <circle cx="172" cy="87" r="7" fill="#8b5cf6" />
        <rect x="170" y="95" width="14" height="28" rx="6" fill="#232d4a" />
      </g>

      {/* Thoracic highlight */}
      <rect x="55" y="68" width="60" height="28" rx="6" fill="#f97316" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
      </rect>

      <text x="110" y="154" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Thoracic Extension (Foam Roller)
      </text>
    </svg>
  );
}

// ─── 12. Medicine Ball Rotational Throw ──────────────────────────────────────
export function AnimMedicineBallRotation() {
  return (
    <svg viewBox="0 0 220 220" className="w-full h-full">
      <style>{`
        @keyframes rotate {
          0%   { transform: rotate(-35deg); }
          50%  { transform: rotate(35deg);  }
          100% { transform: rotate(-35deg); }
        }
        @keyframes ballMove {
          0%   { transform: translate(-28px, 8px);  }
          50%  { transform: translate(28px, 8px);   }
          100% { transform: translate(-28px, 8px);  }
        }
        .body-rotate  { animation: rotate   2s ease-in-out infinite; transform-origin: 110px 110px; }
        .ball-travel  { animation: ballMove 2s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={110} y={205} width={200} height={12} />

      <g className="body-rotate">
        {/* Head */}
        <circle cx="110" cy="36" r="14" fill="#232d4a" />
        <rect x="103" y="49" width="14" height="10" rx="3" fill="#232d4a" />
        {/* Torso */}
        <rect x="88" y="58" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms holding ball */}
        <rect x="52"  y="76" width="36" height="12" rx="5" fill="#3362ff" opacity="0.8" />
        <rect x="132" y="76" width="36" height="12" rx="5" fill="#3362ff" opacity="0.8" />

        {/* Medicine ball — moves across */}
        <g className="ball-travel">
          <MedicineBall cx={110} cy={82} r={16} />
        </g>

        {/* Legs */}
        <rect x="90"  y="114" width="16" height="44" rx="8" fill="#232d4a" />
        <rect x="114" y="114" width="16" height="44" rx="8" fill="#232d4a" />
        <ellipse cx="98"  cy="160" rx="12" ry="5" fill="#232d4a" />
        <ellipse cx="122" cy="160" rx="12" ry="5" fill="#232d4a" />
      </g>

      {/* Rotation arrows */}
      <path d="M68,100 A44,44 0 0,0 110,62"  fill="none" stroke="#3362ff" strokeWidth="2" strokeDasharray="5 3" />
      <path d="M110,62 A44,44 0 0,0 152,100" fill="none" stroke="#3362ff" strokeWidth="2" strokeDasharray="5 3" />

      <text x="110" y="210" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Medicine Ball Rotation
      </text>
    </svg>
  );
}

// ─── 13. Step Box Single Leg ──────────────────────────────────────────────────
export function AnimStepUpSingleLeg() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes stepUp {
          0%, 100% { transform: translateY(0px);   }
          40%, 60% { transform: translateY(-26px);  }
        }
        @keyframes freeLeg {
          0%, 100% { transform: rotate(0deg);   }
          40%, 60% { transform: rotate(-45deg);  }
        }
        .step-body { animation: stepUp  2.5s ease-in-out infinite; }
        .free-leg  { animation: freeLeg 2.5s ease-in-out infinite; transform-origin: 110px 145px; }
      `}</style>

      <ExerciseMat x={100} y={208} width={180} height={12} />
      <StepBox x={100} y={175} h={28} />

      <g className="step-body">
        {/* Head */}
        <circle cx="100" cy="36" r="14" fill="#232d4a" />
        <rect x="93" y="49" width="14" height="10" rx="3" fill="#232d4a" />
        {/* Torso */}
        <rect x="78" y="58" width="44" height="56" rx="10" fill="#232d4a" opacity="0.9" />
        {/* Arms out */}
        <rect x="40" y="68" width="36" height="10" rx="5" fill="#232d4a" opacity="0.7" />
        <rect x="124" y="68" width="36" height="10" rx="5" fill="#232d4a" opacity="0.7" />

        {/* Planted leg */}
        <rect x="93" y="112" width="16" height="44" rx="7" fill="#232d4a" />
        <circle cx="101" cy="158" r="8" fill="#10b981" />
        <rect x="94" y="164" width="14" height="20" rx="6" fill="#232d4a" />
        <ellipse cx="101" cy="186" rx="11" ry="5" fill="#232d4a" />

        {/* Raised free leg — animated */}
        <g className="free-leg">
          <rect x="109" y="112" width="16" height="36" rx="7" fill="#3362ff" opacity="0.85" />
          <circle cx="117" cy="150" r="8" fill="#f59e0b" />
          <rect x="110" y="155" width="14" height="20" rx="6" fill="#3362ff" opacity="0.85" />
        </g>
      </g>

      <text x="100" y="214" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Step Up — Single Leg
      </text>
    </svg>
  );
}

// ─── 14. Seated Knee Extension ────────────────────────────────────────────────
export function AnimSeatedKneeExtension() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full">
      <style>{`
        @keyframes extendKnee {
          0%, 100% { transform: rotate(80deg);  }
          50%       { transform: rotate(-5deg);  }
        }
        .knee-ext { animation: extendKnee 2s ease-in-out infinite; transform-origin: 100px 130px; }
      `}</style>

      {/* Chair */}
      <rect x="70" y="100" width="80" height="10" rx="4" fill="#9ba5be" opacity="0.5" />
      <rect x="70" y="108" width="8" height="60" rx="3"  fill="#9ba5be" opacity="0.4" />
      <rect x="142" y="108" width="8" height="60" rx="3" fill="#9ba5be" opacity="0.4" />
      <rect x="60" y="90" width="8" height="78" rx="3"   fill="#9ba5be" opacity="0.4" />

      {/* Seated figure */}
      <circle cx="110" cy="38" r="14" fill="#232d4a" />
      <rect x="103" y="51" width="14" height="10" rx="3" fill="#232d4a" />
      {/* Torso seated */}
      <rect x="86" y="60" width="48" height="52" rx="10" fill="#232d4a" opacity="0.9" />
      {/* Arms on thighs */}
      <rect x="68"  y="98" width="28" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      <rect x="122" y="98" width="28" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      {/* Thigh horizontal */}
      <rect x="86" y="108" width="50" height="16" rx="7" fill="#232d4a" />

      {/* Static leg */}
      <rect x="86" y="124" width="14" height="38" rx="6" fill="#232d4a" />
      <ellipse cx="93" cy="165" rx="11" ry="5" fill="#232d4a" />

      {/* Animated extending leg */}
      <g className="knee-ext">
        <rect x="100" y="0" width="14" height="44" rx="6" fill="#3362ff" opacity="0.85" />
        {/* Ankle weight */}
        <rect x="96" y="40" width="22" height="10" rx="4" fill="#364060" />
        <ellipse cx="107" cy="45" rx="11" ry="5" fill="#364060" />
      </g>

      {/* Arrow */}
      <path d="M148,125 A38,38 0 0,1 148,165" fill="none" stroke="#3362ff"
        strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="144,165 152,165 148,172" fill="#3362ff" />

      <text x="110" y="190" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Seated Knee Extension
      </text>
    </svg>
  );
}

// ─── 15. Shoulder Press with Dumbbells ───────────────────────────────────────
export function AnimShoulderPress() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <style>{`
        @keyframes pressUp {
          0%, 100% { transform: translateY(0px) rotate(-8deg);  }
          50%       { transform: translateY(-36px) rotate(0deg); }
        }
        @keyframes pressUpR {
          0%, 100% { transform: translateY(0px) rotate(8deg);   }
          50%       { transform: translateY(-36px) rotate(0deg); }
        }
        .press-l { animation: pressUp  2s ease-in-out infinite; transform-origin: 68px 90px; }
        .press-r { animation: pressUpR 2s ease-in-out infinite; transform-origin: 132px 90px; }
      `}</style>

      <ExerciseMat x={100} y={208} width={180} height={12} />

      {/* Head */}
      <circle cx="100" cy="35" r="14" fill="#232d4a" />
      <rect x="93" y="48" width="14" height="10" rx="3" fill="#232d4a" />
      {/* Torso */}
      <rect x="78" y="57" width="44" height="58" rx="10" fill="#232d4a" opacity="0.9" />
      {/* Legs */}
      <rect x="80" y="113" width="16" height="44" rx="8" fill="#232d4a" />
      <rect x="104" y="113" width="16" height="44" rx="8" fill="#232d4a" />
      <ellipse cx="88"  cy="159" rx="11" ry="5" fill="#232d4a" />
      <ellipse cx="112" cy="159" rx="11" ry="5" fill="#232d4a" />

      {/* Left arm + dumbbell */}
      <g className="press-l">
        <rect x="55" y="64" width="12" height="32" rx="5" fill="#232d4a" />
        <rect x="50" y="60" width="12" height="24" rx="5" fill="#364060" />
        <Dumbbell x={56} y={55} angle={0} weight="medium" />
      </g>

      {/* Right arm + dumbbell */}
      <g className="press-r">
        <rect x="133" y="64" width="12" height="32" rx="5" fill="#232d4a" />
        <rect x="138" y="60" width="12" height="24" rx="5" fill="#364060" />
        <Dumbbell x={144} y={55} angle={0} weight="medium" />
      </g>

      <text x="100" y="215" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Shoulder Press
      </text>
    </svg>
  );
}

// ─── Registry: map exercise ID → animation component ─────────────────────────
export const EXERCISE_ANIMATIONS: Record<string, React.FC> = {
  "shoulder-external-rotation": AnimShoulderExternalRotation,
  "bird-dog":                   AnimBirdDog,
  "hip-flexor-stretch":         AnimHipFlexorStretch,
  "resistance-band-row":        AnimResistanceBandRow,
  "dumbbell-lateral-raise":     AnimDumbbellLateralRaise,
  "ball-wall-squat":            AnimBallWallSquat,
  "cervical-retraction":        AnimCervicalRetraction,
  "ankle-pumps":                AnimAnklePumps,
  "kettlebell-swing":           AnimKettlebellSwing,
  "band-squat":                 AnimBandSquat,
  "foam-roller-thoracic":       AnimFoamRollerThoracic,
  "medicine-ball-rotation":     AnimMedicineBallRotation,
  "step-up-single-leg":         AnimStepUpSingleLeg,
  "seated-knee-extension":      AnimSeatedKneeExtension,
  "shoulder-press":             AnimShoulderPress,
};
