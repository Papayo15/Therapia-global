#!/usr/bin/env node
/**
 * mergeRegistry.js
 *
 * Genera data/master-registry.json fusionando:
 *   - Canal A: 180 ejercicios de canal-a-maestro.json (con datos 3D)
 *   - Canal B: 220 técnicas de osteopatía del registry viejo
 *   - Canal C: 72 estiramientos de canal-c-maestro.json (con datos 3D)
 * Total: 472 entradas
 */
"use strict";
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const ROOT    = path.join(__dirname, "..");
const DESKTOP = path.join(os.homedir(), "Desktop");

// ─── Normalización segmento → grupo_articular ─────────────────────────────────
const SEG_MAP = {
  Hombro: "hombro", Cervical: "cervical", Torácica: "toracica",
  Lumbar: "lumbar", Sacroilíaca: "sacroiliaca", ATM: "atm",
  Core: "lumbar", Columna: "lumbar", Espalda: "toracica", Pecho: "toracica",
  Cadera: "cadera", Glúteo: "cadera", Rodilla: "rodilla",
  Pierna: "rodilla", Tobillo: "tobillo", Pie: "pie",
  Codo: "codo", Muñeca: "muneca",
};

const GRUPO_LABEL = {
  hombro: "Hombro", cervical: "Cervical", toracica: "Torácica",
  lumbar: "Lumbar", sacroiliaca: "Sacroilíaca", atm: "ATM",
  cadera: "Cadera", rodilla: "Rodilla", tobillo: "Tobillo",
  pie: "Pie", codo: "Codo", muneca: "Muñeca",
};

// ─── Difficulty desde fase de evolución ──────────────────────────────────────
function toDifficulty(fase) {
  if (fase <= 1) return "beginner";
  if (fase === 2) return "beginner";
  if (fase === 3) return "intermediate";
  return "advanced";
}

// ─── Mapear entrada canal-a/c al formato RegistryEntry ───────────────────────
function mapEntry(ex, canal) {
  const seg       = ex.segmento || "";
  const grupoKey  = SEG_MAP[seg] || "lumbar";
  const instrList = ex.instruccion_abuela ? [ex.instruccion_abuela] : [];

  return {
    id:            ex.id,
    canal,
    canal_label:   canal === "A" ? "Ejercicio Activo" : "Estiramiento",
    tipo_osteopatia: null,
    grupo_articular: grupoKey,
    grupo_label:   GRUPO_LABEL[grupoKey] || seg,
    nombre_es:     ex.nombre,
    nombre_en:     ex.nombre,          // sin traducción por ahora
    titulo:        (ex.patologias_clave || []).join(" · ") || ex.nombre,
    equipo:        ex.herramienta ? [ex.herramienta] : [],
    difficulty:    toDifficulty(ex.fase_evolucion),
    setup_paciente:  "",
    setup_terapeuta: "",
    contacto_manos:  "",
    ejecucion_tecnica: ex.nota_clinica || "",
    fisiologia_basica: ex.instruccion_abuela || "",
    pasos:         instrList,
    visual_pixar_prompt: "",
    video_url:     "",
    cloudflare_id: "",
    // ── Campos 3D ──────────────────────────────────────────────────────────
    mesh_id_nike3d: ex.mesh_id_nike3d ?? null,
    skeleton_focus: ex.skeleton_focus ?? null,
    glb_region:    ex.glb_region ?? null,
    bilateral:     ex.bilateral ?? false,
    patologias_clave: ex.patologias_clave ?? [],
  };
}

// ─── Cargar fuentes ───────────────────────────────────────────────────────────
console.log("\n─── mergeRegistry.js ─────────────────────────────────────────────────");

const canalAPath = path.join(ROOT, "data/canal-a-maestro.json");
const canalCPath = path.join(ROOT, "data/canal-c-maestro.json");
const oldRegPath = path.join(ROOT, "data/master-registry.json");

if (!fs.existsSync(canalAPath)) { console.error("❌ No encontrado:", canalAPath); process.exit(1); }
if (!fs.existsSync(canalCPath)) { console.error("❌ No encontrado:", canalCPath); process.exit(1); }
if (!fs.existsSync(oldRegPath)) { console.error("❌ No encontrado:", oldRegPath); process.exit(1); }

const canalA  = JSON.parse(fs.readFileSync(canalAPath, "utf8"));
const canalC  = JSON.parse(fs.readFileSync(canalCPath, "utf8"));
const oldReg  = JSON.parse(fs.readFileSync(oldRegPath, "utf8"));

// ─── Extraer Canal B del registry viejo ───────────────────────────────────────
const canalBEntries = Object.values(oldReg).filter(e => e.canal === "B");
console.log(`   Canal B (osteopatía): ${canalBEntries.length} entradas del registry anterior`);

// ─── Mapear Canal A ───────────────────────────────────────────────────────────
const aEntries = Object.values(canalA.bloques).flat().map(ex => mapEntry(ex, "A"));
console.log(`   Canal A (ejercicios): ${aEntries.length} entradas de canal-a-maestro.json`);

// ─── Mapear Canal C ───────────────────────────────────────────────────────────
const cEntries = Object.values(canalC.zonas).flat().map(ex => mapEntry(ex, "C"));
console.log(`   Canal C (estiramientos): ${cEntries.length} entradas de canal-c-maestro.json`);

// ─── Combinar en objeto keyed by id ───────────────────────────────────────────
const unified = {};

for (const e of [...aEntries, ...canalBEntries, ...cEntries]) {
  unified[e.id] = e;
}

const total = Object.keys(unified).length;
console.log(`   Total: ${total} entradas`);

// ─── Escribir output ──────────────────────────────────────────────────────────
const outPath = path.join(ROOT, "data/master-registry.json");
fs.writeFileSync(outPath, JSON.stringify(unified, null, 2), "utf8");
fs.writeFileSync(path.join(DESKTOP, "master-registry.json"), JSON.stringify(unified, null, 2), "utf8");

console.log(`   ✅ ${outPath}`);
console.log(`   ✅ ~/Desktop/master-registry.json`);
console.log("\n─────────────────────────────────────────────────────────────────────\n");
