// pipeline/generateMasterRegistry.js
// Generates data/master-registry.json with 620 skeleton entries
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
  }
};

const nombreGrupo = {
  cervical: "Cervical", toracica: "Torácica", lumbar: "Lumbar",
  sacroiliaca: "Sacroilíaca", atm: "ATM / Mandíbula", hombro: "Hombro",
  codo: "Codo", muneca: "Muñeca / Mano", cadera: "Cadera",
  rodilla: "Rodilla", tobillo: "Tobillo", pie: "Pie"
};

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
  }
};

const registry = {};
let total = 0;

['A', 'B'].forEach(canal => {
  grupos.forEach(grupo => {
    const count = distribucion[canal][grupo];
    const prefix = grupo.substring(0, 3).toUpperCase();
    for (let i = 1; i <= count; i++) {
      const id = `${canal}_${prefix}_${String(i).padStart(3, '0')}`;
      const canalLabel = canal === 'A' ? 'Ejercicio Activo' : 'Osteopatía';
      const tipoOsteo = canal === 'B'
        ? (["atm", "sacroiliaca", "cervical"].includes(grupo) ? "Craneal" : ["toracica", "hombro", "cadera", "lumbar"].includes(grupo) ? "Visceral" : "Estructural")
        : null;

      registry[id] = {
        id,
        canal,
        canal_label: canalLabel,
        tipo_osteopatia: tipoOsteo,
        grupo_articular: grupo,
        grupo_label: nombreGrupo[grupo],
        nombre_es: `${nombreGrupo[grupo]} — ${canalLabel} ${String(i).padStart(2, '0')}`,
        nombre_en: `${nombreGrupo[grupo]} — ${canalLabel} ${String(i).padStart(2, '0')}`,
        equipo: equipoCanal[canal][grupo],
        difficulty: i <= Math.floor(count * 0.4) ? "beginner" : i <= Math.floor(count * 0.7) ? "intermediate" : "advanced",
        ejecucion_tecnica: "PENDIENTE: Descripción técnica clínica (lenguaje de terapeuta).",
        fisiologia_basica: "PENDIENTE: Analogía coloquial para el paciente.",
        pasos: ["Paso 1: Posición inicial.", "Paso 2: Ejecución del movimiento.", "Paso 3: Retorno y respiración."],
        visual_pixar: `3D Pixar character, ${nombreGrupo[grupo]} focus. Transparent anatomical view showing key structures. 4K cinematic loop, 30s.`,
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

// Stats
const countA = Object.values(registry).filter(e => e.canal === 'A').length;
const countB = Object.values(registry).filter(e => e.canal === 'B').length;
console.log(`   Canal A (Activo):      ${countA} técnicas`);
console.log(`   Canal B (Osteopatía):  ${countB} técnicas`);
