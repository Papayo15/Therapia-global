"use client";

/**
 * ExerciseAnimations — Part 3
 * ─────────────────────────────────────────────────────────────────────────────
 * 🟣 COLUMNA / NEUROLÓGICO / SUELO
 *    – Cat-Cow Stretch
 *    – Seated Nerve Flossing (sciático)
 *    – Pelvic Tilt
 *    – Child's Pose
 *    – Lumbar Rotation Stretch
 *    – McKenzie Press-Up
 *    – Supine Knee-to-Chest
 *    – Prone Hip Extension
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ExerciseMat } from "./Equipment";

// ─── 1. Cat-Cow Stretch ───────────────────────────────────────────────────────
export function AnimCatCow() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes catArch {
          0%, 45%, 100% { d: path("M55,82 Q90,62 130,65 Q160,68 185,80"); }
          50%, 95%      { d: path("M55,82 Q90,98 130,95 Q160,92 185,80"); }
        }
        @keyframes headNod {
          0%, 45%, 100% { transform: rotate(-18deg); }
          50%, 95%      { transform: rotate(12deg);  }
        }
        @keyframes tailWag {
          0%, 45%, 100% { transform: rotate(-25deg); }
          50%, 95%      { transform: rotate(20deg);  }
        }
        @keyframes hipRock {
          0%, 45%, 100% { transform: translateY(-4px); }
          50%, 95%      { transform: translateY(4px);  }
        }
        .head-nod { animation: headNod 3s ease-in-out infinite; transform-origin: 48px 74px; }
        .tail-wag { animation: tailWag 3s ease-in-out infinite; transform-origin: 186px 78px; }
        .hip-rock { animation: hipRock 3s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={120} y={165} width={230} height={10} />

      {/* Spine curve — animated */}
      <path
        d="M55,82 Q90,62 130,65 Q160,68 185,80"
        fill="none"
        stroke="#3362ff"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.85"
      >
        <animate attributeName="d"
          values="M55,82 Q90,62 130,65 Q160,68 185,80; M55,82 Q90,98 130,95 Q160,92 185,80; M55,82 Q90,62 130,65 Q160,68 185,80"
          dur="3s" repeatCount="indefinite" calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
      </path>

      {/* Ribcage highlight */}
      <ellipse cx="110" cy="76" rx="22" ry="10" fill="#3362ff" opacity="0.1">
        <animate attributeName="ry" values="10;14;10" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {/* Head */}
      <g className="head-nod">
        <circle cx="38" cy="74" r="14" fill="#232d4a" />
        <rect x="48" y="70" width="12" height="8" rx="3" fill="#232d4a" />
        {/* Eye */}
        <circle cx="32" cy="70" r="2.5" fill="white" opacity="0.7" />
      </g>

      {/* Neck to torso */}
      <rect x="50" y="64" width="12" height="20" rx="5" fill="#232d4a" opacity="0.7" />

      {/* Front legs */}
      <rect x="68" y="80" width="12" height="40" rx="5" fill="#232d4a" />
      <ellipse cx="74" cy="124" rx="10" ry="5" fill="#232d4a" />
      <rect x="84" y="80" width="12" height="40" rx="5" fill="#232d4a" />
      <ellipse cx="90" cy="124" rx="10" ry="5" fill="#232d4a" />

      {/* Hips */}
      <g className="hip-rock">
        <ellipse cx="172" cy="84" rx="18" ry="12" fill="#364060" />
      </g>

      {/* Back legs */}
      <rect x="158" y="90" width="12" height="38" rx="5" fill="#232d4a" />
      <ellipse cx="164" cy="130" rx="10" ry="5" fill="#232d4a" />
      <rect x="172" y="90" width="12" height="38" rx="5" fill="#232d4a" />
      <ellipse cx="178" cy="130" rx="10" ry="5" fill="#232d4a" />

      {/* Tail */}
      <g className="tail-wag">
        <path d="M185,78 Q200,60 210,50" stroke="#232d4a" strokeWidth="8" strokeLinecap="round" fill="none" />
      </g>

      {/* Labels */}
      <text x="120" y="157" textAnchor="middle" fontSize="10" fill="#3362ff" fontFamily="system-ui" fontWeight="600">← Vaca</text>
      <text x="120" y="170" textAnchor="middle" fontSize="10" fill="#10b981" fontFamily="system-ui" fontWeight="600">Gato →</text>

      {/* Spine highlight dot */}
      <circle cx="118" cy="72" r="6" fill="#ef4444" opacity="0.3">
        <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.15;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── 2. Seated Nerve Flossing (Sciático) ──────────────────────────────────────
