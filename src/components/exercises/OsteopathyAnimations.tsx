"use client";

/**
 * OsteopathyAnimations
 * ─────────────────────────────────────────────────────────────────────────────
 * Animaciones SVG para técnicas de osteopatía.
 * Cada animación muestra la posición terapeuta-paciente y el vector de fuerza.
 *
 * Categorías:
 *   🔵 Visceral  — Hígado, Intestinos, Riñón, Colon, Mesentérico
 *   🟣 Craneal   — CV4, SBS, Frontal, Temporal, Sacro craneal
 *   🟠 Estructural — HVLA Lumbar, Muscle Energy Sacro, Thrust Torácico,
 *                    Counterstrain, MET Cervical
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ══════════════════════════════════════════════════════════════════════════════
// 🔵 VISCERAL
// ══════════════════════════════════════════════════════════════════════════════

/** Hepatic Pump — bomba hepática */
export function AnimHepaticPump() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes pump { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes livPulse { 0%,100%{opacity:0.3;r:28} 50%{opacity:0.55;r:34} }
        .pump-hand { animation: pump 1.6s ease-in-out infinite; }
      `}</style>

      {/* Paciente en supino */}
      <rect x="20" y="105" width="200" height="18" rx="8" fill="#232d4a" opacity="0.85" />
      <circle cx="14" cy="114" r="13" fill="#232d4a" />

      {/* Mesa de tratamiento */}
      <rect x="10" y="122" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Hígado highlight */}
      <circle cx="148" cy="110" r="28" fill="#10b981" opacity="0.18">
        <animate attributeName="r" values="28;34;28" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.18;0.35;0.18" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <text x="148" y="84" textAnchor="middle" fontSize="8" fill="#10b981" fontFamily="system-ui" fontWeight="600">
        Hígado
      </text>

      {/* Terapeuta */}
      <circle cx="195" cy="52" r="13" fill="#364060" />
      <rect x="175" y="64" width="40" height="36" rx="8" fill="#364060" opacity="0.9" />

      {/* Manos del terapeuta — animadas */}
      <g className="pump-hand">
        <rect x="136" y="90" width="30" height="14" rx="6" fill="#3362ff" opacity="0.85" />
        <ellipse cx="130" cy="97" rx="10" ry="6" fill="#3362ff" opacity="0.75" />
        <ellipse cx="168" cy="97" rx="10" ry="6" fill="#3362ff" opacity="0.75" />
      </g>

      {/* Brazo del terapeuta */}
      <rect x="176" y="96" width="12" height="28" rx="5" fill="#364060" />
      <rect x="198" y="96" width="12" height="28" rx="5" fill="#364060" />

      {/* Vector de fuerza */}
      <path d="M151,78 L151,88" stroke="#3362ff" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
      </path>
      <polygon points="147,88 155,88 151,96" fill="#3362ff" opacity="0.8" />

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Bomba Hepática (Hepatic Pump)
      </text>
    </svg>
  );
}

/** Mesenteric Release — liberación mesentérica */
export function AnimMesentericRelease() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes slideRelease {
          0%,100%{transform:translate(0,0)} 40%{transform:translate(-12px,8px)} 80%{transform:translate(8px,-5px)}
        }
        @keyframes mesGlow { 0%,100%{opacity:0.2} 50%{opacity:0.5} }
        .mes-hands { animation: slideRelease 4s ease-in-out infinite; }
        .mes-glow   { animation: mesGlow 4s ease-in-out infinite; }
      `}</style>

      {/* Paciente supino */}
      <rect x="20" y="105" width="200" height="18" rx="8" fill="#232d4a" opacity="0.85" />
      <circle cx="14" cy="114" r="13" fill="#232d4a" />
      <rect x="10" y="122" width="220" height="7" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Mesenteric fan shape */}
      <path d="M130,115 Q108,95 90,110 Q110,80 150,88 Q170,95 148,115 Z"
        fill="#8b5cf6" opacity="0.18" className="mes-glow" />
      <text x="128" y="78" textAnchor="middle" fontSize="8" fill="#8b5cf6" fontFamily="system-ui">Mesenterio</text>

      {/* Terapeuta */}
      <circle cx="56" cy="52" r="13" fill="#364060" />
      <rect x="38" y="64" width="36" height="34" rx="8" fill="#364060" opacity="0.9" />

      {/* Manos deslizando */}
      <g className="mes-hands">
        <ellipse cx="100" cy="110" rx="18" ry="8" fill="#3362ff" opacity="0.8" />
        <rect x="72" y="104" width="22" height="12" rx="5" fill="#364060" />
        <rect x="106" y="104" width="22" height="12" rx="5" fill="#364060" />
      </g>

      {/* Brazos */}
      <rect x="50" y="95" width="12" height="22" rx="5" fill="#364060" />
      <rect x="64" y="95" width="12" height="22" rx="5" fill="#364060" />

      {/* Flechas de deslizamiento */}
      <path d="M90,100 L75,92" stroke="#3362ff" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
      <path d="M148,100 L163,92" stroke="#3362ff" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Liberación Mesentérica
      </text>
    </svg>
  );
}

