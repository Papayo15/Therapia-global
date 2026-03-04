"use client";

/**
 * OsteopathyAnimations — 12 techniques
 * "Thera" patient + therapist hands for manual therapy techniques.
 * Each animation shows the therapist's contact point and movement clearly.
 */

import { C, Face } from "./ExerciseCharacter";

// Therapist colors (slightly different from patient)
const T = {
  skin:  "#FBBF8A",
  shirt: "#6366F1",  // indigo — therapist wears different color
  pants: "#1E3A5F",
  shoes: "#1C1C1E",
  hand:  "#FBBF8A",
  contact: "#F59E0B",   // amber — contact point
  arrow: "#3B82F6",
};

function Mat() { return <rect x="20" y="150" width="180" height="10" rx="5" fill="#A7F3D0" />; }

// Therapist hands
function TherapistHand({ cx, cy, angle = 0 }: { cx: number; cy: number; angle?: number }) {
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx="14" ry="9" fill={T.skin} stroke={T.contact} strokeWidth="2" />
      <line x1={cx - 8} y1={cy - 3} x2={cx - 14} y2={cy - 8} stroke={T.skin} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

// Contact indicator (pulsing circle)
function ContactPulse({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <style>{`
        @keyframes pulse_contact { 0%,100%{r:10;opacity:0.6} 50%{r:16;opacity:0.2} }
      `}</style>
      <circle cx={cx} cy={cy} r="10" fill={T.contact} opacity="0.5">
        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="5" fill={T.contact} opacity="0.9" />
    </g>
  );
}

// Supine patient body
function SupinePatient({ label }: { label?: string }) {
  return (
    <g>
      <circle cx="22" cy="118" r="14" fill={C.skin} />
      <ellipse cx="22" cy="110" rx="13" ry="8" fill={C.hair} />
      <circle cx="17" cy="116" r="2" fill="#1C1C1E" />
      <circle cx="27" cy="116" r="2" fill="#1C1C1E" />
      <path d="M18,124 Q22,128 26,124" stroke="#1C1C1E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <line x1="36" y1="118" x2="160" y2="118" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <line x1="160" y1="118" x2="175" y2="118" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="183" cy="118" rx="14" ry="6" fill={C.shoes} />
    </g>
  );
}

// ─── 1. Hepatic Pump ──────────────────────────────────────────────────────────
export function AnimHepaticPump() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes hp_hand { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .hp-hand { animation:hp_hand 1.8s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* Liver area — right upper abdomen */}
      <rect x="95" y="108" width="40" height="18" rx="6" fill="#FDE68A" opacity="0.5" />
      <text x="115" y="120" textAnchor="middle" fontSize="7" fontWeight="700" fill="#92400E">Hígado</text>
      {/* Therapist hands */}
      <g className="hp-hand">
        <TherapistHand cx={115} cy={102} />
        <TherapistHand cx={115} cy={90} />
      </g>
      <ContactPulse cx={115} cy={108} />
      {/* Therapist silhouette (standing) */}
      <line x1="115" y1="70" x2="115" y2="30" stroke={T.shirt} strokeWidth="14" strokeLinecap="round" />
      <circle cx="115" cy="22" r="11" fill={T.skin} />
      <ellipse cx="115" cy="16" rx="10" ry="7" fill={T.shoes} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Bomba Hepática</text>
    </svg>
  );
}

// ─── 2. Mesenteric Release ────────────────────────────────────────────────────
export function AnimMesentericRelease() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes mr_hands { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(5deg)} }
        .mr-hands { animation:mr_hands 3s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* Abdomen/mesentery area */}
      <ellipse cx="100" cy="115" rx="32" ry="14" fill="#FDE68A" opacity="0.4" />
      <text x="100" y="118" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#92400E">Mesenterio</text>
      <g className="mr-hands">
        <TherapistHand cx={88} cy={104} angle={-15} />
        <TherapistHand cx={112} cy={104} angle={15} />
      </g>
      <ContactPulse cx={100} cy={114} />
      <line x1="100" y1="78" x2="100" y2="35" stroke={T.shirt} strokeWidth="14" strokeLinecap="round" />
      <circle cx="100" cy="26" r="11" fill={T.skin} />
      <ellipse cx="100" cy="20" rx="10" ry="7" fill={T.shoes} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Release Mesentérico</text>
    </svg>
  );
}