export function AnimNerveFlossingSciatica() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full">
      <style>{`
        @keyframes legExtend {
          0%, 100% { transform: rotate(70deg);  }
          50%       { transform: rotate(0deg);   }
        }
        @keyframes footFlex {
          0%, 100% { transform: rotate(20deg);  }
          50%       { transform: rotate(-25deg); }
        }
        @keyframes headBow {
          0%, 100% { transform: rotate(-5deg); }
          50%       { transform: rotate(10deg); }
        }
        @keyframes nerveGlow {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
        .leg-extend  { animation: legExtend 2.5s ease-in-out infinite; transform-origin: 110px 142px; }
        .foot-flex   { animation: footFlex  2.5s ease-in-out infinite; transform-origin: 138px 178px; }
        .head-bow    { animation: headBow   2.5s ease-in-out infinite; transform-origin: 110px 52px; }
        .nerve-glow  { animation: nerveGlow 2.5s ease-in-out infinite; }
      `}</style>

      {/* Chair */}
      <rect x="62"  y="120" width="96" height="10" rx="4" fill="#9ba5be" opacity="0.4" />
      <rect x="62"  y="128" width="8"  height="50" rx="3" fill="#9ba5be" opacity="0.3" />
      <rect x="150" y="128" width="8"  height="50" rx="3" fill="#9ba5be" opacity="0.3" />
      <rect x="50"  y="100" width="8"  height="88" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Head — nodding */}
      <g className="head-bow">
        <circle cx="110" cy="38" r="14" fill="#232d4a" />
        <rect x="103" y="51" width="14" height="8" rx="3" fill="#232d4a" />
      </g>

      {/* Torso */}
      <rect x="88" y="58" width="44" height="64" rx="10" fill="#232d4a" opacity="0.9" />

      {/* Arms resting on thighs */}
      <rect x="66" y="110" width="32" height="9" rx="4" fill="#232d4a" opacity="0.6" />
      <rect x="122" y="110" width="32" height="9" rx="4" fill="#232d4a" opacity="0.6" />

      {/* Static thigh (left) */}
      <rect x="68" y="120" width="38" height="14" rx="6" fill="#232d4a" />
      <rect x="68" y="132" width="14" height="40" rx="6" fill="#232d4a" />
      <ellipse cx="75" cy="175" rx="11" ry="5" fill="#232d4a" />

      {/* Animated thigh/leg (right) */}
      <rect x="114" y="120" width="38" height="14" rx="6" fill="#232d4a" />

      <g className="leg-extend">
        {/* Thigh visible */}
        <rect x="114" y="0" width="14" height="44" rx="6" fill="#3362ff" opacity="0.85" />
        <circle cx="121" cy="44" r="8" fill="#f59e0b" />

        {/* Nerve line down leg */}
        <path d="M121,52 Q125,80 130,115" stroke="#8b5cf6" strokeWidth="3"
          strokeDasharray="6 4" strokeLinecap="round" fill="none" className="nerve-glow" />

        {/* Shin */}
        <rect x="114" y="50" width="14" height="50" rx="6" fill="#3362ff" opacity="0.75" />

        {/* Foot */}
        <g className="foot-flex">
          <rect x="114" y="96" width="30" height="10" rx="5" fill="#364060" />
          <ellipse cx="146" cy="101" rx="10" ry="6" fill="#364060" />
        </g>
      </g>

      {/* Sciatic nerve highlight along spine */}
      <path d="M110,122 Q116,135 121,150" stroke="#8b5cf6" strokeWidth="4"
        strokeLinecap="round" fill="none" className="nerve-glow" />

      {/* Sciatic label */}
      <rect x="148" y="95" width="62" height="18" rx="6" fill="#8b5cf6" opacity="0.15" />
      <text x="179" y="107" textAnchor="middle" fontSize="8" fill="#a78bfa" fontFamily="system-ui">N. ciático</text>
      <path d="M148,104 L138,104" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Arrows */}
      <path d="M148,150 Q155,135 152,120" fill="none" stroke="#3362ff" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="155" y="148" fontSize="8" fill="#3362ff" fontFamily="system-ui">Extiende</text>
      <text x="155" y="158" fontSize="8" fill="#10b981" fontFamily="system-ui">+ Flexiona pie</text>

      <text x="110" y="192" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Deslizamiento Neural Ciático
      </text>
    </svg>
  );
}

