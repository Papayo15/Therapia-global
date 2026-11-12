// pipeline/generateMasterRegistry.js
// Generates data/master-registry.json with 800 skeleton entries
// Canal A: 400 (Ejercicio Activo), Canal B: 220 (Osteopatía), Canal C: 180 (Estiramiento)
// Run: node pipeline/generateMasterRegistry.js

const fs = require('fs');
const path = require('path');

const grupos = [
  "cervical", "toracica", "lumbar", "sacroiliaca", "atm",
  "hombro", "codo", "muneca", "cadera", "rodilla", "tobillo", "pie"
];

const distribucion = {
  A: {
    cervical: 35, toracica: 30, lumbar: 45, sacroiliaca: 25, atm: 10,
    hombro: 45, codo: 20, muneca: 15, cadera: 45, rodilla: 45, tobillo: 45, pie: 40
  },
  B: {
    cervical: 20, toracica: 20, lumbar: 25, sacroiliaca: 20, atm: 15,
    hombro: 20, codo: 10, muneca: 10, cadera: 25, rodilla: 20, tobillo: 20, pie: 15
  },
  C: {
    cervical: 15, toracica: 15, lumbar: 15, sacroiliaca: 15, atm: 15,
    hombro: 15, codo: 15, muneca: 15, cadera: 15, rodilla: 15, tobillo: 15, pie: 15
  }
};

const nombreGrupo = {
  cervical: "Cervical", toracica: "Torácica", lumbar: "Lumbar",
  sacroiliaca: "Sacroilíaca", atm: "ATM / Mandíbula", hombro: "Hombro",
  codo: "Codo", muneca: "Muñeca / Mano", cadera: "Cadera",
  rodilla: "Rodilla", tobillo: "Tobillo", pie: "Pie"
};

// ─── Visual prompts ───────────────────────────────────────────────────────────

// Canal A — amber glow on contracting muscles
function visibleBodyPrompt(grupo) {
  return (
    `Scientific holographic medical visualization, abstract anatomical model (NO FACES, neutro), ` +
    `${grupo} region focus. Full transparent-ghost muscle tissue (90% transparency) revealing ` +
    `the entire opaque skeletal system (spine, ribs, and all limb bones). ` +
    `Active muscles glow AMBER during contraction. ` +
    `Pure white void (#FFFFFF), no shadows, seamless 9s loop, 1080p.`
  );
}

// Canal C — cyan glow on stretched antagonist muscles
function visibleBodyPromptC(grupo) {
  return (
    `Scientific holographic medical visualization, abstract anatomical model (NO FACES, neutro), ` +
    `${grupo} region focus. Full transparent-ghost muscle tissue (90% transparency) revealing ` +
    `opaque skeleton. Muscles under tension/stretch glow SOFT CYAN/COOL BLUE visualizing ` +
    `elongation and relaxation. ` +
    `Pure white void (#FFFFFF), no shadows, seamless 9s loop, 1080p.`
  );
}

// ─── Canal B setup defaults ───────────────────────────────────────────────────
const setupPacienteB = {
  cervical:    "Decúbito supino, cuello en posición neutra, brazos a los lados",
  toracica:    "Decúbito supino, almohada bajo columna torácica, brazos cruzados",
  lumbar:      "Decúbito supino, caderas y rodillas flexionadas 90°, pies en camilla",
  sacroiliaca: "Decúbito lateral sobre el lado a tratar, rodilla superior flexionada",
  atm:         "Decúbito supino, cabeza en posición neutra, boca ligeramente abierta",
  hombro:      "Decúbito supino, brazo en ligera abducción, codo extendido",
  codo:        "Decúbito supino, codo semiflexionado, antebrazo en supinación",
  muneca:      "Sentado, antebrazo apoyado en camilla, muñeca en neutro",
  cadera:      "Decúbito supino, cadera en posición neutra, rodilla extendida",
  rodilla:     "Decúbito supino, rodilla semiflexionada sobre cuña de posicionamiento",
  tobillo:     "Decúbito supino, pie ligeramente saliendo del borde de la camilla",
  pie:         "Decúbito supino, pie apoyado sobre muslo del terapeuta"
};

const setupTerapeutaB = {
  cervical:    "De pie en la cabecera, codos flexionados y apoyados en la camilla",
  toracica:    "De pie lateral al paciente, manos cruzadas sobre la apófisis espinosa",
  lumbar:      "De pie lateral al paciente, cuerpo girado 45° hacia la camilla",
  sacroiliaca: "De pie detrás del paciente, un pie adelantado como punto de apoyo",
  atm:         "Sentado a la cabecera, codos apoyados sobre sus propios muslos",
  hombro:      "De pie lateral, con una mano fijando la escápula y la otra en el húmero",
  codo:        "De pie lateral, estabilizando el húmero con una mano, el antebrazo con la otra",
  muneca:      "Sentado frente al paciente, antebrazo del paciente entre sus manos",
  cadera:      "De pie lateral, mano proximal en EIAS y mano distal en el trocánter mayor",
  rodilla:     "De pie lateral, mano proximal en cóndilo femoral, distal en la tuberosidad tibial",
  tobillo:     "De pie al pie de la camilla, sujetando el talón y el dorso del pie",
  pie:         "Sentado al pie de la camilla, ambas manos rodeando el arco plantar"
};

