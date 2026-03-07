"use client";

/**
 * ExerciseIllustrations — Wibbi-style
 * Ilustraciones SVG de alta calidad con figura humana realista
 * Estilo: cuerpo azul/teal, fondo blanco, proporciones anatómicas correctas
 */

// ─── Paleta Wibbi ─────────────────────────────────────────────────────────────
const B = {
  bg:       "#FFFFFF",
  mat:      "#EBF4FF",
  matEdge:  "#B8D9F5",
  body:     "#4A90D9",
  bodyDk:   "#2E6DB4",
  bodyLt:   "#72AEE6",
  skin:     "#F5C5A3",
  skinDk:   "#E8A87C",
  hair:     "#2C3E6B",
  arrow:    "#1A6FBF",
  arrowBg:  "rgba(74,144,217,0.12)",
  shadow:   "rgba(74,144,217,0.15)",
};

// ─── Flecha de movimiento ─────────────────────────────────────────────────────
function Arrow({ x1, y1, x2, y2, curved = false }: { x1:number; y1:number; x2:number; y2:number; curved?: boolean }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const nx = dx/len, ny = dy/len;
  const hx = x2 - nx*10, hy = y2 - ny*10;
  const px = -ny, py = nx;
  const d = curved
    ? `M ${x1} ${y1} Q ${(x1+x2)/2 + px*20} ${(y1+y2)/2 + py*20} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;
  return (
    <g>
      <path d={d} stroke={B.arrow} strokeWidth="2.5" fill="none" strokeLinecap="round"
        strokeDasharray="5 3" opacity="0.7" />
      <polygon
        points={`${x2},${y2} ${hx+px*5},${hy+py*5} ${hx-px*5},${hy-py*5}`}
        fill={B.arrow} opacity="0.85" />
    </g>
  );
}

// ─── Mat (colchoneta) ─────────────────────────────────────────────────────────
function Mat({ x=20, y=160, w=220, h=12 }: { x?:number; y?:number; w?:number; h?:number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={B.mat} stroke={B.matEdge} strokeWidth="1.5" />
      <rect x={x} y={y} width={w} height="3" rx="4" fill={B.bodyLt} opacity="0.2" />
    </g>
  );
}

// ─── Figura de pie (standing) ─────────────────────────────────────────────────
function StandingFigure({ armAngle = 0, armLeft = false }: { armAngle?: number; armLeft?: boolean }) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx="100" cy="205" rx="28" ry="5" fill={B.shadow} />
      {/* Left leg */}
      <path d="M88,138 Q86,162 86,192 Q88,198 92,198 Q96,198 97,192 Q97,162 94,138 Z" fill={B.body} />
      {/* Right leg */}
      <path d="M106,138 Q109,162 114,192 Q116,198 120,198 Q124,198 124,192 Q122,162 112,138 Z" fill={B.bodyDk} />
      {/* Feet */}
      <ellipse cx="91" cy="196" rx="10" ry="5" fill={B.bodyDk} />
      <ellipse cx="117" cy="196" rx="10" ry="5" fill={B.bodyDk} />
      {/* Hips */}
      <path d="M83,126 Q83,140 88,140 L112,140 Q117,140 117,126 Q110,122 100,122 Q90,122 83,126 Z" fill={B.bodyDk} />
      {/* Torso */}
      <path d="M78,65 Q76,120 83,126 L117,126 Q124,120 122,65 Q111,58 100,58 Q89,58 78,65 Z" fill={B.body} />
      {/* Chest highlight */}
      <path d="M84,68 Q83,100 88,108 Q100,114 112,108 Q117,100 116,68 Q108,63 100,63 Q92,63 84,68 Z" fill={B.bodyLt} opacity="0.25" />
      {/* Left arm */}
      <path d={armLeft
        ? `M78,72 Q68,85 62,100 Q59,110 62,116 Q66,120 70,114 Q76,100 84,88 Z`
        : `M78,72 Q68,90 64,115 Q62,124 65,127 Q69,129 72,122 Q76,97 84,80 Z`}
        fill={B.body} />
      <circle cx={armLeft ? 63 : 64} cy={armLeft ? 117 : 128} r="6" fill={B.skin} />
      {/* Right arm — optionally raised */}
      <g transform={`rotate(${armAngle}, 122, 72)`}>
        <path d="M122,72 Q132,88 136,115 Q138,124 135,127 Q131,129 128,122 Q124,97 116,80 Z" fill={B.bodyDk} />
        <circle cx="136" cy="128" r="6" fill={B.skin} />
      </g>
      {/* Neck */}
      <rect x="94" y="50" width="12" height="10" rx="5" fill={B.skin} />
      {/* Head */}
      <circle cx="100" cy="35" r="20" fill={B.skin} />
      {/* Hair */}
      <path d="M80,28 Q82,10 100,10 Q118,10 120,28 Q110,17 100,17 Q90,17 80,28 Z" fill={B.hair} />
      <path d="M80,28 Q78,35 80,40 Q82,18 100,18 Q118,18 120,40 Q122,35 120,28 Q110,17 100,17 Q90,17 80,28 Z" fill={B.hair} opacity="0.7" />
      {/* Ear */}
      <ellipse cx="80" cy="36" rx="4" ry="5" fill={B.skin} />
    </g>
  );
}

// ─── 1. Rotación Externa de Hombro — de pie con banda ─────────────────────────
export function IlluShoulderExternalRotation() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      <StandingFigure />
      {/* Elbow bent, band rotation arc */}
      <path d="M122,90 Q134,90 138,90" stroke={B.bodyDk} strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="138" cy="90" r="6" fill={B.skin} />
      {/* Band */}
      <path d="M138,90 Q148,88 155,82" stroke="#FF6B35" strokeWidth="3" fill="none" strokeDasharray="5 3" strokeLinecap="round" />
      {/* Arc arrow */}
      <Arrow x1={138} y1={95} x2={138} y2={75} curved />
      {/* Label */}
      <text x="100" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Rotación Externa · Hombro</text>
    </svg>
  );
}

// ─── 2. Figura en supino (base) ───────────────────────────────────────────────
function SupineFigure({ kneesUp = false }: { kneesUp?: boolean }) {
  return (
    <g>
      {/* Head */}
      <circle cx="32" cy="82" r="18" fill={B.skin} />
      <path d="M14,74 Q15,60 32,60 Q49,60 50,74 Q42,63 32,63 Q22,63 14,74 Z" fill={B.hair} />
      {/* Neck */}
      <rect x="43" y="76" width="10" height="10" rx="4" fill={B.skin} />
      {/* Torso */}
      <path d="M53,68 Q52,96 56,100 L136,100 Q140,96 139,68 Q118,62 96,62 Q74,62 53,68 Z" fill={B.body} />
      {/* Chest highlight */}
      <path d="M58,70 Q57,92 60,96 L132,96 Q136,92 135,70 Q116,65 96,65 Q76,65 58,70 Z" fill={B.bodyLt} opacity="0.2" />
      {/* Left arm */}
      <path d="M60,70 Q56,84 55,105 Q54,112 57,113 Q61,114 63,108 Q64,87 68,73 Z" fill={B.body} />
      <circle cx="56" cy="114" r="5" fill={B.skin} />
      {/* Right arm */}
      <path d="M130,70 Q134,84 135,105 Q136,112 133,113 Q129,114 127,108 Q126,87 122,73 Z" fill={B.body} />
      <circle cx="135" cy="114" r="5" fill={B.skin} />
      {kneesUp ? (
        <g>
          {/* Hips/butt */}
          <path d="M136,92 Q140,100 139,110 L115,110 Q110,106 110,100 Q110,95 115,92 Z" fill={B.bodyDk} />
          <path d="M139,92 Q143,100 142,110 L166,110 Q171,106 171,100 Q171,95 166,92 Z" fill={B.bodyDk} />
          {/* Left thigh up */}
          <path d="M115,100 Q112,118 113,138 Q116,143 120,142 Q124,141 124,136 Q122,116 120,100 Z" fill={B.bodyDk} />
          {/* Left shin down */}
          <path d="M113,138 Q112,155 120,160 Q125,162 128,158 Q128,150 124,136 Z" fill={B.body} />
          {/* Right thigh up */}
          <path d="M141,100 Q144,118 147,138 Q150,143 154,142 Q158,141 158,136 Q154,116 148,100 Z" fill={B.body} />
          {/* Right shin down */}
          <path d="M147,138 Q148,155 156,160 Q161,162 164,158 Q164,150 158,136 Z" fill={B.bodyDk} />
          {/* Feet on mat */}
          <ellipse cx="122" cy="162" rx="9" ry="5" fill={B.bodyDk} />
          <ellipse cx="157" cy="162" rx="9" ry="5" fill={B.body} />
        </g>
      ) : (
        <g>
          {/* Hips */}
          <rect x="136" y="88" width="50" height="16" rx="6" fill={B.bodyDk} />
          {/* Left leg straight */}
          <path d="M136,96 Q136,130 136,158 Q138,164 143,164 Q148,164 148,158 Q147,130 146,96 Z" fill={B.body} />
          {/* Right leg straight */}
          <path d="M162,96 Q162,130 163,158 Q165,164 170,164 Q175,164 175,158 Q174,130 172,96 Z" fill={B.bodyDk} />
          <ellipse cx="143" cy="165" rx="10" ry="5" fill={B.bodyDk} />
          <ellipse cx="170" cy="165" rx="10" ry="5" fill={B.body} />
        </g>
      )}
    </g>
  );
}

// ─── 3. Puente de glúteos ─────────────────────────────────────────────────────
export function IlluGluteBridge() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-full">
      <rect width="260" height="200" fill={B.bg} />
      <Mat x={15} y={150} w={230} h={12} />
      {/* Head */}
      <circle cx="32" cy="125" r="16" fill={B.skin} />
      <path d="M17,118 Q18,106 32,106 Q46,106 47,118 Q40,109 32,109 Q24,109 17,118 Z" fill={B.hair} />
      {/* Upper body on mat */}
      <path d="M48,120 Q47,140 52,148 L120,148 Q125,140 124,120 Q105,114 86,114 Q67,114 48,120 Z" fill={B.body} />
      {/* Left arm on mat */}
      <path d="M55,122 Q50,135 50,148 Q52,153 56,152 Q60,151 60,145 Q60,132 64,122 Z" fill={B.body} />
      {/* Hips elevated */}
      <path d="M120,148 Q130,130 138,110 Q150,108 158,115 Q152,138 148,148 Z" fill={B.bodyDk} />
      {/* Left thigh */}
      <path d="M148,148 Q150,158 148,168 Q145,172 140,170 Q138,160 138,148 Z" fill={B.bodyDk} />
      {/* Right thigh */}
      <path d="M168,148 Q170,158 168,168 Q165,172 160,170 Q158,160 158,148 Z" fill={B.body} />
      {/* Feet on mat */}
      <ellipse cx="143" cy="150" rx="12" ry="6" fill={B.bodyDk} />
      <ellipse cx="163" cy="150" rx="12" ry="6" fill={B.body} />
      <Arrow x1={138} y1={120} x2={138} y2={100} />
      <text x="130" y="192" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Puente de Glúteos</text>
    </svg>
  );
}

// ─── 4. Bird Dog ─────────────────────────────────────────────────────────────
export function IlluBirdDog() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-full">
      <rect width="260" height="200" fill={B.bg} />
      <Mat x={20} y={158} w={220} h={12} />
      {/* 4-point kneeling figure */}
      {/* Head */}
      <circle cx="42" cy="95" r="16" fill={B.skin} />
      <path d="M27,88 Q28,75 42,75 Q56,75 57,88 Q50,78 42,78 Q34,78 27,88 Z" fill={B.hair} />
      {/* Torso horizontal */}
      <path d="M58,88 Q57,112 62,118 L168,118 Q173,112 172,88 Q148,80 115,80 Q82,80 58,88 Z" fill={B.body} />
      {/* Left arm (down to mat) */}
      <path d="M70,90 Q68,118 68,155 Q71,162 75,161 Q79,160 79,153 Q79,118 74,90 Z" fill={B.body} />
      <ellipse cx="74" cy="158" rx="9" ry="5" fill={B.bodyDk} />
      {/* Left knee down */}
      <path d="M140,112 Q138,132 138,158 Q141,163 145,162 Q149,161 149,155 Q149,133 148,112 Z" fill={B.body} />
      <ellipse cx="144" cy="159" rx="9" ry="5" fill={B.bodyDk} />
      {/* Right arm EXTENDED forward */}
      <path d="M62,88 Q48,84 30,78 Q22,76 20,79 Q18,83 22,86 Q40,90 56,94 Z" fill={B.bodyDk} />
      <circle cx="19" cy="82" r="6" fill={B.skin} />
      {/* Right leg EXTENDED backward */}
      <path d="M168,108 Q188,112 212,116 Q220,118 222,115 Q224,112 221,109 Q198,104 174,100 Z" fill={B.bodyDk} />
      <ellipse cx="222" cy="112" rx="8" ry="5" fill={B.bodyDk} />
      <Arrow x1={19} y1={72} x2={12} y2={65} />
      <Arrow x1={222} y1={102} x2={232} y2={98} />
      <text x="130" y="192" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Pájaro-Perro (Bird Dog)</text>
    </svg>
  );
}

// ─── 5. Cat-Cow ───────────────────────────────────────────────────────────────
export function IlluCatCow() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-full">
      <rect width="260" height="200" fill={B.bg} />
      <Mat x={20} y={158} w={220} h={12} />
      {/* Head looking down */}
      <circle cx="45" cy="105" r="16" fill={B.skin} />
      <path d="M30,98 Q31,85 45,85 Q59,85 60,98 Q53,88 45,88 Q37,88 30,98 Z" fill={B.hair} />
      {/* Torso arched (cat pose) */}
      <path d="M60,102 Q62,82 130,72 Q168,80 182,102 Q168,108 130,110 Q90,110 60,102 Z" fill={B.body} />
      {/* Spine arch highlight */}
      <path d="M65,100 Q67,82 130,74 Q165,82 178,100" stroke={B.bodyLt} strokeWidth="3" fill="none" opacity="0.6" />
      {/* Left arm */}
      <path d="M68,100 Q66,120 66,158 Q69,162 73,161 Q77,160 77,155 Q77,120 72,100 Z" fill={B.body} />
      <ellipse cx="72" cy="159" rx="9" ry="5" fill={B.bodyDk} />
      {/* Right arm */}
      <path d="M172,100 Q174,120 174,158 Q177,162 181,161 Q185,160 185,155 Q185,120 179,100 Z" fill={B.bodyDk} />
      <ellipse cx="180" cy="159" rx="9" ry="5" fill={B.bodyDk} />
      {/* Left knee */}
      <path d="M130,110 Q125,130 124,158 Q127,162 131,161 Q135,160 135,155 Q135,130 135,110 Z" fill={B.body} />
      <ellipse cx="130" cy="159" rx="9" ry="5" fill={B.bodyDk} />
      {/* Right knee */}
      <path d="M150,110 Q151,130 151,158 Q154,162 158,161 Q162,160 162,155 Q162,130 156,110 Z" fill={B.bodyDk} />
      <ellipse cx="157" cy="159" rx="9" ry="5" fill={B.body} />
      <Arrow x1={120} y1={70} x2={120} y2={55} />
      <text x="130" y="192" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Gato-Vaca (Cat-Cow)</text>
    </svg>
  );
}

// ─── 6. Dead Bug ──────────────────────────────────────────────────────────────
export function IlluDeadBug() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-full">
      <rect width="260" height="200" fill={B.bg} />
      <Mat x={15} y={150} w={230} h={12} />
      {/* Head */}
      <circle cx="32" cy="88" r="16" fill={B.skin} />
      <path d="M17,81 Q18,68 32,68 Q46,68 47,81 Q40,72 32,72 Q24,72 27,81 Z" fill={B.hair} />
      {/* Torso on mat */}
      <path d="M48,84 Q47,108 52,115 L145,115 Q150,108 149,84 Q125,77 99,77 Q73,77 48,84 Z" fill={B.body} />
      {/* Left arm up */}
      <path d="M62,84 Q58,70 52,55 Q50,48 53,46 Q57,44 60,50 Q66,65 70,80 Z" fill={B.bodyDk} />
      <circle cx="52" cy="44" r="6" fill={B.skin} />
      {/* Right arm resting */}
      <path d="M135,84 Q138,98 140,115 Q143,122 147,121 Q151,120 151,113 Q148,97 142,82 Z" fill={B.body} />
      <circle cx="152" cy="120" r="5" fill={B.skin} />
      {/* Left leg up 90° */}
      <path d="M100,108 Q95,90 92,72 Q90,64 94,62 Q98,60 101,68 Q104,86 106,108 Z" fill={B.body} />
      {/* Left shin horizontal */}
      <path d="M92,68 Q78,66 62,64 Q55,63 53,66 Q51,70 56,72 Q72,74 88,74 Z" fill={B.bodyDk} />
      <circle cx="51" cy="68" r="6" fill={B.bodyDk} />
      {/* Right leg up */}
      <path d="M135,108 Q138,90 142,70 Q144,62 148,62 Q152,62 152,70 Q150,90 146,108 Z" fill={B.bodyDk} />
      {/* Right shin */}
      <path d="M142,68 Q155,66 170,64 Q177,63 179,67 Q180,71 175,73 Q160,74 145,73 Z" fill={B.body} />
      <circle cx="180" cy="68" r="6" fill={B.body} />
      <text x="130" y="185" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Bicho Muerto (Dead Bug)</text>
    </svg>
  );
}

// ─── 7. Plancha (Plank) ───────────────────────────────────────────────────────
export function IlluPlank() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-full">
      <rect width="260" height="200" fill={B.bg} />
      <Mat x={20} y={148} w={220} h={12} />
      {/* Head looking down */}
      <circle cx="32" cy="105" r="15" fill={B.skin} />
      <path d="M18,98 Q19,86 32,86 Q45,86 46,98 Q40,89 32,89 Q24,89 18,98 Z" fill={B.hair} />
      {/* Body plank horizontal */}
      <path d="M47,102 Q46,120 50,126 L216,126 Q220,120 219,102 Q168,96 133,96 Q98,96 47,102 Z" fill={B.body} />
      {/* Body line highlight */}
      <line x1="50" y1="110" x2="218" y2="110" stroke={B.bodyLt} strokeWidth="2" opacity="0.3" />
      {/* Left forearm */}
      <path d="M58,104 Q55,120 55,148 Q58,152 62,151 Q66,150 66,145 Q66,120 62,104 Z" fill={B.bodyDk} />
      <ellipse cx="60" cy="149" rx="10" ry="5" fill={B.bodyDk} />
      {/* Right forearm */}
      <path d="M95,104 Q92,120 92,148 Q95,152 99,151 Q103,150 103,145 Q103,120 99,104 Z" fill={B.body} />
      <ellipse cx="97" cy="149" rx="10" ry="5" fill={B.body} />
      {/* Left toe */}
      <path d="M204,118 Q208,132 208,148 Q211,152 215,151 Q219,150 219,144 Q219,130 215,118 Z" fill={B.bodyDk} />
      <ellipse cx="213" cy="149" rx="9" ry="5" fill={B.bodyDk} />
      {/* Right toe */}
      <path d="M216,118 Q220,130 220,148 Q223,151 226,149 Q229,146 228,140 Q224,126 220,118 Z" fill={B.body} />
      {/* Core highlight */}
      <path d="M110,100 Q108,118 112,124 L170,124 Q174,118 172,100" fill={B.bodyLt} opacity="0.2" />
      <text x="130" y="185" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Plancha (Plank)</text>
    </svg>
  );
}

// ─── 8. Sentadilla / Goblet Squat ─────────────────────────────────────────────
export function IlluSquat() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      {/* Shadow */}
      <ellipse cx="100" cy="205" rx="35" ry="6" fill={B.shadow} />
      {/* Left foot */}
      <ellipse cx="72" cy="195" rx="14" ry="6" fill={B.bodyDk} transform="rotate(-15 72 195)" />
      {/* Right foot */}
      <ellipse cx="128" cy="195" rx="14" ry="6" fill={B.bodyDk} transform="rotate(15 128 195)" />
      {/* Left shin */}
      <path d="M66,170 Q64,180 68,192 Q72,198 78,196 Q82,192 79,180 Q76,170 72,165 Z" fill={B.body} />
      {/* Right shin */}
      <path d="M134,170 Q136,180 132,192 Q128,198 122,196 Q118,192 121,180 Q124,170 128,165 Z" fill={B.body} />
      {/* Left thigh */}
      <path d="M74,130 Q68,148 66,168 Q70,174 76,172 Q82,170 84,153 Q86,138 88,130 Z" fill={B.bodyDk} />
      {/* Right thigh */}
      <path d="M126,130 Q132,148 134,168 Q130,174 124,172 Q118,170 116,153 Q114,138 112,130 Z" fill={B.bodyDk} />
      {/* Hips/glutes */}
      <path d="M82,118 Q76,126 74,135 L126,135 Q124,126 118,118 Q110,113 100,113 Q90,113 82,118 Z" fill={B.bodyDk} />
      {/* Torso leaning forward */}
      <path d="M78,65 Q74,105 80,115 L120,115 Q126,105 122,65 Q111,57 100,57 Q89,57 78,65 Z" fill={B.body} />
      {/* Weight/ball at chest */}
      <circle cx="100" cy="85" r="14" fill={B.bodyDk} />
      <circle cx="100" cy="85" r="10" fill="#2E6DB4" />
      <circle cx="100" cy="85" r="6" fill={B.bodyLt} opacity="0.4" />
      {/* Arms holding weight */}
      <path d="M78,70 Q80,78 86,86 Q90,90 96,88 L104,88 Q110,90 114,86 Q120,78 122,70 L116,65 Q110,72 104,74 L96,74 Q90,72 84,65 Z" fill={B.bodyDk} />
      {/* Neck */}
      <rect x="93" y="50" width="14" height="10" rx="5" fill={B.skin} />
      {/* Head */}
      <circle cx="100" cy="36" r="19" fill={B.skin} />
      <path d="M82,28 Q83,12 100,12 Q117,12 118,28 Q109,18 100,18 Q91,18 82,28 Z" fill={B.hair} />
      <Arrow x1={100} y1={100} x2={100} y2={140} />
      <text x="100" y="216" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Sentadilla Goblet</text>
    </svg>
  );
}

// ─── 9. Lunge ─────────────────────────────────────────────────────────────────
export function IlluLunge() {
  return (
    <svg viewBox="0 0 200 225" className="w-full h-full">
      <rect width="200" height="225" fill={B.bg} />
      <ellipse cx="100" cy="210" rx="42" ry="6" fill={B.shadow} />
      {/* Back leg (right) */}
      <path d="M110,122 Q115,148 120,175 Q122,182 128,180 Q134,178 132,170 Q127,145 120,120 Z" fill={B.body} />
      <ellipse cx="127" cy="178" rx="10" ry="6" fill={B.bodyDk} transform="rotate(10 127 178)" />
      {/* Knee on floor area */}
      <path d="M120,175 Q122,188 126,193 Q130,197 134,195 Q138,190 134,183 Q130,176 128,172 Z" fill={B.bodyDk} />
      {/* Front left leg */}
      <path d="M82,122 Q78,145 76,168 Q78,175 84,173 Q90,171 90,164 Q90,142 88,122 Z" fill={B.bodyDk} />
      <ellipse cx="82" cy="170" rx="12" ry="6" fill={B.bodyDk} transform="rotate(-10 82 170)" />
      <path d="M76,168 Q74,182 78,192 Q82,198 86,196 Q92,192 90,182 Q88,172 84,168 Z" fill={B.body} />
      <ellipse cx="82" cy="193" rx="13" ry="6" fill={B.bodyDk} />
      {/* Hips */}
      <path d="M80,110 Q80,122 85,126 L115,126 Q120,122 120,110 Q110,105 100,105 Q90,105 80,110 Z" fill={B.bodyDk} />
      {/* Torso upright */}
      <path d="M80,58 Q78,102 82,108 L118,108 Q122,102 120,58 Q110,51 100,51 Q90,51 80,58 Z" fill={B.body} />
      {/* Left arm */}
      <path d="M80,64 Q70,80 66,105 Q64,113 68,115 Q72,117 75,110 Q79,85 84,68 Z" fill={B.body} />
      <circle cx="66" cy="116" r="6" fill={B.skin} />
      {/* Right arm */}
      <path d="M120,64 Q130,80 134,105 Q136,113 132,115 Q128,117 125,110 Q121,85 116,68 Z" fill={B.bodyDk} />
      <circle cx="134" cy="116" r="6" fill={B.skin} />
      {/* Neck */}
      <rect x="93" y="44" width="14" height="10" rx="5" fill={B.skin} />
      {/* Head */}
      <circle cx="100" cy="30" r="18" fill={B.skin} />
      <path d="M83,23 Q84,8 100,8 Q116,8 117,23 Q109,13 100,13 Q91,13 83,23 Z" fill={B.hair} />
      <Arrow x1={100} y1={100} x2={100} y2={140} />
      <text x="100" y="220" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Zancada (Lunge)</text>
    </svg>
  );
}

// ─── 10. Remo con Banda ───────────────────────────────────────────────────────
export function IlluBandRow() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      {/* Anchor point */}
      <rect x="5" y="80" width="8" height="30" rx="4" fill="#CCC" />
      <circle cx="9" cy="95" r="5" fill="#999" />
      {/* Band */}
      <path d="M13,95 Q40,94 65,88" stroke="#FF6B35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M13,95 Q40,96 65,100" stroke="#FF6B35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <StandingFigure armAngle={-45} />
      {/* Pulled hand near body */}
      <circle cx="85" cy="88" r="7" fill={B.skin} />
      <Arrow x1={70} y1={90} x2={90} y2={88} />
      <text x="110" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Remo con Banda</text>
    </svg>
  );
}

// ─── 11. Hip Flexor Stretch ───────────────────────────────────────────────────
export function IlluHipFlexorStretch() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      <Mat x={30} y={170} w={150} h={12} />
      {/* Right (back) knee on mat */}
      <ellipse cx="148" cy="172" rx="14" ry="7" fill={B.bodyDk} />
      {/* Back shin */}
      <path d="M138,148 Q140,160 145,172 Q150,178 156,175 Q160,170 155,162 Q150,150 145,140 Z" fill={B.body} />
      {/* Back thigh to hip */}
      <path d="M100,125 Q110,132 120,140 Q130,148 138,148 Q140,142 136,136 Q126,126 112,118 Z" fill={B.bodyDk} />
      {/* Front left foot */}
      <ellipse cx="52" cy="170" rx="14" ry="7" fill={B.bodyDk} transform="rotate(-5 52 170)" />
      {/* Front shin */}
      <path d="M60,140 Q58,154 54,168 Q58,176 64,174 Q70,172 70,162 Q70,148 68,138 Z" fill={B.body} />
      {/* Front thigh */}
      <path d="M78,118 Q72,126 66,138 Q62,146 60,142 Q58,136 64,128 Q72,116 80,110 Z" fill={B.bodyDk} />
      {/* Hips */}
      <path d="M76,110 Q76,120 82,124 L118,124 Q122,120 122,110 Q112,104 100,104 Q88,104 76,110 Z" fill={B.bodyDk} />
      {/* Torso upright */}
      <path d="M78,56 Q76,100 80,108 L120,108 Q124,100 122,56 Q112,49 100,49 Q88,49 78,56 Z" fill={B.body} />
      {/* Arms */}
      <path d="M78,62 Q68,78 64,102 Q62,110 66,112 Q70,114 73,108 Q77,84 82,68 Z" fill={B.body} />
      <circle cx="64" cy="113" r="6" fill={B.skin} />
      <path d="M122,62 Q132,78 136,102 Q138,110 134,112 Q130,114 127,108 Q123,84 118,68 Z" fill={B.bodyDk} />
      <circle cx="136" cy="113" r="6" fill={B.skin} />
      {/* Neck + Head */}
      <rect x="93" y="42" width="14" height="10" rx="5" fill={B.skin} />
      <circle cx="100" cy="28" r="18" fill={B.skin} />
      <path d="M83,20 Q84,5 100,5 Q116,5 117,20 Q109,10 100,10 Q91,10 83,20 Z" fill={B.hair} />
      {/* Stretch indicator */}
      <Arrow x1={130} y1={135} x2={148} y2={148} />
      <text x="100" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Estiramiento Flexores Cadera</text>
    </svg>
  );
}

// ─── 12. Elevación Lateral ────────────────────────────────────────────────────
export function IlluLateralRaise() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      <ellipse cx="100" cy="205" rx="28" ry="5" fill={B.shadow} />
      <StandingFigure />
      {/* Left arm raised lateral */}
      <path d="M78,70 Q60,65 38,62 Q30,61 29,65 Q28,69 34,72 Q56,74 74,78 Z" fill={B.bodyDk} />
      <circle cx="28" cy="66" r="6" fill={B.skin} />
      {/* Dumbbell */}
      <rect x="17" y="62" width="14" height="8" rx="3" fill="#666" />
      {/* Right arm raised lateral */}
      <path d="M122,70 Q140,65 162,62 Q170,61 171,65 Q172,69 166,72 Q144,74 126,78 Z" fill={B.body} />
      <circle cx="172" cy="66" r="6" fill={B.skin} />
      <rect x="169" y="62" width="14" height="8" rx="3" fill="#666" />
      <Arrow x1={38} y1={68} x2={28} y2={56} />
      <Arrow x1={162} y1={68} x2={172} y2={56} />
      <text x="100" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Elevación Lateral</text>
    </svg>
  );
}

// ─── 13. Rodilla al Pecho ─────────────────────────────────────────────────────
export function IlluKneeToChest() {
  return (
    <svg viewBox="0 0 260 190" className="w-full h-full">
      <rect width="260" height="190" fill={B.bg} />
      <Mat x={15} y={148} w={230} h={12} />
      {/* Head */}
      <circle cx="32" cy="88" r="16" fill={B.skin} />
      <path d="M17,80 Q18,68 32,68 Q46,68 47,80 Q40,71 32,71 Q24,71 17,80 Z" fill={B.hair} />
      {/* Neck */}
      <rect x="42" y="82" width="10" height="10" rx="4" fill={B.skin} />
      {/* Upper body */}
      <path d="M52,80 Q50,108 55,116 L140,116 Q145,108 143,80 Q118,73 98,73 Q78,73 52,80 Z" fill={B.body} />
      {/* Left arm on mat */}
      <path d="M60,82 Q55,98 55,148 Q58,153 62,152 Q66,151 66,145 Q66,98 64,82 Z" fill={B.body} />
      {/* Right arm holding knee */}
      <path d="M130,82 Q138,94 145,110 Q148,118 144,121 Q140,123 137,116 Q130,100 122,85 Z" fill={B.bodyDk} />
      <circle cx="143" cy="122" r="6" fill={B.skin} />
      {/* Left leg straight */}
      <path d="M80,110 Q80,130 80,148 Q83,153 88,152 Q93,151 93,145 Q93,128 90,110 Z" fill={B.body} />
      <ellipse cx="86" cy="149" rx="10" ry="5" fill={B.bodyDk} />
      {/* Right leg bent up to chest */}
      <path d="M105,110 Q108,95 118,84 Q124,78 130,82 Q135,86 130,92 Q120,100 115,112 Z" fill={B.bodyDk} />
      <path d="M118,84 Q128,78 136,86 Q140,96 135,106 Q128,112 120,108 Q112,102 115,92 Z" fill={B.body} />
      <Arrow x1={128} y1={86} x2={116} y2={74} />
      <text x="130" y="183" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Rodilla al Pecho</text>
    </svg>
  );
}

// ─── 14. Romanian Deadlift ────────────────────────────────────────────────────
export function IlluRDL() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      <ellipse cx="100" cy="208" rx="30" ry="6" fill={B.shadow} />
      {/* Feet */}
      <ellipse cx="86" cy="202" rx="13" ry="6" fill={B.bodyDk} />
      <ellipse cx="114" cy="202" rx="13" ry="6" fill={B.bodyDk} />
      {/* Legs */}
      <path d="M80,170 Q80,182 82,196 Q85,204 90,202 Q95,200 95,193 Q94,180 92,170 Z" fill={B.body} />
      <path d="M108,170 Q110,182 112,196 Q115,204 120,202 Q125,200 125,193 Q123,180 120,170 Z" fill={B.bodyDk} />
      {/* Hips back / hip hinge */}
      <path d="M78,145 Q76,156 78,168 L122,168 Q124,156 122,145 Q112,138 100,138 Q88,138 78,145 Z" fill={B.bodyDk} />
      {/* Torso leaning forward */}
      <path d="M62,82 Q58,118 65,138 L100,145 L135,138 Q142,118 138,82 Q120,74 100,74 Q80,74 62,82 Z" fill={B.body} />
      {/* Chest highlight */}
      <path d="M66,84 Q62,118 68,136 L100,142 L132,136 Q138,118 134,84" fill={B.bodyLt} opacity="0.2" />
      {/* Left arm with dumbbell */}
      <path d="M68,90 Q60,108 56,128 Q54,136 58,138 Q62,140 65,132 Q68,112 74,92 Z" fill={B.bodyDk} />
      <circle cx="56" cy="138" r="6" fill={B.skin} />
      <rect x="42" y="134" width="20" height="9" rx="3" fill="#555" />
      {/* Right arm */}
      <path d="M132,90 Q140,108 144,128 Q146,136 142,138 Q138,140 135,132 Q132,112 126,92 Z" fill={B.body} />
      <circle cx="144" cy="138" r="6" fill={B.skin} />
      <rect x="138" y="134" width="20" height="9" rx="3" fill="#555" />
      {/* Head/neck */}
      <rect x="93" y="68" width="14" height="9" rx="4" fill={B.skin} />
      <circle cx="100" cy="54" r="18" fill={B.skin} />
      <path d="M83,46 Q84,31 100,31 Q116,31 117,46 Q109,36 100,36 Q91,36 83,46 Z" fill={B.hair} />
      <Arrow x1={100} y1={138} x2={100} y2={165} />
      <text x="100" y="216" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Peso Muerto Rumano</text>
    </svg>
  );
}

// ─── 15. Cervical retraction / seated ────────────────────────────────────────
export function IlluCervicalSeated() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      {/* Chair */}
      <rect x="60" y="120" width="80" height="8" rx="4" fill="#CBD5E1" />
      <rect x="148" y="70" width="8" height="58" rx="4" fill="#CBD5E1" />
      <rect x="60" y="128" width="8" height="70" rx="4" fill="#CBD5E1" />
      <rect x="132" y="128" width="8" height="70" rx="4" fill="#CBD5E1" />
      {/* Left foot */}
      <ellipse cx="72" cy="200" rx="13" ry="6" fill={B.bodyDk} />
      <path d="M66,165 Q64,180 66,196 Q69,202 74,200 Q79,198 79,192 Q78,177 76,165 Z" fill={B.body} />
      {/* Right foot */}
      <ellipse cx="128" cy="200" rx="13" ry="6" fill={B.body} />
      <path d="M122,165 Q120,180 122,196 Q125,202 130,200 Q135,198 135,192 Q134,177 132,165 Z" fill={B.bodyDk} />
      {/* Thighs on chair */}
      <path d="M66,120 Q64,138 66,164 L80,162 L80,120 Z" fill={B.body} />
      <path d="M120,120 Q122,138 122,164 L136,162 L136,120 Z" fill={B.bodyDk} />
      {/* Torso */}
      <path d="M72,52 Q70,112 75,118 L125,118 Q130,112 128,52 Q115,45 100,45 Q85,45 72,52 Z" fill={B.body} />
      {/* Arms on lap */}
      <path d="M74,60 Q68,76 66,100 Q64,110 68,114 Q72,116 74,108 Q76,84 78,62 Z" fill={B.bodyDk} />
      <circle cx="66" cy="115" r="6" fill={B.skin} />
      <path d="M126,60 Q132,76 134,100 Q136,110 132,114 Q128,116 126,108 Q124,84 122,62 Z" fill={B.body} />
      <circle cx="134" cy="115" r="6" fill={B.skin} />
      {/* Neck + Head */}
      <rect x="94" y="38" width="12" height="10" rx="5" fill={B.skin} />
      <circle cx="100" cy="24" r="18" fill={B.skin} />
      <path d="M83,16 Q84,2 100,2 Q116,2 117,16 Q109,6 100,6 Q91,6 83,16 Z" fill={B.hair} />
      {/* Chin retraction arrow */}
      <Arrow x1={92} y1={28} x2={92} y2={36} />
      <text x="100" y="216" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Retracción Cervical</text>
    </svg>
  );
}

// ─── 16. Side-lying hip abduction ─────────────────────────────────────────────
export function IlluSideLying() {
  return (
    <svg viewBox="0 0 260 190" className="w-full h-full">
      <rect width="260" height="190" fill={B.bg} />
      <Mat x={15} y={148} w={230} h={12} />
      {/* Head */}
      <circle cx="30" cy="85" r="16" fill={B.skin} />
      <path d="M16,77 Q17,63 30,63 Q43,63 45,77 Q38,67 30,67 Q22,67 16,77 Z" fill={B.hair} />
      {/* Supporting arm under head */}
      <path d="M44,82 Q55,82 65,82" stroke={B.body} strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* Torso */}
      <path d="M64,76 Q63,102 67,110 L175,110 Q179,102 178,76 Q152,68 121,68 Q90,68 64,76 Z" fill={B.body} />
      {/* Top arm resting */}
      <path d="M80,80 Q82,96 85,110 Q88,116 92,114 Q96,112 94,104 Q90,90 86,78 Z" fill={B.bodyDk} />
      <circle cx="93" cy="114" r="5" fill={B.skin} />
      {/* Bottom leg */}
      <path d="M175,100 Q185,108 205,115 Q215,118 218,114 Q220,110 215,107 Q195,100 180,92 Z" fill={B.bodyDk} />
      <ellipse cx="218" cy="111" rx="10" ry="6" fill={B.bodyDk} transform="rotate(10 218 111)" />
      {/* Top leg RAISED */}
      <path d="M175,96 Q182,84 198,72 Q206,66 210,70 Q214,74 208,79 Q192,88 182,100 Z" fill={B.body} />
      <ellipse cx="210" cy="72" rx="10" ry="6" fill={B.body} transform="rotate(-20 210 72)" />
      {/* Band indicator */}
      <path d="M180,92 Q195,80 208,75" stroke="#FF6B35" strokeWidth="3" fill="none" strokeDasharray="5 3" strokeLinecap="round" />
      <Arrow x1={202} y1={73} x2={210} y2={60} />
      <text x="130" y="182" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Abducción de Cadera</text>
    </svg>
  );
}

// ─── 17. Prone hip extension ──────────────────────────────────────────────────
export function IlluProneHipExtension() {
  return (
    <svg viewBox="0 0 260 185" className="w-full h-full">
      <rect width="260" height="185" fill={B.bg} />
      <Mat x={15} y={140} w={230} h={12} />
      {/* Head turned to side */}
      <circle cx="28" cy="78" r="15" fill={B.skin} />
      <path d="M14,70 Q15,58 28,58 Q41,58 43,70 Q36,61 28,61 Q20,61 14,70 Z" fill={B.hair} />
      {/* Body prone */}
      <path d="M43,72 Q42,98 47,106 L210,106 Q214,98 213,72 Q168,64 130,64 Q92,64 43,72 Z" fill={B.body} />
      {/* Light */}
      <path d="M48,74 Q46,98 50,104 L205,104" fill="none" stroke={B.bodyLt} strokeWidth="2" opacity="0.3" />
      {/* Forearms on mat */}
      <path d="M50,74 Q48,100 48,140 Q51,144 55,143 Q59,142 59,137 Q59,100 54,74 Z" fill={B.bodyDk} />
      <ellipse cx="53" cy="141" rx="9" ry="5" fill={B.bodyDk} />
      <path d="M75,74 Q73,100 73,140 Q76,144 80,143 Q84,142 84,137 Q84,100 79,74 Z" fill={B.body} />
      <ellipse cx="78" cy="141" rx="9" ry="5" fill={B.body} />
      {/* Left leg on mat */}
      <path d="M130,100 Q130,120 130,140 Q133,144 138,143 Q143,142 143,136 Q143,118 140,100 Z" fill={B.bodyDk} />
      <ellipse cx="137" cy="141" rx="10" ry="5" fill={B.bodyDk} />
      {/* Right leg RAISED */}
      <path d="M160,100 Q162,84 164,65 Q166,56 170,57 Q174,58 174,66 Q172,84 168,102 Z" fill={B.body} />
      <ellipse cx="170" cy="59" rx="10" ry="6" fill={B.body} transform="rotate(15 170 59)" />
      <Arrow x1={168} y1={64} x2={168} y2={50} />
      <text x="130" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Extensión de Cadera Prona</text>
    </svg>
  );
}

// ─── 18. McKenzie Press ───────────────────────────────────────────────────────
export function IlluMcKenziePress() {
  return (
    <svg viewBox="0 0 260 185" className="w-full h-full">
      <rect width="260" height="185" fill={B.bg} />
      <Mat x={15} y={140} w={230} h={12} />
      {/* Head raised */}
      <circle cx="28" cy="60" r="15" fill={B.skin} />
      <path d="M14,52 Q15,40 28,40 Q41,40 43,52 Q36,43 28,43 Q20,43 14,52 Z" fill={B.hair} />
      {/* Body prone with arch */}
      <path d="M43,55 Q50,72 56,100 L210,108 Q214,100 210,88 Q190,82 160,78 Q100,72 43,55 Z" fill={B.body} />
      <path d="M43,55 Q50,72 56,100 L130,104" fill="none" stroke={B.bodyLt} strokeWidth="2" opacity="0.3" />
      {/* Arms pushing up */}
      <path d="M52,58 Q50,72 52,90 Q55,96 60,94 Q65,92 64,84 Q62,70 58,58 Z" fill={B.bodyDk} />
      <ellipse cx="56" cy="92" rx="9" ry="5" fill={B.bodyDk} />
      <path d="M75,62 Q73,76 75,94 Q78,100 83,98 Q88,96 87,88 Q85,74 81,62 Z" fill={B.body} />
      <ellipse cx="79" cy="96" rx="9" ry="5" fill={B.body} />
      {/* Legs flat */}
      <path d="M130,104 Q148,108 170,110 Q188,112 204,114" stroke={B.body} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M138,108 Q156,112 178,114 Q196,116 210,118" stroke={B.bodyDk} strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* Spine arch arrow */}
      <path d="M95,78 Q110,65 130,70 Q150,75 165,82" stroke={B.arrow} strokeWidth="2" fill="none" strokeDasharray="5 3" />
      <Arrow x1={90} y1={80} x2={85} y2={68} />
      <text x="130" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">McKenzie Press-Up</text>
    </svg>
  );
}

// ─── 19. Shoulder Press ───────────────────────────────────────────────────────
export function IlluShoulderPress() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      <ellipse cx="100" cy="207" rx="28" ry="5" fill={B.shadow} />
      {/* Legs */}
      <path d="M84,140 Q82,164 82,190 Q85,196 90,195 Q95,195 95,188 Q95,164 90,140 Z" fill={B.body} />
      <path d="M110,140 Q114,164 118,190 Q121,196 126,195 Q131,195 131,188 Q128,164 116,140 Z" fill={B.bodyDk} />
      <ellipse cx="88" cy="193" rx="10" ry="5" fill={B.bodyDk} />
      <ellipse cx="124" cy="193" rx="10" ry="5" fill={B.bodyDk} />
      {/* Hips */}
      <path d="M82,125 Q82,140 88,140 L112,140 Q118,140 118,125 Q110,119 100,119 Q90,119 82,125 Z" fill={B.bodyDk} />
      {/* Torso */}
      <path d="M78,60 Q76,116 82,123 L118,123 Q124,116 122,60 Q111,52 100,52 Q89,52 78,60 Z" fill={B.body} />
      {/* Arms UP with dumbbells */}
      <path d="M78,62 Q65,50 52,36 Q46,30 48,26 Q52,22 56,28 Q68,42 80,56 Z" fill={B.bodyDk} />
      <circle cx="47" cy="25" r="6" fill={B.skin} />
      <rect x="34" y="18" width="22" height="10" rx="4" fill="#555" />
      <path d="M122,62 Q135,50 148,36 Q154,30 152,26 Q148,22 144,28 Q132,42 120,56 Z" fill={B.body} />
      <circle cx="153" cy="25" r="6" fill={B.skin} />
      <rect x="144" y="18" width="22" height="10" rx="4" fill="#555" />
      {/* Neck + Head */}
      <rect x="93" y="44" width="14" height="10" rx="5" fill={B.skin} />
      <circle cx="100" cy="30" r="18" fill={B.skin} />
      <path d="M83,22 Q84,7 100,7 Q116,7 117,22 Q109,12 100,12 Q91,12 83,22 Z" fill={B.hair} />
      <Arrow x1={52} y1={32} x2={44} y2={20} />
      <Arrow x1={148} y1={32} x2={156} y2={20} />
      <text x="100" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Press de Hombro</text>
    </svg>
  );
}

// ─── 20. Seated Knee Extension ────────────────────────────────────────────────
export function IlluKneeExtension() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <rect width="200" height="220" fill={B.bg} />
      {/* Chair */}
      <rect x="48" y="118" width="104" height="8" rx="4" fill="#CBD5E1" />
      <rect x="144" y="68" width="8" height="58" rx="4" fill="#CBD5E1" />
      <rect x="48" y="126" width="8" height="75" rx="4" fill="#CBD5E1" />
      <rect x="144" y="126" width="8" height="75" rx="4" fill="#CBD5E1" />
      {/* Seated torso */}
      <path d="M70,45 Q68,110 73,118 L127,118 Q132,110 130,45 Q116,37 100,37 Q84,37 70,45 Z" fill={B.body} />
      {/* Arms on thighs */}
      <path d="M72,52 Q64,68 62,90 Q60,100 64,104 Q68,106 70,98 Q72,76 76,54 Z" fill={B.bodyDk} />
      <circle cx="62" cy="105" r="6" fill={B.skin} />
      <path d="M128,52 Q136,68 138,90 Q140,100 136,104 Q132,106 130,98 Q128,76 124,54 Z" fill={B.body} />
      <circle cx="138" cy="105" r="6" fill={B.skin} />
      {/* Left thigh on chair */}
      <path d="M72,112 Q70,116 72,126 L100,126 L100,118 Q90,112 80,110 Z" fill={B.bodyDk} />
      {/* Left shin DOWN */}
      <path d="M75,125 Q73,148 74,168 Q77,174 82,172 Q87,170 87,163 Q86,142 80,125 Z" fill={B.body} />
      <ellipse cx="80" cy="170" rx="11" ry="6" fill={B.bodyDk} />
      {/* Right thigh on chair */}
      <path d="M100,118 L128,118 Q130,114 128,108 Q118,110 108,110 Z" fill={B.body} />
      {/* Right leg EXTENDED */}
      <path d="M100,118 Q104,118 116,115 Q140,110 162,108 Q170,107 171,111 Q172,115 164,118 Q140,120 116,124 Q104,126 100,126 Z" fill={B.bodyDk} />
      <ellipse cx="170" cy="112" rx="10" ry="6" fill={B.bodyDk} transform="rotate(-5 170 112)" />
      {/* Weight on ankle */}
      <rect x="156" y="106" width="20" height="12" rx="4" fill="#FF6B35" />
      {/* Neck + Head */}
      <rect x="93" y="30" width="14" height="10" rx="5" fill={B.skin} />
      <circle cx="100" cy="16" r="18" fill={B.skin} />
      <path d="M83,8 Q84,-6 100,-6 Q116,-6 117,8 Q109,-2 100,-2 Q91,-2 83,8 Z" fill={B.hair} />
      <Arrow x1={155} y1={112} x2={168} y2={112} />
      <text x="100" y="215" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Extensión de Rodilla Sentado</text>
    </svg>
  );
}

// ─── 21. Pelvic Tilt ──────────────────────────────────────────────────────────
export function IlluPelvicTilt() {
  return (
    <svg viewBox="0 0 260 185" className="w-full h-full">
      <rect width="260" height="185" fill={B.bg} />
      <Mat x={15} y={144} w={230} h={12} />
      <SupineFigure kneesUp />
      <Arrow x1={105} y1={110} x2={105} y2={98} />
      <text x="130" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Retroversión Pélvica</text>
    </svg>
  );
}

// ─── 22. Lumbar Rotation stretch ──────────────────────────────────────────────
export function IlluLumbarRotation() {
  return (
    <svg viewBox="0 0 260 185" className="w-full h-full">
      <rect width="260" height="185" fill={B.bg} />
      <Mat x={15} y={144} w={230} h={12} />
      {/* Head */}
      <circle cx="32" cy="78" r="16" fill={B.skin} />
      <path d="M17,70 Q18,57 32,57 Q46,57 47,70 Q40,61 32,61 Q24,61 17,70 Z" fill={B.hair} />
      {/* Torso on mat */}
      <path d="M48,74 Q47,98 52,106 L150,106 Q155,98 153,74 Q128,67 100,67 Q72,67 48,74 Z" fill={B.body} />
      {/* Left arm extended out */}
      <path d="M62,76 Q50,76 30,76 Q22,76 20,80 Q18,84 24,86 Q44,86 60,86 Z" fill={B.bodyDk} />
      <circle cx="19" cy="81" r="6" fill={B.skin} />
      {/* Right arm extended out */}
      <path d="M140,76 Q162,76 180,76 Q188,76 190,80 Q192,84 186,86 Q166,86 140,86 Z" fill={B.body} />
      <circle cx="191" cy="81" r="6" fill={B.skin} />
      {/* Left leg crossed over right */}
      <path d="M75,100 Q78,112 85,128 Q90,138 96,140 Q104,140 108,132 Q112,120 108,108 Q100,96 90,92 Z" fill={B.bodyDk} />
      {/* Right leg relatively straight */}
      <path d="M112,100 Q116,118 120,140 Q123,148 128,146 Q133,144 132,136 Q128,114 124,100 Z" fill={B.body} />
      <ellipse cx="118" cy="143" rx="10" ry="5" fill={B.bodyDk} />
      <ellipse cx="130" cy="143" rx="10" ry="5" fill={B.body} />
      {/* Rotation arrows */}
      <Arrow x1={96} y1={100} x2={88} y2={88} curved />
      <text x="130" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Rotación Lumbar</text>
    </svg>
  );
}

// ─── 23. Ankle Pumps ─────────────────────────────────────────────────────────
export function IlluAnklePumps() {
  return (
    <svg viewBox="0 0 260 185" className="w-full h-full">
      <rect width="260" height="185" fill={B.bg} />
      <Mat x={15} y={148} w={230} h={12} />
      <SupineFigure kneesUp={false} />
      {/* Ankle arrow */}
      <Arrow x1={167} y1={155} x2={167} y2={140} />
      <Arrow x1={175} y1={155} x2={175} y2={140} />
      <text x="130" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Bombeos de Tobillo</text>
    </svg>
  );
}

// ─── 24. Foam Roller Thoracic ────────────────────────────────────────────────
export function IlluFoamRollerThoracic() {
  return (
    <svg viewBox="0 0 260 185" className="w-full h-full">
      <rect width="260" height="185" fill={B.bg} />
      <Mat x={15} y={148} w={230} h={12} />
      {/* Foam roller */}
      <rect x="80" y="128" width="100" height="22" rx="11" fill="#93C5FD" opacity="0.8" />
      <rect x="82" y="130" width="96" height="8" rx="4" fill="#BFDBFE" opacity="0.5" />
      {/* Body over roller */}
      <circle cx="40" cy="82" r="16" fill={B.skin} />
      <path d="M25,74 Q26,62 40,62 Q54,62 55,74 Q48,65 40,65 Q32,65 25,74 Z" fill={B.hair} />
      <path d="M55,78 Q54,102 59,110 L190,110 Q194,102 193,78 Q168,70 122,70 Q76,70 55,78 Z" fill={B.body} />
      {/* Head hands support */}
      <path d="M62,80 Q55,95 54,116 Q57,120 62,118 Q67,116 66,108 Q65,93 68,80 Z" fill={B.body} />
      <circle cx="54" cy="118" r="5" fill={B.skin} />
      {/* Knees bent up */}
      <path d="M150,102 Q158,86 165,68 Q168,60 173,62 Q178,64 176,72 Q168,88 158,106 Z" fill={B.body} />
      <path d="M168,60 Q180,56 196,58 Q204,60 204,64 Q204,68 196,68 Q180,68 170,68 Z" fill={B.bodyDk} />
      <circle cx="204" cy="63" r="6" fill={B.bodyDk} />
      <path d="M168,102 Q174,86 180,68 Q182,60 187,62 Q192,64 190,72 Q184,88 176,106 Z" fill={B.bodyDk} />
      <Arrow x1={100} y1={120} x2={100} y2={105} />
      <text x="130" y="178" textAnchor="middle" fontSize="11" fontWeight="700" fill={B.bodyDk} fontFamily="system-ui">Extensión Torácica (Foam Roller)</text>
    </svg>
  );
}

// ─── Mapa: ejercicio ID → ilustración ────────────────────────────────────────
export const ILLUSTRATION_MAP: Record<string, React.FC> = {
  // Standing
  "shoulder-external-rotation":  IlluShoulderExternalRotation,
  "shoulder-abduction":          IlluLateralRaise,
  "shoulder-flexion":            IlluShoulderPress,
  "dumbbell-lateral-raise":      IlluLateralRaise,
  "shoulder-press":              IlluShoulderPress,
  "resistance-band-row":         IlluBandRow,
  "bent-row":                    IlluBandRow,
  "band-row":                    IlluBandRow,
  "band-shoulder-rotation":      IlluShoulderExternalRotation,
  "band-pull-apart":             IlluBandRow,
  "band-face-pull":              IlluBandRow,
  "lateral-raise":               IlluLateralRaise,
  "dumbbell-front-raise":        IlluLateralRaise,
  "dumbbell-rear-delt-fly":      IlluRDL,
  "wall-angel":                  IlluShoulderPress,
  "band-w-exercise":             IlluBandRow,
  "band-diagonal-reach":         IlluLateralRaise,
  "band-internal-rotation":      IlluShoulderExternalRotation,
  "hammer-curl":                 IlluShoulderExternalRotation,
  "bicep-curl":                  IlluShoulderExternalRotation,
  "elbow-flexion":               IlluShoulderExternalRotation,
  "band-elbow-flexion-curl":     IlluShoulderExternalRotation,
  "tricep-extension":            IlluShoulderPress,
  "tricep-extension-band":       IlluShoulderPress,
  "wrist-flexion-extension":     IlluShoulderExternalRotation,
  "eccentric-wrist-extension":   IlluShoulderExternalRotation,
  "pronation-supination-dumbbell": IlluShoulderExternalRotation,
  // Squat / lunge
  "goblet-squat":                IlluSquat,
  "goblet-squat-ball":           IlluSquat,
  "bosu-squat":                  IlluSquat,
  "sumo-squat-dumbbell":         IlluSquat,
  "wall-sit":                    IlluSquat,
  "kb-goblet":                   IlluSquat,
  "bosu-hiphinge":               IlluRDL,
  "lunge":                       IlluLunge,
  "rdl":                         IlluRDL,
  "single-leg-deadlift":         IlluRDL,
  "kb-swing":                    IlluRDL,
  "kb-turkish-getup":            IlluRDL,
  "suitcase-carry":              IlluSquat,
  // Supine / floor
  "glute-bridge":                IlluGluteBridge,
  "hip-thrust-dumbbell":         IlluGluteBridge,
  "ball-bridge":                 IlluGluteBridge,
  "pelvic-tilt":                 IlluPelvicTilt,
  "lumbar-rotation":             IlluLumbarRotation,
  "knee-to-chest":               IlluKneeToChest,
  "dead-bug":                    IlluDeadBug,
  "band-deadbug":                IlluDeadBug,
  "reverse-crunch":              IlluKneeToChest,
  "ankle-pumps":                 IlluAnklePumps,
  "hip-flexor-stretch":          IlluHipFlexorStretch,
  "clamshell":                   IlluSideLying,
  "hip-abduction":               IlluSideLying,
  "band-hip-abduction":          IlluSideLying,
  "band-hip-abd":                IlluSideLying,
  "lateral-band-walk":           IlluSideLying,
  "monster-walk":                IlluSideLying,
  "fire-hydrant":                IlluSideLying,
  "standing-hip-extension-band": IlluSideLying,
  "hip-abd-sidelying":           IlluSideLying,
  // 4-point
  "bird-dog":                    IlluBirdDog,
  "cat-cow":                     IlluCatCow,
  // Prone
  "prone-hip-extension":         IlluProneHipExtension,
  "prone-hip-ext":               IlluProneHipExtension,
  "prone-hip-ext-wt":            IlluProneHipExtension,
  "mckenzie-press":              IlluMcKenziePress,
  "superman":                    IlluProneHipExtension,
  "ball-lumbar-extension":       IlluMcKenziePress,
  // Plank
  "plank":                       IlluPlank,
  "side-plank":                  IlluPlank,
  "bosu-plank":                  IlluPlank,
  "bosu-balance":                IlluPlank,
  // Seated
  "seated-knee-extension":       IlluKneeExtension,
  "terminal-knee-extension":     IlluKneeExtension,
  "step-down-eccentric":         IlluLunge,
  "cervical-retraction":         IlluCervicalSeated,
  "cervical-ret":                IlluCervicalSeated,
  "deep-neck-flexor":            IlluCervicalSeated,
  "cervical-extension-band":     IlluCervicalSeated,
  "cervical-side-bend-band":     IlluCervicalSeated,
  "cervical-rotation-active":    IlluCervicalSeated,
  "scm-stretch":                 IlluCervicalSeated,
  "thoracic-rotation-seated":    IlluCervicalSeated,
  "open-book-stretch":           IlluLumbarRotation,
  // Foam roller
  "foam-thoracic":               IlluFoamRollerThoracic,
  "childs-pose":                 IlluCatCow,
  "ball-wall-squat":             IlluSquat,
  "ball-hamstring-curl":         IlluGluteBridge,
  "ball-rollout":                IlluPlank,
  "chest-opener-ball":           IlluMcKenziePress,
  "pallof-press-band":           IlluBandRow,
  "star-excursion-balance":      IlluSquat,
  "single-leg-balance-bosu":     IlluSquat,
  "dorsiflexion-band":           IlluAnklePumps,
  "heel-toe-walk":               IlluAnklePumps,
  "intrinsic-foot-towel-curl":   IlluAnklePumps,
  "nerve-flossing":              IlluKneeExtension,
  "band-row-seated":             IlluBandRow,
};