// ─── 3. Pelvic Tilt ───────────────────────────────────────────────────────────
export function AnimPelvicTilt() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes tilt {
          0%, 100% { transform: translateY(0px) rotate(0deg);   }
          50%       { transform: translateY(-6px) rotate(-8deg); }
        }
        @keyframes lumbPulse {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.5; }
        }
        .pelvis-tilt { animation: tilt 2.5s ease-in-out infinite; transform-origin: 110px 100px; }
        .lumb-flash  { animation: lumbPulse 2.5s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={110} y={148} width={210} height={10} />

      {/* Lying body */}
      <rect x="18" y="86" width="88" height="22" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="12" cy="97" r="13" fill="#232d4a" />
      {/* Arms flat */}
      <rect x="30" y="104" width="60" height="8" rx="4" fill="#232d4a" opacity="0.5" />

      {/* Pelvis — animated */}
      <g className="pelvis-tilt">
        <ellipse cx="110" cy="95" rx="22" ry="14" fill="#3362ff" opacity="0.85" />
        {/* Lumbar gap highlight */}
        <rect x="90" y="84" width="22" height="8" rx="4" fill="#ef4444" className="lumb-flash" />
      </g>

      {/* Thighs */}
      <rect x="98"  y="106" width="16" height="32" rx="7" fill="#232d4a" />
      <rect x="118" y="106" width="16" height="32" rx="7" fill="#232d4a" />
      {/* Knees */}
      <circle cx="106" cy="140" r="8" fill="#8b5cf6" />
      <circle cx="126" cy="140" r="8" fill="#8b5cf6" />
      {/* Calves */}
      <rect x="100" y="145" width="12" height="0" rx="5" fill="#232d4a" />

      {/* Arrows */}
      <path d="M142,88 L156,88" stroke="#3362ff" strokeWidth="2" strokeDasharray="3 2" />
      <polygon points="155,84 163,88 155,92" fill="#3362ff" />
      <path d="M142,104 L156,104" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2" />
      <polygon points="155,100 163,104 155,108" fill="#ef4444" />
      <text x="164" y="91" fontSize="8" fill="#3362ff" fontFamily="system-ui">Báscula</text>
      <text x="164" y="107" fontSize="8" fill="#ef4444" fontFamily="system-ui">Lumbar</text>

      <text x="110" y="156" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">Retroversión Pélvica</text>
    </svg>
  );
}