// ─── 3. Kidney Mobilization ───────────────────────────────────────────────────
export function AnimKidneyMobilization() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes km { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} 80%{transform:translateY(0)} }
        .km-hand { animation:km 2.5s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* Kidney zones */}
      <ellipse cx="90" cy="114" rx="14" ry="10" fill="#A78BFA" opacity="0.4" />
      <ellipse cx="130" cy="114" rx="14" ry="10" fill="#A78BFA" opacity="0.4" />
      <text x="90" y="117" textAnchor="middle" fontSize="6" fontWeight="700" fill="#5B21B6">Riñón</text>
      <text x="130" y="117" textAnchor="middle" fontSize="6" fontWeight="700" fill="#5B21B6">Riñón</text>
      <g className="km-hand">
        <TherapistHand cx={90} cy={102} />
        <TherapistHand cx={130} cy={102} />
      </g>
      <ContactPulse cx={90} cy={113} />
      <ContactPulse cx={130} cy={113} />
      <line x1="110" y1="76" x2="110" y2="33" stroke={T.shirt} strokeWidth="14" strokeLinecap="round" />
      <circle cx="110" cy="24" r="11" fill={T.skin} />
      <ellipse cx="110" cy="18" rx="10" ry="7" fill={T.shoes} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Movilización Renal</text>
    </svg>
  );
}

// ─── 4. Colon Release ─────────────────────────────────────────────────────────
export function AnimColonRelease() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes cr { 0%{cx:75px} 25%{cx:120px} 50%{cx:145px} 75%{cx:100px} 100%{cx:75px} }
        @keyframes cr_hand { 0%{transform:translateX(0)} 25%{transform:translateX(45px)} 50%{transform:translateX(70px)} 75%{transform:translateX(25px)} 100%{transform:translateX(0)} }
        .cr-hand { animation:cr_hand 5s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* Colon path sketch */}
      <path d="M75,125 L75,105 Q75,100 80,100 L145,100 Q150,100 150,105 L150,125" stroke="#FDE68A" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.6" />
      <text x="112" y="98" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#92400E">Colon</text>
      <g className="cr-hand">
        <TherapistHand cx={75} cy={104} />
      </g>
      <line x1="85" y1="78" x2="85" y2="35" stroke={T.shirt} strokeWidth="14" strokeLinecap="round" />
      <circle cx="85" cy="26" r="11" fill={T.skin} />
      <ellipse cx="85" cy="20" rx="10" ry="7" fill={T.shoes} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Release de Colon</text>
    </svg>
  );
}

// ─── 5. CV4 (Cranial) ─────────────────────────────────────────────────────────
export function AnimCV4() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes cv4_head { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        .cv4-head { animation:cv4_head 5s ease-in-out infinite; transform-origin:40px 115px; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <line x1="55" y1="118" x2="180" y2="118" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <line x1="180" y1="118" x2="196" y2="118" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="204" cy="118" rx="12" ry="6" fill={C.shoes} />
      {/* Animated head */}
      <g className="cv4-head">
        <circle cx="40" cy="115" r="17" fill={C.skin} />
        <ellipse cx="40" cy="106" rx="16" ry="10" fill={C.hair} />
        <circle cx="35" cy="113" r="2.5" fill="#1C1C1E" />
        <circle cx="45" cy="113" r="2.5" fill="#1C1C1E" />
        <path d="M36,122 Q40,126 44,122" stroke="#1C1C1E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
      {/* Therapist cupping occiput */}
      <TherapistHand cx={22} cy={118} angle={0} />
      <TherapistHand cx={58} cy={118} angle={180} />
      <ContactPulse cx={40} cy={118} />
      <text x="40" y="108" textAnchor="middle" fontSize="6" fontWeight="700" fill="#1D4ED8">CV4</text>
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>CV4 — Compresión 4to Ventrículo</text>
    </svg>
  );
}

