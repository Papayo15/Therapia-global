#!/usr/bin/env node
/**
 * fixLaterality.js v2
 *
 * Aplica los 3 errores estructurales corregidos:
 *  1. mesh_id_nike3d bilateral → array ["m_..._L","m_..._R"]
 *  2. IDs correlativos entre bloques (TRACCION 031–060, etc.)
 *  3. Rotador cuff S.I.T.E. más específico
 *
 * Además añade:
 *  - campo `bilateral` (true/false)
 *  - campo `glb_region` (region del viewer nike3d-regions.glb)
 */
"use strict";
const fs   = require("fs");
const path = require("path");
const os   = require("os");

// ─── GLB Region map (segmento → nodo en nike3d-regions.glb) ──────────────────
const SEGMENTO_TO_GLB = {
  Hombro:      "SHOULDER",
  Pecho:       "THORAX_ANT",
  Espalda:     "THORAX_POST",
  Core:        "LUMBAR_CORE",
  Columna:     "LUMBAR_CORE",
  Cadera:      "PELVIS_HIP",
  Glúteo:      "PELVIS_HIP",
  Rodilla:     "KNEE",
  Pierna:      "THIGH",
  Tobillo:     "LOWER_LEG",
  Pie:         "LOWER_LEG",
  Cervical:    "CERVICAL",
  Codo:        "ARM",
  Muñeca:      "FOREARM",
  Torácica:    "THORAX_POST",
  Lumbar:      "LUMBAR_CORE",
  Sacroilíaca: "PELVIS_HIP",
  ATM:         "SKULL",
};
// Regiones que tienen variante _L/_R en el GLB
const LATERAL_REGIONS = new Set(["SHOULDER","ARM","FOREARM"]);

// ─── Overrides por ID (IDs VIEJOS, antes de renumerado) ──────────────────────
// Valor: string "m_..._R" (unilateral) o array ["m_..._L","m_..._R"] (bilateral directo)
const OVERRIDES = {
  // Manguito — abducción overhead → supraspinatus
  "A_EMP_007": "m_supraspinatus_R",                                       // Pike Suelo
  "A_EMP_008": "m_supraspinatus_R",                                       // Pike Elevado
  "A_EMP_009": "m_supraspinatus_R",                                       // Pike Bosu
  "A_EMP_010": ["m_supraspinatus_L","m_supraspinatus_R"],                 // Press Mil. bilateral
  "A_EMP_011": ["m_supraspinatus_L","m_supraspinatus_R"],                 // Press Mil. Liga bilateral
  "A_EMP_012": "m_supraspinatus_R",                                       // Alterno unilateral

  // Serratus anterior bilateral
  "A_EMP_021": ["m_serratus_anterior_L","m_serratus_anterior_R"],

  // Manguito — rotación externa → infraspinatus
  "A_TRA_013": ["m_infraspinatus_L","m_infraspinatus_R"],                 // Face Pull bilateral
  "A_TRA_014": "m_infraspinatus_R",                                       // Vuelos Post Manc
  "A_TRA_015": "m_infraspinatus_R",                                       // Vuelos Post Liga

  // Manguito — teres minor
  "A_TRA_030": "m_teres_minor_R",

  // Manguito — abducción 90°+ en Remo al Mentón
  "A_TRA_019": "m_supraspinatus_R",

  // Pata de ganso (rodilla medial)
  "A_ROD_002": "m_vastus_medialis_R",
  "A_ROD_017": "m_vastus_medialis_R",
  "A_ROD_018": "m_vastus_medialis_R",    // TKE
  "A_ROD_019": "m_semitendinosus_R",     // Curl Isquio
  "A_ROD_020": "m_semimembranosus_R",
  "A_ROD_021": "m_biceps_femoris_long_head_R",
  "A_ROD_027": "m_vastus_medialis_R",

  // Movilidad hombro
  "A_MOV_030": "m_infraspinatus_R",

  // Canal C
  "C_HOM_005": ["m_pectoralis_major_clavicular_L","m_pectoralis_major_clavicular_R"],
  "C_HOM_006": "m_subscapularis_R",
  "C_HOM_007": "m_infraspinatus_R",
  "C_HOM_009": "m_biceps_brachii_long_head_R",
  "C_HOM_010": ["m_infraspinatus_L","m_infraspinatus_R"],
  "C_PIE_009": "m_gracilis_R",
};