// ─── 4. Child's Pose ──────────────────────────────────────────────────────────
export function AnimChildsPose() {
  return (
    <svg viewBox="0 0 240 160" className="w-full h-full">
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scaleY(1);    }
          50%       { transform: scaleY(1.08); }
        }
        @keyframes armsSlide {
          0%, 100% { transform: translateX(0px);  }
          50%       { transform: translateX(8px);  }
        }
        .thorax-breathe { animation: breathe  4s ease-in-out infinite; transform-origin: 100px 95px; }
        .arms-extend    { animation: armsSlide 4s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={120} y={148} width={235} height={10} />

      {/* Head on floor */}
      <circle cx="30" cy="112" r="13" fill="#232d4a" />
      <rect x="42" y="106" width="14" height="12" rx="5" fill="#232d4a" />

      {/* Arms extended forward */}
      <g className="arms-extend">
        <rect x="54" y="88" width="80" height="10" rx="5" fill="#232d4a" />
        <rect x="54" y="100" width="80" height="10" rx="5" fill="#232d4a" />
        <ellipse cx="140" cy="93"  rx="10" ry="5" fill="#364060" />
        <ellipse cx="140" cy="105" rx="10" ry="5" fill="#364060" />
      </g>

      {/* Thorax / ribs — breathing */}
      <g className="thorax-breathe">
        <rect x="54" y="84" width="52" height="30" rx="10" fill="#3362ff" opacity="0.8" />
        {/* Rib highlight */}
        <path d="M60,90 Q80,86 104,88" stroke="white" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
        <path d="M60,96 Q80,92 104,94" stroke="white" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
        <path d="M60,102 Q80,98 104,100" stroke="white" strokeWidth="2" opacity="0.15" strokeLinecap="round" />
      </g>

      {/* Lumbar / hips */}
      <rect x="104" y="84" width="36" height="30" rx="8" fill="#232d4a" opacity="0.9" />

      {/* Glutes on heels */}
      <ellipse cx="148" cy="98" rx="20" ry="14" fill="#364060" />
      <ellipse cx="168" cy="104" rx="14" ry="10" fill="#232d4a" />
      <ellipse cx="190" cy="110" rx="16" ry="8" fill="#232d4a" opacity="0.8" />
      <ellipse cx="210" cy="118" rx="12" ry="6" fill="#232d4a" opacity="0.6" />

      {/* Thoracic expand arrow */}
      <path d="M84,76 L84,62" stroke="#3362ff" strokeWidth="2" strokeDasharray="3 2" />
      <polygon points="80,62 88,62 84,55" fill="#3362ff" />
      <text x="88" y="68" fontSize="8" fill="#3362ff" fontFamily="system-ui">Respira ↕</text>

      <text x="120" y="156" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Postura del Niño (Child's Pose)
      </text>
    </svg>
  );
}

// ─── 5. Lumbar Rotation Stretch ────────────────────────────────────────────────
export function AnimLumbarRotation() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <style>{`
        @keyframes kneesDrop {
          0%, 100% { transform: rotate(0deg);   }
          40%, 60% { transform: rotate(52deg);  }
        }
        @keyframes kneesDropOpp {
          0%, 100% { transform: rotate(0deg);   }
          40%, 60% { transform: rotate(-52deg); }
        }
        @keyframes headTurn {
          0%, 100% { transform: rotate(0deg);   }
          40%, 60% { transform: rotate(-18deg); }
        }
        .knees-l { animation: kneesDrop    4s ease-in-out infinite; transform-origin: 110px 120px; }
        .knees-r { animation: kneesDropOpp 4s ease-in-out infinite; transform-origin: 110px 120px; }
        .head-t  { animation: headTurn     4s ease-in-out infinite; transform-origin: 110px 40px; }
      `}</style>

      <ExerciseMat x={110} y={168} width={210} height={10} />

      {/* Torso flat */}
      <rect x="70" y="72" width="80" height="22" rx="8" fill="#232d4a" opacity="0.9" />
      {/* Arms spread — T position */}
      <rect x="18" y="80" width="50" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      <rect x="152" y="80" width="50" height="10" rx="5" fill="#232d4a" opacity="0.7" />
      <ellipse cx="18"  cy="85" rx="9" ry="6" fill="#364060" />
      <ellipse cx="202" cy="85" rx="9" ry="6" fill="#364060" />

      {/* Head — turning opposite */}
      <g className="head-t">
        <circle cx="110" cy="40" r="14" fill="#232d4a" />
        <rect x="103" y="53" width="14" height="20" rx="5" fill="#232d4a" />
        {/* Nose indicator */}
        <circle cx="118" cy="38" r="3" fill="white" opacity="0.5" />
      </g>

      {/* Pelvis base */}
      <ellipse cx="110" cy="112" rx="24" ry="12" fill="#364060" />

      {/* Knees — dropping left */}
      <g className="knees-l">
        <rect x="96" y="112" width="14" height="36" rx="6" fill="#3362ff" opacity="0.85" />
        <circle cx="103" cy="150" r="8" fill="#f59e0b" />
        <rect x="96" y="155" width="14" height="20" rx="6" fill="#3362ff" opacity="0.75" />
      </g>
      {/* Second knee — dropping right (opposite) for visual */}
      <g className="knees-r">
        <rect x="110" y="112" width="14" height="36" rx="6" fill="#10b981" opacity="0.85" />
        <circle cx="117" cy="150" r="8" fill="#f59e0b" />
        <rect x="110" y="155" width="14" height="20" rx="6" fill="#10b981" opacity="0.75" />
      </g>

      {/* Lumbar highlight */}
      <ellipse cx="110" cy="94" rx="16" ry="10" fill="#ef4444" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.35;0.15" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Rotation arrows */}
      <path d="M72,125 A38,38 0 0,0 72,95" fill="none" stroke="#3362ff" strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="68,95 76,95 72,88" fill="#3362ff" />
      <text x="50" y="120" fontSize="8" fill="#3362ff" fontFamily="system-ui">Rota</text>

      <text x="110" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Rotación Lumbar en Supino
      </text>
    </svg>
  );
}