/** Kidney Mobilization — movilización renal */
export function AnimKidneyMobilization() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes kidneyFloat {
          0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)}
        }
        @keyframes kidneyPulse { 0%,100%{opacity:0.25} 50%{opacity:0.5} }
        .kidney-move { animation: kidneyFloat 3s ease-in-out infinite; }
      `}</style>

      {/* Paciente lateral */}
      <rect x="30" y="95" width="180" height="22" rx="10" fill="#232d4a" opacity="0.85" />
      <circle cx="24" cy="106" r="14" fill="#232d4a" />
      <rect x="20" y="116" width="200" height="7" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Riñón */}
      <g className="kidney-move">
        <ellipse cx="145" cy="100" rx="22" ry="14" fill="#ec4899" opacity="0.3" />
        <ellipse cx="145" cy="100" rx="14" ry="9" fill="#ec4899" opacity="0.4" />
        <text x="145" y="77" textAnchor="middle" fontSize="8" fill="#ec4899" fontFamily="system-ui">Riñón</text>
      </g>

      {/* Terapeuta detrás */}
      <circle cx="205" cy="48" r="13" fill="#364060" />
      <rect x="186" y="60" width="38" height="34" rx="8" fill="#364060" opacity="0.9" />

      {/* Manos anterior + posterior */}
      <ellipse cx="110" cy="104" rx="16" ry="7" fill="#3362ff" opacity="0.7" />
      <ellipse cx="172" cy="100" rx="16" ry="7" fill="#3362ff" opacity="0.7" />

      {/* Pinzamiento bimanual */}
      <path d="M125,104 L155,102" stroke="#3362ff" strokeWidth="2" strokeDasharray="4 3" fill="none" />
      <text x="120" y="72" textAnchor="middle" fontSize="8" fill="#3362ff" fontFamily="system-ui">← Bimanual →</text>

      {/* Brazos del terapeuta */}
      <rect x="188" y="92" width="12" height="22" rx="5" fill="#364060" />
      <rect x="200" y="92" width="12" height="22" rx="5" fill="#364060" />

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Movilización Renal (Bimanual)
      </text>
    </svg>
  );
}

/** Colon Release — liberación del colon */
export function AnimColonRelease() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes colonWave {
          0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(1.05) scaleY(0.95)}
          66%{transform:scaleX(0.97) scaleY(1.04)} 100%{transform:scaleX(1) scaleY(1)}
        }
        .colon-move { animation: colonWave 3s ease-in-out infinite; transform-origin: 120px 105px; }
      `}</style>

      <rect x="20" y="105" width="200" height="18" rx="8" fill="#232d4a" opacity="0.85" />
      <circle cx="14" cy="114" r="13" fill="#232d4a" />
      <rect x="10" y="122" width="220" height="7" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Colon path */}
      <g className="colon-move">
        <path d="M80,92 Q80,75 100,75 Q140,75 160,75 Q178,75 178,92 Q178,115 158,115 Q140,115 140,130 Q140,140 120,140 Q100,140 100,130 Q100,115 80,115 Q62,115 62,98 Q62,82 80,82"
          fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
      </g>
      <text x="120" y="68" textAnchor="middle" fontSize="8" fill="#f97316" fontFamily="system-ui">Colon</text>

      {/* Terapeuta */}
      <circle cx="50" cy="46" r="13" fill="#364060" />
      <rect x="32" y="58" width="36" height="34" rx="8" fill="#364060" opacity="0.9" />

      {/* Manos sobre el colon */}
      <ellipse cx="80" cy="106" rx="18" ry="8" fill="#3362ff" opacity="0.75" />
      <ellipse cx="160" cy="106" rx="18" ry="8" fill="#3362ff" opacity="0.75" />

      {/* Brazos */}
      <rect x="36" y="90" width="12" height="22" rx="5" fill="#364060" />
      <rect x="50" y="90" width="12" height="22" rx="5" fill="#364060" />

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Liberación del Colon
      </text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 🟣 CRANEAL