// ─── IDs unilaterales (IDs VIEJOS) ───────────────────────────────────────────
// Todo lo que NO esté aquí es bilateral → mesh se convierte a array
const UNILATERAL_IDS = new Set([
  // EMPUJE — unilaterales
  "A_EMP_012","A_EMP_020","A_EMP_022","A_EMP_025","A_EMP_026","A_EMP_030",
  // TRACCION — unilaterales
  "A_TRA_010","A_TRA_012",
  "A_TRA_016","A_TRA_017","A_TRA_018","A_TRA_019",
  "A_TRA_021","A_TRA_022","A_TRA_023","A_TRA_025","A_TRA_030",
  // CADERA_GLUTEO — unilaterales
  "A_CAD_003","A_CAD_007","A_CAD_008",
  "A_CAD_011","A_CAD_012","A_CAD_013","A_CAD_014",
  "A_CAD_017","A_CAD_018","A_CAD_019","A_CAD_020",
  "A_CAD_021","A_CAD_022","A_CAD_027","A_CAD_028","A_CAD_029","A_CAD_030",
  // PIERNA_RODILLA — unilaterales
  "A_ROD_004","A_ROD_008","A_ROD_009","A_ROD_010","A_ROD_011",
  "A_ROD_012","A_ROD_013","A_ROD_014","A_ROD_015",
  // CORE_COLUMNA — unilaterales
  "A_COR_020","A_COR_026","A_COR_028",
  // EXTREMIDADES_MOVILIDAD — unilaterales
  "A_MOV_006","A_MOV_007","A_MOV_008","A_MOV_009","A_MOV_010","A_MOV_030",
  // CANAL C — CUELLO (estiramientos de un lado)
  "C_CER_001","C_CER_002","C_CER_003","C_CER_006","C_CER_007",
  // CANAL C — HOMBRO (estiramientos unilaterales)
  "C_HOM_001","C_HOM_002","C_HOM_003","C_HOM_006","C_HOM_007","C_HOM_009","C_HOM_012",
  // CANAL C — CADERA
  "C_CAD_001","C_CAD_003","C_CAD_004","C_CAD_006",
  // CANAL C — PIERNA
  "C_PIE_002","C_PIE_006","C_PIE_009",
  // CANAL C — MANO/MUÑECA (estiramientos unilaterales)
  "C_MAN_001","C_MAN_002","C_MAN_003","C_MAN_004",
  "C_MAN_005","C_MAN_006","C_MAN_007","C_MAN_008",
]);