// ─── 6. McKenzie Press-Up ─────────────────────────────────────────────────────
export function AnimMcKenziePress() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <style>{`
        @keyframes pressUp {
          0%, 100% { transform: translateY(0px) rotate(0deg);    }
          50%       { transform: translateY(-24px) rotate(-12deg); }
        }
        @keyframes spinePulse {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.5; }
        }
        .press-torso { animation: pressUp    2.8s ease-in-out infinite; transform-origin: 110px 130px; }
        .spine-glow  { animation: spinePulse 2.8s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={110} y={168} width={210} height={10} />

      {/* Pelvis + legs flat */}
      <rect x="80"  y="128" width="60" height="18" rx="8" fill="#232d4a" opacity="0.9" />
      <rect x="78"  y="144" width="20" height="18" rx="7" fill="#232d4a" />
      <rect x="102" y="144" width="20" height="18" rx="7" fill="#232d4a" />
      <rect x="76"  y="160" width="20" height="10" rx="5" fill="#232d4a" />
      <rect x="100" y="160" width="20" height="10" rx="5" fill="#232d4a" />

      {/* Spine line */}
      <path d="M110,128 Q110,100 110,75" stroke="#3362ff" strokeWidth="4"
        strokeDasharray="6 4" strokeLinecap="round" fill="none" className="spine-glow" />

      {/* Torso pressing up */}
      <g className="press-torso">
        <rect x="84" y="88" width="52" height="44" rx="10" fill="#3362ff" opacity="0.85" />

        {/* Arms pressing */}
        <rect x="66" y="118" width="18" height="36" rx="6" fill="#232d4a" />
        <rect x="136" y="118" width="18" height="36" rx="6" fill="#232d4a" />
        <ellipse cx="75"  cy="158" rx="10" ry="5" fill="#364060" />
        <ellipse cx="145" cy="158" rx="10" ry="5" fill="#364060" />

        {/* Head */}
        <rect x="97" y="72" width="26" height="18" rx="6" fill="#232d4a" />
        <circle cx="110" cy="58" r="14" fill="#232d4a" />
        {/* Face looking forward */}
        <circle cx="116" cy="55" r="3" fill="white" opacity="0.6" />
      </g>

      {/* Lumbar extension zone */}
      <ellipse cx="110" cy="128" rx="20" ry="10" fill="#f59e0b" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.8s" repeatCount="indefinite" />
      </ellipse>

      {/* Arrow */}
      <path d="M148,100 L162,88" fill="none" stroke="#3362ff" strokeWidth="2" strokeDasharray="3 2" />
      <polygon points="160,84 168,90 162,94" fill="#3362ff" />
      <text x="163" y="86" fontSize="8" fill="#3362ff" fontFamily="system-ui">Press Up</text>

      <text x="110" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        McKenzie Press-Up (Extensión lumbar)
      </text>
    </svg>
  );
}

// ─── 7. Supine Knee-to-Chest ──────────────────────────────────────────────────
export function AnimKneeToChest() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes kneePull {
          0%, 100% { transform: rotate(0deg);    }
          50%       { transform: rotate(-65deg);  }
        }
        @keyframes headLift {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-6px); }
        }
        .knee-pull  { animation: kneePull 2.5s ease-in-out infinite; transform-origin: 130px 102px; }
        .head-lift  { animation: headLift  2.5s ease-in-out infinite; }
      `}</style>

      <ExerciseMat x={110} y={148} width={210} height={10} />

      {/* Lying torso */}
      <rect x="18" y="84" width="90" height="20" rx="8" fill="#232d4a" opacity="0.9" />

      {/* Head lifting */}
      <g className="head-lift">
        <circle cx="12" cy="94" r="13" fill="#232d4a" />
      </g>

      {/* Arms pulling knee */}
      <rect x="70" y="84" width="12" height="30" rx="5" fill="#232d4a" opacity="0.7" />
      <rect x="88" y="84" width="12" height="30" rx="5" fill="#232d4a" opacity="0.7" />

      {/* Static leg extended */}
      <rect x="106" y="88" width="100" height="14" rx="6" fill="#232d4a" />
      <ellipse cx="210" cy="95" rx="12" ry="6" fill="#232d4a" />

      {/* Pulled knee (animated) */}
      <g className="knee-pull">
        <rect x="106" y="100" width="36" height="14" rx="6" fill="#3362ff" opacity="0.85" />
        <circle cx="142" cy="107" r="8" fill="#f59e0b" />
        <rect x="142" y="102" width="14" height="36" rx="6" fill="#3362ff" opacity="0.75" />
        <ellipse cx="149" cy="140" rx="11" ry="5" fill="#3362ff" opacity="0.7" />
      </g>

      {/* Hip/SI highlight */}
      <circle cx="106" cy="94" r="14" fill="#10b981" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Hands grip indicator */}
      <rect x="80" y="110" width="40" height="8" rx="4" fill="#364060" opacity="0.5" />

      <text x="110" y="155" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Rodilla al Pecho (Knee-to-Chest)
      </text>
    </svg>
  );
}