const contactoManosB = {
  cervical:    "Yemas de los dedos II-III-IV bajo el occipucio bilateral, sin presión activa",
  toracica:    "Eminencia hipotenar sobre apófisis transversa, manos en V invertida",
  lumbar:      "Pulgares sobre las apófisis espinosas L1-L5, dedos en la cresta ilíaca",
  sacroiliaca: "Talón de la mano sobre el sacro, dedos hacia la cresta ilíaca posterior",
  atm:         "Yemas del dedo índice sobre el cóndilo mandibular bilateral",
  hombro:      "Presa en pinza sobre la cabeza humeral, pulgar posterior e índice anterior",
  codo:        "Presa bimanual: pulgar sobre olécranon y dedos sobre fosa cubital",
  muneca:      "Pulgares sobre el semilunar y escafoides, dedos envolviendo el carpo",
  cadera:      "Presa en V: pulgar sobre trocánter mayor, dedos sobre el cuello femoral",
  rodilla:     "Pulgares sobre la interlínea articular, dedos en los cóndiles femorales",
  tobillo:     "Presa bimanual: calcáneo en palma, maléolos entre los dedos II y III",
  pie:         "Ambos pulgares sobre el arco longitudinal, dedos en el dorso del pie"
};

// ─── Canal C setup defaults ───────────────────────────────────────────────────
const setupPacienteC = {
  cervical:    "De pie o sentado, columna neutra, hombros relajados",
  toracica:    "Sentado en silla, manos entrelazadas detrás de la cabeza",
  lumbar:      "Decúbito supino, rodillas al pecho, zona lumbar en contacto con suelo",
  sacroiliaca: "Decúbito supino, pierna cruzada en figura 4 sobre la rodilla contraria",
  atm:         "Sentado, boca ligeramente abierta, lengua en paladar",
  hombro:      "De pie, brazo cruzado al pecho, codo a 90°",
  codo:        "De pie, brazo extendido, muñeca en extensión forzada suave",
  muneca:      "Sentado, antebrazo apoyado, dedos en extensión hacia el suelo",
  cadera:      "Decúbito supino, cadera a 90°, cruce de pierna en mariposa",
  rodilla:     "De pie cerca de una pared, rodilla flexionada, talón al glúteo",
  tobillo:     "De pie con punta del pie apoyada en la pared, talón en suelo",
  pie:         "Sentado, pie sobre el muslo contrario, arco plantar accesible"
};

// ─── Equipment per canal ──────────────────────────────────────────────────────
const equipoCanal = {
  A: {
    cervical: ["banda", "fitball", "peso corporal"],
    toracica: ["foam roller", "polea", "fitball"],
    lumbar: ["fitball", "kettlebell", "bosu"],
    sacroiliaca: ["banda", "fitball", "kettlebell"],
    atm: ["peso corporal", "manual"],
    hombro: ["polea", "mancuerna", "banda"],
    codo: ["mancuerna", "banda"],
    muneca: ["pesas ligeras", "gomas"],
    cadera: ["banda", "kettlebell", "bosu"],
    rodilla: ["bosu", "banda", "fitball"],
    tobillo: ["bosu", "banda", "kettlebell"],
    pie: ["pelota", "banda", "bosu"]
  },
  B: {
    cervical: ["manual"], toracica: ["manual"], lumbar: ["manual"],
    sacroiliaca: ["manual"], atm: ["manual"], hombro: ["manual"],
    codo: ["manual"], muneca: ["manual"], cadera: ["manual"],
    rodilla: ["manual"], tobillo: ["manual"], pie: ["manual"]
  },
  C: {
    cervical: ["peso corporal"],
    toracica: ["foam roller", "peso corporal"],
    lumbar: ["fitball", "peso corporal"],
    sacroiliaca: ["peso corporal"],
    atm: ["peso corporal"],
    hombro: ["peso corporal"],
    codo: ["peso corporal"],
    muneca: ["peso corporal"],
    cadera: ["banda", "peso corporal"],
    rodilla: ["peso corporal"],
    tobillo: ["peso corporal"],
    pie: ["pelota", "peso corporal"]
  }
};