// ─── Offsets de renumerado ─────────────────────────────────────────────────────
const CANAL_A_OFFSETS = {
  EMPUJE: 0, TRACCION: 30, CADERA_GLUTEO: 60,
  PIERNA_RODILLA: 90, CORE_COLUMNA: 120, EXTREMIDADES_MOVILIDAD: 150,
};
const CANAL_C_OFFSETS = {
  CUELLO_CERVICAL: 0, HOMBRO_PECHO: 12, COLUMNA_CORE: 24,
  CADERA_GLUTEO: 36, PIERNA_RODILLA_TOBILLO: 48, MANO_MUNECA: 60,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toBilateralArray(mesh) {
  if (Array.isArray(mesh)) return mesh;
  const base = String(mesh).replace(/_[RL]$/, "");
  return [base + "_L", base + "_R"];
}

function getGlbRegion(segmento, bilateral) {
  const base = SEGMENTO_TO_GLB[segmento] || "LUMBAR_CORE";
  if (bilateral) {
    if (LATERAL_REGIONS.has(base)) return [base + "_L", base + "_R"];
    return base; // regions without L/R (THORAX_ANT, KNEE, etc.)
  }
  if (LATERAL_REGIONS.has(base)) return base + "_R";
  return base;
}

function renumberId(id, offset) {
  if (!offset) return id;
  const m = id.match(/^([A-Z][A-Z0-9_]+?)(\d{3})$/);
  if (!m) return id;
  return m[1] + String(parseInt(m[2]) + offset).padStart(3, "0");
}

// ─── Transformación de un ejercicio ───────────────────────────────────────────
function transformExercise(ex) {
  const oldId    = ex.id;
  const override = OVERRIDES[oldId];
  const bilateral = !UNILATERAL_IDS.has(oldId);

  // 1. Determinar mesh_id final
  let mesh;
  if (override !== undefined) {
    mesh = override; // string o array, ya correcto
  } else {
    let m = ex.mesh_id_nike3d || "";
    // Agregar lateralidad si no la tiene aún
    if (!Array.isArray(m) && !String(m).endsWith("_R") && !String(m).endsWith("_L")) {
      const focus = ex.skeleton_focus || "";
      if (focus.endsWith("_R")) m = m + "_R";
      else if (focus.endsWith("_L")) m = m + "_L";
    }
    mesh = m;
  }

  // 2. Convertir a array bilateral si corresponde
  if (bilateral && !Array.isArray(mesh)) {
    mesh = toBilateralArray(mesh);
  }

  // 3. glb_region para el viewer 3D
  const glb_region = getGlbRegion(ex.segmento, bilateral);

  return { ...ex, mesh_id_nike3d: mesh, bilateral, glb_region };
}

// ─── Procesar un archivo JSON ──────────────────────────────────────────────────
function processFile(filePath, blockOffsets) {
  const data    = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const rootKey = data.bloques ? "bloques" : "zonas";

  for (const [blockName, exercises] of Object.entries(data[rootKey])) {
    const offset = blockOffsets[blockName] ?? 0;
    data[rootKey][blockName] = exercises.map(ex => {
      const t = transformExercise(ex);
      return { ...t, id: renumberId(t.id, offset) };
    });
  }
  return data;
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────
function printStats(data, label) {
  const rootKey = data.bloques ? "bloques" : "zonas";
  const all = Object.values(data[rootKey]).flat();
  const arrays  = all.filter(e => Array.isArray(e.mesh_id_nike3d)).length;
  const bils    = all.filter(e => e.bilateral).length;
  const regions = all.filter(e => e.glb_region).length;
  console.log(`   ${label}: ${all.length} ej. | bilateral-array: ${arrays} | bilateral-field: ${bils} | glb_region: ${regions}`);
  // Mostrar rango del segundo bloque para verificar renumerado
  const keys = Object.keys(data[rootKey]);
  if (keys.length > 1) {
    const block = data[rootKey][keys[1]];
    console.log(`   ${keys[1]}: ${block[0].id} → ${block[block.length-1].id}`);
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const ROOT    = path.join(__dirname, "..");
const DESKTOP = path.join(os.homedir(), "Desktop");

console.log("\n─── fixLaterality.js v2 ──────────────────────────────────────────────");

for (const { src, offsets, label } of [
  { src: "data/canal-a-maestro.json", offsets: CANAL_A_OFFSETS, label: "Canal A" },
  { src: "data/canal-c-maestro.json", offsets: CANAL_C_OFFSETS, label: "Canal C" },
]) {
  const srcPath = path.join(ROOT, src);
  if (!fs.existsSync(srcPath)) { console.warn(`⚠ No encontrado: ${srcPath}`); continue; }

  const data = processFile(srcPath, offsets);
  fs.writeFileSync(srcPath, JSON.stringify(data, null, 2), "utf8");
  fs.writeFileSync(path.join(DESKTOP, path.basename(src)), JSON.stringify(data, null, 2), "utf8");

  printStats(data, label);
  console.log(`   ✅ ${srcPath}`);
  console.log(`   ✅ ~/Desktop/${path.basename(src)}`);
}

console.log("\n─────────────────────────────────────────────────────────────────────\n");