// ─── 6. SBS (Sphenobasilar) ───────────────────────────────────────────────────
export function AnimSBS() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes sbs { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(2deg)} }
        .sbs-head { animation:sbs 6s ease-in-out infinite; transform-origin:40px 115px; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <line x1="55" y1="118" x2="195" y2="118" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <ellipse cx="205" cy="118" rx="12" ry="6" fill={C.shoes} />
      <g className="sbs-head">
        <circle cx="40" cy="115" r="17" fill={C.skin} />
        <ellipse cx="40" cy="106" rx="16" ry="10" fill={C.hair} />
        <circle cx="35" cy="113" r="2.5" fill="#1C1C1E" />
        <circle cx="45" cy="113" r="2.5" fill="#1C1C1E" />
        {/* SBS suture lines */}
        <line x1="35" y1="108" x2="40" y2="115" stroke="#6366F1" strokeWidth="1.5" opacity="0.7" />
        <line x1="45" y1="108" x2="40" y2="115" stroke="#6366F1" strokeWidth="1.5" opacity="0.7" />
      </g>
      <TherapistHand cx={18} cy={116} angle={0} />
      <TherapistHand cx={62} cy={116} angle={180} />
      <ContactPulse cx={40} cy={115} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>SBS — Sínfisis Esfenobasilar</text>
    </svg>
  );
}

// ─── 7. Frontal Lift ──────────────────────────────────────────────────────────
export function AnimFrontalLift() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes fl { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .fl-hand { animation:fl 4s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <line x1="55" y1="118" x2="195" y2="118" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <ellipse cx="205" cy="118" rx="12" ry="6" fill={C.shoes} />
      <circle cx="40" cy="115" r="17" fill={C.skin} />
      <ellipse cx="40" cy="106" rx="16" ry="10" fill={C.hair} />
      <circle cx="35" cy="113" r="2.5" fill="#1C1C1E" />
      <circle cx="45" cy="113" r="2.5" fill="#1C1C1E" />
      {/* Frontal bone highlight */}
      <rect x="28" y="104" width="24" height="8" rx="4" fill="#FDE68A" opacity="0.7" />
      <text x="40" y="110" textAnchor="middle" fontSize="6" fontWeight="700" fill="#92400E">Frontal</text>
      <g className="fl-hand">
        <ellipse cx="40" cy="99" rx="20" ry="7" fill={T.skin} opacity="0.9" stroke={T.contact} strokeWidth="1.5" />
      </g>
      <ContactPulse cx={40} cy={105} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Lift Frontal</text>
    </svg>
  );
}

// ─── 8. HVLA Lumbar Roll ──────────────────────────────────────────────────────
export function AnimHVLALumbarRoll() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes hvla { 0%,100%{transform:rotate(0deg)} 45%{transform:rotate(8deg)} 55%{transform:rotate(8deg)} 60%{transform:rotate(-2deg)} 100%{transform:rotate(0deg)} }
        .hvla-body { animation:hvla 4s ease-in-out infinite; transform-origin:110px 128px; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      {/* Side-lying patient */}
      <g className="hvla-body">
        <circle cx="28" cy="115" r="14" fill={C.skin} />
        <ellipse cx="28" cy="108" rx="13" ry="8" fill={C.hair} />
        <circle cx="23" cy="113" r="2" fill="#1C1C1E" />
        <circle cx="33" cy="113" r="2" fill="#1C1C1E" />
        <line x1="42" y1="116" x2="105" y2="120" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
        <rect x="105" y="114" width="40" height="14" rx="6" fill={C.highlight} opacity="0.5" />
        <line x1="142" y1="120" x2="185" y2="135" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
        <line x1="130" y1="120" x2="160" y2="148" stroke={C.pants} strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="190" cy="138" rx="12" ry="5" fill={C.shoes} />
        <ellipse cx="164" cy="152" rx="12" ry="5" fill={C.shoes} />
      </g>
      {/* Therapist hands on pelvis/lumbar */}
      <TherapistHand cx={118} cy={108} />
      <TherapistHand cx={118} cy={130} angle={180} />
      <ContactPulse cx={118} cy={118} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>HVLA Lumbar Roll</text>
    </svg>
  );
}

// ─── 9. Muscle Energy Sacrum ──────────────────────────────────────────────────
export function AnimMuscleEnergySacrum() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes mes { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .mes-sacrum { animation:mes 3s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* Sacrum area */}
      <rect x="88" y="128" width="44" height="16" rx="7" fill="#FDE68A" opacity="0.5" />
      <text x="110" y="139" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#92400E">Sacro</text>
      <g className="mes-sacrum">
        <TherapistHand cx={98} cy={118} angle={-10} />
        <TherapistHand cx={122} cy={118} angle={10} />
      </g>
      <ContactPulse cx={110} cy={128} />
      <line x1="110" y1="92" x2="110" y2="50" stroke={T.shirt} strokeWidth="14" strokeLinecap="round" />
      <circle cx="110" cy="41" r="11" fill={T.skin} />
      <ellipse cx="110" cy="35" rx="10" ry="7" fill={T.shoes} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Energía Muscular — Sacro</text>
    </svg>
  );
}