// ─── Equipment alternatives (if primary not available → fallback) ─────────────
const equipoAlternativa = {
  A: {
    cervical:    ["peso corporal"],
    toracica:    ["peso corporal", "foam roller"],
    lumbar:      ["peso corporal", "fitball"],
    sacroiliaca: ["peso corporal"],
    atm:         ["peso corporal"],
    hombro:      ["banda", "peso corporal"],
    codo:        ["peso corporal"],
    muneca:      ["peso corporal"],
    cadera:      ["banda", "peso corporal"],
    rodilla:     ["banda", "peso corporal"],
    tobillo:     ["banda", "peso corporal"],
    pie:         ["peso corporal"]
  },
  B: {}, // Canal B es siempre manual — sin alternativa
  C: {
    cervical:    ["peso corporal"],
    toracica:    ["peso corporal"],
    lumbar:      ["peso corporal"],
    sacroiliaca: ["peso corporal"],
    atm:         ["peso corporal"],
    hombro:      ["peso corporal"],
    codo:        ["peso corporal"],
    muneca:      ["peso corporal"],
    cadera:      ["peso corporal"],
    rodilla:     ["peso corporal"],
    tobillo:     ["peso corporal"],
    pie:         ["peso corporal"]
  }
};

// ─── Generate registry ────────────────────────────────────────────────────────
const registry = {};
let total = 0;

['A', 'B', 'C'].forEach(canal => {
  grupos.forEach(grupo => {
    const count = distribucion[canal][grupo];
    const prefix = grupo.substring(0, 3).toUpperCase();

    const canalLabel = canal === 'A' ? 'Ejercicio Activo'
                     : canal === 'B' ? 'Osteopatía'
                     : 'Estiramiento';

    const tipoOsteo = canal === 'B'
      ? (["atm", "sacroiliaca", "cervical"].includes(grupo) ? "Craneal"
        : ["toracica", "hombro", "cadera", "lumbar"].includes(grupo) ? "Visceral"
        : "Estructural")
      : null;

    for (let i = 1; i <= count; i++) {
      const id = `${canal}_${prefix}_${String(i).padStart(3, '0')}`;
      const nombreEs = `${nombreGrupo[grupo]} — ${canalLabel} ${String(i).padStart(2, '0')}`;

      registry[id] = {
        id,
        canal,
        canal_label: canalLabel,
        tipo_osteopatia: tipoOsteo,
        grupo_articular: grupo,
        grupo_label: nombreGrupo[grupo],
        nombre_es: nombreEs,
        nombre_en: `${nombreGrupo[grupo]} — ${canalLabel} ${String(i).padStart(2, '0')}`,
        titulo: nombreEs,
        equipo: equipoCanal[canal][grupo],
        difficulty: i <= Math.floor(count * 0.4) ? "beginner"
                  : i <= Math.floor(count * 0.7) ? "intermediate"
                  : "advanced",
        setup_paciente: canal === 'B' ? setupPacienteB[grupo]
                      : canal === 'C' ? setupPacienteC[grupo]
                      : "Posición del paciente definida en protocolo.",
        setup_terapeuta: canal === 'B' ? setupTerapeutaB[grupo] : "",
        contacto_manos:  canal === 'B' ? contactoManosB[grupo] : "",
        ejecucion_tecnica: "PENDIENTE: Descripción técnica clínica (lenguaje de terapeuta).",
        fisiologia_basica: "PENDIENTE: Analogía coloquial para el paciente.",
        pasos: [
          "Paso 1: Posición inicial.",
          "Paso 2: Ejecución del movimiento.",
          "Paso 3: Retorno y respiración."
        ],
        visual_pixar_prompt: canal === 'C' ? visibleBodyPromptC(grupo) : visibleBodyPrompt(grupo),
        // ── YouTube / Prescription Builder fields ──────────────────────────
        youtube_id: "",
        youtube_start_seconds: 0,
        equipo_alternativa: equipoAlternativa[canal]?.[grupo] ?? ["peso corporal"],
        instructions_eli5: [
          "Paso 1: Posición inicial.",
          "Paso 2: Realiza el movimiento lentamente.",
          "Paso 3: Vuelve al inicio y respira."
        ],
        // ── Legacy video fields (congelados) ──────────────────────────────
        video_url: "",
        cloudflare_id: ""
      };
      total++;
    }
  });
});

const outPath = path.join(__dirname, '..', 'data', 'master-registry.json');
fs.writeFileSync(outPath, JSON.stringify(registry, null, 2), 'utf8');
console.log(`✅ Master Registry generado: ${total} entradas → data/master-registry.json`);

const countA = Object.values(registry).filter(e => e.canal === 'A').length;
const countB = Object.values(registry).filter(e => e.canal === 'B').length;
const countC = Object.values(registry).filter(e => e.canal === 'C').length;
console.log(`   Canal A (Ejercicio Activo): ${countA} técnicas`);
console.log(`   Canal B (Osteopatía):       ${countB} técnicas`);
console.log(`   Canal C (Estiramiento):     ${countC} técnicas`);