// ══════════════════════════════════════════════════════════════════════════════

/** CV4 — compresión del 4° ventrículo */
export function AnimCV4() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes cranialRhythm {
          0%,100%{transform:scale(1)}
          25%{transform:scale(1.025)}
          75%{transform:scale(0.978)}
        }
        @keyframes stillPoint {
          0%,60%{opacity:0.6}
          65%,85%{opacity:0.15}
          90%,100%{opacity:0.6}
        }
        .cranium { animation: cranialRhythm 8s ease-in-out infinite; transform-origin: 120px 72px; }
        .still   { animation: stillPoint 8s ease-in-out infinite; }
      `}</style>

      {/* Mesa */}
      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Paciente supino — cabeza */}
      <g className="cranium">
        <ellipse cx="120" cy="72" rx="46" ry="38" fill="#232d4a" opacity="0.9" />
        {/* Cerebro */}
        <ellipse cx="120" cy="68" rx="32" ry="26" fill="#364060" opacity="0.5" />
        {/* 4th ventricle */}
        <ellipse cx="120" cy="80" rx="10" ry="8" fill="#3362ff" opacity="0.5" className="still" />
        <text x="120" y="83" textAnchor="middle" fontSize="6" fill="#93c5fd" fontFamily="system-ui">V4</text>
      </g>

      {/* Cuello */}
      <rect x="108" y="108" width="24" height="20" rx="6" fill="#232d4a" opacity="0.8" />

      {/* Manos del terapeuta bajo el occipital */}
      <ellipse cx="88" cy="106" rx="20" ry="8" fill="#3362ff" opacity="0.7" />
      <ellipse cx="152" cy="106" rx="20" ry="8" fill="#3362ff" opacity="0.7" />

      {/* Manos juntas bajo occipital */}
      <text x="120" y="120" textAnchor="middle" fontSize="8" fill="#3362ff" fontFamily="system-ui">
        Thenar → Occipital
      </text>

      {/* Pulso craneal animado */}
      <circle cx="120" cy="72" r="50" fill="none" stroke="#8b5cf6" strokeWidth="2"
        strokeDasharray="6 4" opacity="0.4">
        <animate attributeName="r" values="50;56;50" dur="8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* Terapeuta sentado detrás (minimalista) */}
      <circle cx="120" cy="152" r="12" fill="#364060" />

      {/* Legend */}
      <text x="45" y="38" fontSize="8" fill="#8b5cf6" fontFamily="system-ui">Ritmo primario</text>
      <text x="45" y="50" fontSize="8" fill="#3362ff" fontFamily="system-ui">→ Still point</text>

      <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        CV4 — Compresión del 4° Ventrículo
      </text>
    </svg>
  );
}

/** SBS — Sínfisis esfenobailar */
export function AnimSBS() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes sbsFlex {
          0%,100%{transform:rotate(0deg)}
          33%{transform:rotate(2.5deg)}
          66%{transform:rotate(-2.5deg)}
        }
        @keyframes sbsExt {
          0%,100%{transform:rotate(0deg)}
          33%{transform:rotate(-2.5deg)}
          66%{transform:rotate(2.5deg)}
        }
        .sphenoid { animation: sbsFlex 6s ease-in-out infinite; transform-origin: 100px 70px; }
        .occiput  { animation: sbsExt  6s ease-in-out infinite; transform-origin: 140px 70px; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Cráneo base */}
      <ellipse cx="120" cy="72" rx="46" ry="38" fill="#232d4a" opacity="0.85" />

      {/* Esfenoides — parte anterior */}
      <g className="sphenoid">
        <ellipse cx="96" cy="72" rx="28" ry="24" fill="#3362ff" opacity="0.35" />
        <text x="90" y="64" fontSize="7" fill="#93c5fd" fontFamily="system-ui" fontWeight="600">Esfenoides</text>
      </g>

      {/* Occipital — parte posterior */}
      <g className="occiput">
        <ellipse cx="144" cy="72" rx="28" ry="24" fill="#8b5cf6" opacity="0.35" />
        <text x="138" y="90" fontSize="7" fill="#c4b5fd" fontFamily="system-ui" fontWeight="600">Occipital</text>
      </g>

      {/* Línea SBS */}
      <path d="M120,50 L120,95" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
      <text x="124" y="76" fontSize="7" fill="#f59e0b" fontFamily="system-ui" fontWeight="600">SBS</text>

      {/* Cuello */}
      <rect x="108" y="108" width="24" height="20" rx="6" fill="#232d4a" opacity="0.8" />

      {/* Manos laterales terapeuta */}
      <ellipse cx="68" cy="72" rx="14" ry="8" fill="#3362ff" opacity="0.6" />
      <ellipse cx="172" cy="72" rx="14" ry="8" fill="#8b5cf6" opacity="0.6" />
      <text x="46" y="76" fontSize="7" fill="#3362ff" fontFamily="system-ui">Temporal</text>
      <text x="164" y="76" fontSize="7" fill="#8b5cf6" fontFamily="system-ui">Temporal</text>

      {/* Terapeuta */}
      <circle cx="120" cy="150" r="12" fill="#364060" />

      <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Evaluación SBS (Sínfisis Esfeno-Basilar)
      </text>
    </svg>
  );
}

/** Frontal Lift — elevación del frontal */
export function AnimFrontalLift() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes frontalRise {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-4px)}
        }
        .frontal { animation: frontalRise 5s ease-in-out infinite; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />
      <rect x="108" y="110" width="24" height="22" rx="6" fill="#232d4a" opacity="0.8" />

      {/* Cráneo base */}
      <ellipse cx="120" cy="74" rx="46" ry="38" fill="#232d4a" opacity="0.85" />

      {/* Frontal */}
      <g className="frontal">
        <path d="M76,58 Q90,44 120,42 Q150,44 164,58 Q140,50 120,50 Q100,50 76,58 Z"
          fill="#f59e0b" opacity="0.45" />
        <path d="M76,58 Q90,44 120,42 Q150,44 164,58"
          fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <text x="120" y="52" textAnchor="middle" fontSize="7" fill="#f59e0b" fontFamily="system-ui" fontWeight="600">Frontal</text>
      </g>

      {/* Pulgares sobre frontal */}
      <ellipse cx="100" cy="56" rx="12" ry="6" fill="#3362ff" opacity="0.7" className="frontal" />
      <ellipse cx="140" cy="56" rx="12" ry="6" fill="#3362ff" opacity="0.7" className="frontal" />

      {/* Dirección del lift */}
      <path d="M120,44 L120,32" stroke="#3362ff" strokeWidth="2" strokeDasharray="3 2" className="frontal" />
      <polygon points="116,32 124,32 120,25" fill="#3362ff" className="frontal" />

      {/* Terapeuta */}
      <circle cx="120" cy="150" r="12" fill="#364060" />

      {/* Face features */}
      <circle cx="108" cy="78" r="3" fill="#364060" opacity="0.6" />
      <circle cx="132" cy="78" r="3" fill="#364060" opacity="0.6" />
      <path d="M112,92 Q120,98 128,92" stroke="#364060" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

      <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Elevación del Frontal
      </text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 🟠 ESTRUCTURAL
// ══════════════════════════════════════════════════════════════════════════════

/** HVLA Lumbar Roll — thrust lumbar */
export function AnimHVLALumbarRoll() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes hvlaThrust {
          0%,85%,100%{transform:rotate(0deg)}
          90%{transform:rotate(18deg)}
          95%{transform:rotate(-5deg)}
        }
        @keyframes flashImpact {
          0%,85%,100%{opacity:0}
          90%,94%{opacity:1}
        }
        .hvla-twist { animation: hvlaThrust 3s ease-in-out infinite; transform-origin: 120px 110px; }
        .impact     { animation: flashImpact 3s ease-in-out infinite; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Paciente en decúbito lateral */}
      <g className="hvla-twist">
        <rect x="50" y="100" width="140" height="20" rx="9" fill="#232d4a" opacity="0.85" />
        {/* Pelvis */}
        <ellipse cx="165" cy="110" rx="22" ry="14" fill="#364060" />
        {/* Piernas */}
        <rect x="170" y="105" width="44" height="13" rx="6" fill="#232d4a" />
        <rect x="170" y="116" width="44" height="12" rx="5" fill="#232d4a" opacity="0.8" />
      </g>
      {/* Cabeza */}
      <circle cx="46" cy="110" r="14" fill="#232d4a" />

      {/* Flash de impacto */}
      <circle cx="135" cy="110" r="16" fill="#f59e0b" className="impact" opacity="0" />

      {/* Terapeuta — manos en posición */}
      <circle cx="120" cy="44" r="13" fill="#364060" />
      <rect x="102" y="56" width="36" height="32" rx="8" fill="#364060" opacity="0.9" />

      {/* Mano anterior (hombro) */}
      <ellipse cx="80" cy="106" rx="20" ry="9" fill="#3362ff" opacity="0.75" />
      {/* Mano posterior (pelvis) */}
      <ellipse cx="164" cy="106" rx="20" ry="9" fill="#3362ff" opacity="0.75" />

      {/* Brazos del terapeuta */}
      <rect x="106" y="86" width="10" height="24" rx="4" fill="#364060" />
      <rect x="124" y="86" width="10" height="24" rx="4" fill="#364060" />

      {/* Flecha de HVLA */}
      <text x="160" y="80" fontSize="8" fill="#ef4444" fontFamily="system-ui" fontWeight="700">HVLA →</text>
      <path d="M158,84 L168,92" stroke="#ef4444" strokeWidth="2" fill="none" />

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        HVLA — Thrust Lumbar en Roll
      </text>
    </svg>
  );
}

/** Muscle Energy Sacrum — MET sacro */
export function AnimMuscleEnergySacrum() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes contract {
          0%,100%{transform:rotate(0deg)}
          40%,60%{transform:rotate(-12deg)}
        }
        @keyframes counterforce {
          0%,100%{transform:translateX(0)}
          40%,60%{transform:translateX(-8px)}
        }
        .leg-contract  { animation: contract     3s ease-in-out infinite; transform-origin: 140px 126px; }
        .hand-counter  { animation: counterforce 3s ease-in-out infinite; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Paciente prono */}
      <rect x="20" y="100" width="155" height="20" rx="9" fill="#232d4a" opacity="0.85" />
      <circle cx="14" cy="110" r="13" fill="#232d4a" />
      <rect x="20" y="118" width="155" height="6" rx="3" fill="#9ba5be" opacity="0.2" />

      {/* Sacro highlight */}
      <ellipse cx="138" cy="110" rx="18" ry="10" fill="#f59e0b" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <text x="140" y="90" textAnchor="middle" fontSize="8" fill="#f59e0b" fontFamily="system-ui">Sacro</text>

      {/* Pierna contraída */}
      <g className="leg-contract">
        <rect x="144" y="100" width="14" height="44" rx="6" fill="#3362ff" opacity="0.85" />
        <circle cx="151" cy="146" r="8" fill="#8b5cf6" />
        <rect x="144" y="152" width="14" height="18" rx="5" fill="#3362ff" opacity="0.75" />
      </g>

      {/* Segunda pierna estática */}
      <rect x="120" y="118" width="14" height="30" rx="6" fill="#232d4a" />

      {/* Mano del terapeuta — contrafuerza en talón */}
      <g className="hand-counter">
        <ellipse cx="180" cy="145" rx="20" ry="8" fill="#3362ff" opacity="0.7" />
      </g>

      {/* Terapeuta */}
      <circle cx="204" cy="64" r="13" fill="#364060" />
      <rect x="186" y="76" width="36" height="30" rx="8" fill="#364060" opacity="0.9" />
      <rect x="190" y="104" width="10" height="34" rx="4" fill="#364060" />
      <rect x="202" y="104" width="10" height="34" rx="4" fill="#364060" />

      {/* Labels */}
      <text x="190" y="130" fontSize="7" fill="#3362ff" fontFamily="system-ui">← Contrafuerza</text>
      <text x="155" y="100" fontSize="7" fill="#8b5cf6" fontFamily="system-ui">Contracción</text>

      <text x="110" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        MET — Muscle Energy para Sacro
      </text>
    </svg>
  );
}

/** Thoracic Thrust — thrust torácico */
export function AnimThoracicThrust() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes thrustDown {
          0%,80%,100%{transform:translateY(0)}
          88%{transform:translateY(14px)}
          94%{transform:translateY(-4px)}
        }
        @keyframes impactFlash {
          0%,80%,100%{opacity:0}
          88%,92%{opacity:0.9}
        }
        .thrust-hands { animation: thrustDown  3s ease-in-out infinite; }
        .impact-ring  { animation: impactFlash 3s ease-in-out infinite; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Paciente supino */}
      <rect x="20" y="100" width="200" height="20" rx="9" fill="#232d4a" opacity="0.85" />
      <circle cx="14" cy="110" r="13" fill="#232d4a" />

      {/* Mesa */}
      <rect x="10" y="118" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.4" />

      {/* Torácica highlight */}
      <rect x="85" y="92" width="70" height="28" rx="8" fill="#3362ff" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
      </rect>
      <text x="120" y="85" textAnchor="middle" fontSize="8" fill="#3362ff" fontFamily="system-ui">T4–T8</text>

      {/* Flash de impacto */}
      <circle cx="120" cy="108" r="22" fill="none" stroke="#f59e0b" strokeWidth="3"
        className="impact-ring" opacity="0" />

      {/* Terapeuta sobre el paciente */}
      <circle cx="120" cy="44" r="13" fill="#364060" />
      <rect x="102" y="56" width="36" height="28" rx="8" fill="#364060" opacity="0.9" />

      {/* Manos del terapeuta */}
      <g className="thrust-hands">
        <rect x="96" y="82" width="48" height="16" rx="7" fill="#3362ff" opacity="0.85" />
        <ellipse cx="120" cy="90" rx="30" ry="8" fill="#3362ff" opacity="0.6" />
      </g>

      {/* Brazo vector fuerza */}
      <path d="M120,68 L120,80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
        fill="none" className="thrust-hands" />
      <polygon points="115,80 125,80 120,88" fill="#ef4444" className="thrust-hands" />

      {/* Arms */}
      <rect x="108" y="82" width="10" height="8" rx="4" fill="#364060" />
      <rect x="122" y="82" width="10" height="8" rx="4" fill="#364060" />

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Thrust Torácico (HVLA Anterior)
      </text>
    </svg>
  );
}

/** Counterstrain — tensión y contratensión */
export function AnimCounterstrain() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes positionFind {
          0%,100%{transform:rotate(0deg)}
          20%,40%{transform:rotate(-8deg)}
          60%,80%{transform:rotate(4deg)}
        }
        @keyframes tenderPulse {
          0%,100%{opacity:0.3;r:8}
          50%{opacity:0.7;r:12}
        }
        .position-body { animation: positionFind 6s ease-in-out infinite; transform-origin: 110px 110px; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Paciente supino */}
      <g className="position-body">
        <rect x="30" y="100" width="175" height="20" rx="9" fill="#232d4a" opacity="0.85" />
        {/* Piernas en posición de comfort */}
        <rect x="155" y="100" width="50" height="12" rx="5" fill="#232d4a" />
        <rect x="155" y="110" width="44" height="10" rx="5" fill="#232d4a" opacity="0.8" />
      </g>
      <circle cx="24" cy="110" r="13" fill="#232d4a" />

      {/* Tender point */}
      <circle cx="108" cy="107" r="8" fill="#ef4444" opacity="0.3">
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="108" y="88" textAnchor="middle" fontSize="7" fill="#ef4444" fontFamily="system-ui">Tender point</text>

      {/* Terapeuta */}
      <circle cx="196" cy="52" r="13" fill="#364060" />
      <rect x="178" y="64" width="36" height="30" rx="8" fill="#364060" opacity="0.9" />

      {/* Mano monitorizando */}
      <ellipse cx="108" cy="106" rx="16" ry="7" fill="#3362ff" opacity="0.6" />
      <rect x="180" y="92" width="10" height="22" rx="4" fill="#364060" />
      <rect x="192" y="92" width="10" height="22" rx="4" fill="#364060" />

      {/* Legend */}
      <rect x="32" y="30" width="80" height="34" rx="6" fill="#232d4a" opacity="0.6" />
      <text x="72" y="44" textAnchor="middle" fontSize="7" fill="#10b981" fontFamily="system-ui">1. Posición comfort</text>
      <text x="72" y="54" textAnchor="middle" fontSize="7" fill="#10b981" fontFamily="system-ui">2. Monitor 90s</text>
      <text x="72" y="64" textAnchor="middle" fontSize="7" fill="#10b981" fontFamily="system-ui">3. Retorno lento</text>

      <text x="120" y="168" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        Counterstrain — Tensión y Contratensión
      </text>
    </svg>
  );
}

/** MET Cervical — muscle energy cervical */
export function AnimMETCervical() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <style>{`
        @keyframes headRotate {
          0%,100%{transform:rotate(0deg)}
          30%,70%{transform:rotate(18deg)}
        }
        @keyframes handResist {
          0%,100%{transform:translateX(0)}
          30%,70%{transform:translateX(10px)}
        }
        .head-rotate  { animation: headRotate 4s ease-in-out infinite; transform-origin: 120px 72px; }
        .hand-resist  { animation: handResist 4s ease-in-out infinite; }
      `}</style>

      <rect x="10" y="148" width="220" height="8" rx="3" fill="#9ba5be" opacity="0.3" />

      {/* Torso sentado */}
      <rect x="86" y="110" width="68" height="38" rx="10" fill="#232d4a" opacity="0.85" />

      {/* Cabeza — rotación */}
      <g className="head-rotate">
        <rect x="104" y="88" width="32" height="24" rx="6" fill="#232d4a" opacity="0.85" />
        <circle cx="120" cy="68" r="22" fill="#232d4a" opacity="0.9" />
        {/* Nariz indicadora */}
        <circle cx="130" cy="65" r="3.5" fill="#364060" opacity="0.7" />
      </g>

      {/* Terapeuta detrás */}
      <circle cx="120" cy="150" r="12" fill="#364060" />

      {/* Mano del terapeuta resistiendo la rotación */}
      <g className="hand-resist">
        <ellipse cx="148" cy="68" rx="16" ry="9" fill="#3362ff" opacity="0.75" />
      </g>

      {/* Mano estabilizando hombro */}
      <ellipse cx="84" cy="118" rx="18" ry="7" fill="#364060" opacity="0.6" />

      {/* Flecha de contrafuerza */}
      <text x="172" y="60" fontSize="7" fill="#3362ff" fontFamily="system-ui">← Resistencia</text>
      <text x="172" y="70" fontSize="7" fill="#ef4444" fontFamily="system-ui">→ Contracción</text>

      {/* Cervical highlight */}
      <rect x="110" y="88" width="20" height="24" rx="5" fill="#f59e0b" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
      </rect>

      <text x="120" y="175" textAnchor="middle" fontSize="9" fill="#6b7899" fontFamily="system-ui">
        MET Cervical — Muscle Energy
      </text>
    </svg>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────
export const OSTEOPATHY_ANIMATIONS: Record<string, React.FC> = {
  // Visceral
  "hepatic-pump":         AnimHepaticPump,
  "mesenteric-release":   AnimMesentericRelease,
  "kidney-mobilization":  AnimKidneyMobilization,
  "colon-release":        AnimColonRelease,
  // Craneal
  "cv4":                  AnimCV4,
  "sbs":                  AnimSBS,
  "frontal-lift":         AnimFrontalLift,
  // Estructural
  "hvla-lumbar-roll":     AnimHVLALumbarRoll,
  "met-sacrum":           AnimMuscleEnergySacrum,
  "thoracic-thrust":      AnimThoracicThrust,
  "counterstrain":        AnimCounterstrain,
  "met-cervical":         AnimMETCervical,
};