// ─── 8. Prone Hip Extension ───────────────────────────────────────────────────
export function AnimProneHipExtension() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <style>{`
        @keyframes hipExt {
          0%, 100% { transform: rotate(0deg);   }
          50%       { transform: rotate(-30deg); }
        }
        .hip-ext { animation: hipExt 2.2s ease-in-out infinite; transform-origin: 130px 100px; }
      `}</style>

      <ExerciseMat x={110} y={148} width={210} height={10} />

      {/* Lying prone (face down) — torso */}
      <rect x="20" y="86" width="112" height="18" rx="8" fill="#232d4a" opacity="0.9" />
      <circle cx="14" cy="95" r="12" fill="#232d4a" />

      {/* Arms under chin */}
      <rect x="24" y="82" width="50" height="8" rx="4" fill="#232d4a" opacity="0.6" />

      {/* Static leg */}
      <rect x="130" y="88" width="80" height="14" rx="6" fill="#232d4a" />
      <ellipse cx="214" cy="95" rx="11" ry="5" fill="#232d4a" />

      {/* Animated hip extension leg */}
      <g className="hip-ext">
        <rect x="130" y="102" width="72" height="14" rx="6" fill="#3362ff" opacity="0.85" />
        <ellipse cx="206" cy="109" rx="11" ry="5" fill="#3362ff" opacity="0.8" />
      </g>

      {/* Glute highlight */}
      <ellipse cx="132" cy="100" rx="16" ry="10" fill="#10b981" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2.2s" repeatCount="indefinite" />
      </ellipse>
      <text x="135" y="70" textAnchor="middle" fontSize="8" fill="#10b981" fontFamily="system-ui">Glúteo ↑</text>

      {/* Arc arrow */}
      <path d="M170,88 A30,30 0 0,1 170,118" fill="none" stroke="#3362ff" strokeWidth="2" strokeDasharray="4 3" />
      <polygon points="167,118 175,118 171,125" fill="#3362ff" />

      <text x="110" y="155" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Extensión de Cadera en Prono
      </text>
    </svg>
  );
}

// ─── Registry completo Part 3 ─────────────────────────────────────────────────
export const EXERCISE_ANIMATIONS_P3: Record<string, React.FC> = {
  "cat-cow":               AnimCatCow,
  "nerve-flossing":        AnimNerveFlossingSciatica,
  "pelvic-tilt":           AnimPelvicTilt,
  "childs-pose":           AnimChildsPose,
  "lumbar-rotation":       AnimLumbarRotation,
  "mckenzie-press":        AnimMcKenziePress,
  "knee-to-chest":         AnimKneeToChest,
  "prone-hip-extension":   AnimProneHipExtension,
};