// ─── 10. Thoracic Thrust ──────────────────────────────────────────────────────
export function AnimThoracicThrust() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes tt { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-6px)} 55%{transform:translateY(-6px)} 62%{transform:translateY(0)} }
        .tt-thrust { animation:tt 3.5s ease-in-out infinite; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* Thoracic spine */}
      <rect x="60" y="108" width="80" height="14" rx="5" fill="#A5F3FC" opacity="0.5" />
      <text x="100" y="118" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#0E7490">T4-T6</text>
      <g className="tt-thrust">
        <TherapistHand cx={80} cy={100} angle={-20} />
        <TherapistHand cx={120} cy={100} angle={20} />
        {/* Impulse indicator */}
        <text x="100" y="94" textAnchor="middle" fontSize="14" fill={T.contact} opacity="0.8">↓</text>
      </g>
      <ContactPulse cx={100} cy={108} />
      <line x1="100" y1="75" x2="100" y2="35" stroke={T.shirt} strokeWidth="14" strokeLinecap="round" />
      <circle cx="100" cy="26" r="11" fill={T.skin} />
      <ellipse cx="100" cy="20" rx="10" ry="7" fill={T.shoes} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Thrust Torácico</text>
    </svg>
  );
}

// ─── 11. Counterstrain ────────────────────────────────────────────────────────
export function AnimCounterstrain() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes cs2 { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(10deg)} }
        .cs2-leg { animation:cs2 4s ease-in-out infinite; transform-origin:165px 118px; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <SupinePatient />
      {/* One leg in flexion (counterstrain position) */}
      <g className="cs2-leg">
        <line x1="165" y1="118" x2="175" y2="152" stroke={C.pants} strokeWidth="16" strokeLinecap="round" />
        <circle cx="175" cy="152" r="8" fill={C.pants} />
        <line x1="175" y1="152" x2="190" y2="152" stroke={C.pants} strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="194" cy="152" rx="12" ry="6" fill={C.shoes} />
      </g>
      {/* Tender point */}
      <ContactPulse cx={135} cy={118} />
      <text x="135" y="112" textAnchor="middle" fontSize="6" fontWeight="700" fill="#B45309">TP</text>
      <TherapistHand cx={135} cy={106} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>Counterstrain</text>
    </svg>
  );
}

// ─── 12. MET Cervical ─────────────────────────────────────────────────────────
export function AnimMETCervical() {
  return (
    <svg viewBox="0 0 220 175" className="w-full h-full">
      <style>{`
        @keyframes metc { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-12deg)} }
        .metc-head { animation:metc 3s ease-in-out infinite; transform-origin:40px 115px; }
      `}</style>
      <rect width="220" height="175" fill={C.bg} rx="12" />
      <Mat />
      <line x1="55" y1="118" x2="195" y2="118" stroke={C.shirt} strokeWidth="18" strokeLinecap="round" />
      <ellipse cx="205" cy="118" rx="12" ry="6" fill={C.shoes} />
      {/* Animated head — neck rotation */}
      <g className="metc-head">
        <circle cx="40" cy="115" r="17" fill={C.skin} />
        <ellipse cx="40" cy="106" rx="16" ry="10" fill={C.hair} />
        <circle cx="35" cy="113" r="2.5" fill="#1C1C1E" />
        <circle cx="45" cy="113" r="2.5" fill="#1C1C1E" />
        <path d="M36,122 Q40,126 44,122" stroke="#1C1C1E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
      {/* Cervical highlight */}
      <rect x="32" y="128" width="16" height="10" rx="4" fill={T.contact} opacity="0.5" />
      <text x="40" y="136" textAnchor="middle" fontSize="6" fontWeight="700" fill="#B45309">C1-C4</text>
      {/* Therapist hands */}
      <TherapistHand cx={20} cy={115} angle={-20} />
      <TherapistHand cx={60} cy={115} angle={20} />
      <ContactPulse cx={40} cy={128} />
      <text x="110" y="172" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={C.shirtShade}>TEM — Cervical</text>
    </svg>
  );
}
