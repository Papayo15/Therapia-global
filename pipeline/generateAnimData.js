#!/usr/bin/env node
/**
 * generateAnimData.js
 *
 * Genera datos de animación procedimental para todos los ejercicios de Canal A y Canal C.
 * Los datos `anim` describen cómo animar grupos de nodos por región en nike3d-regions.glb.
 *
 * Salida:
 *   data/canal-a-animations.json
 *   data/canal-c-animations.json
 *   ~/Desktop/canal-a-animations.json
 *   ~/Desktop/canal-c-animations.json
 */
"use strict";
const fs   = require("fs");
const path = require("path");
const os   = require("os");

// ─── Config de cámara por región GLB ─────────────────────────────────────────
// camera_offset: [x, y, z] relativo al centro del bounding box de la región
const CAMERA_CONFIG = {
  SKULL:        { target: "SKULL",        offset: [0,  60, 300] },
  CERVICAL:     { target: "CERVICAL",     offset: [0,  40, 350] },
  SHOULDER:     { target: "SHOULDER_R",   offset: [80, 30, 380] },
  SHOULDER_R:   { target: "SHOULDER_R",   offset: [80, 30, 380] },
  SHOULDER_L:   { target: "SHOULDER_L",   offset: [-80,30, 380] },
  ARM:          { target: "ARM_R",        offset: [70, 0,  350] },
  FOREARM:      { target: "FOREARM_R",    offset: [70,-30, 300] },
  THORAX_ANT:   { target: "THORAX_ANT",   offset: [0,  80, 450] },
  THORAX_POST:  { target: "THORAX_POST",  offset: [0,  80,-400] },
  LUMBAR_CORE:  { target: "LUMBAR_CORE",  offset: [0,  0,  450] },
  PELVIS_HIP:   { target: "PELVIS_HIP",   offset: [0, -40, 450] },
  THIGH:        { target: "THIGH",        offset: [0,-100, 450] },
  KNEE:         { target: "KNEE",         offset: [0,-150, 400] },
  LOWER_LEG:    { target: "LOWER_LEG",    offset: [0,-200, 380] },
};

// ─── Patrones de fase por bloque Canal A ──────────────────────────────────────
// axis: eje de rotación del grupo de meshes de la región
// from_deg/to_deg: ángulo inicial → final de la fase
// duration: segundos por fase
const BLOCK_PATTERNS = {
  EMPUJE: {
    axis: "X", phases: {
      eccentric:  { axis:"X", from_deg:0,   to_deg:-60,  duration:2.5 },
      hold:       { duration:0.4 },
      concentric: { axis:"X", from_deg:-60, to_deg:0,    duration:1.5 },
    }
  },
  TRACCION: {
    axis: "X", phases: {
      eccentric:  { axis:"X", from_deg:0,   to_deg:50,   duration:2.5 },
      hold:       { duration:0.4 },
      concentric: { axis:"X", from_deg:50,  to_deg:0,    duration:1.5 },
    }
  },
  CADERA_GLUTEO: {
    axis: "X", phases: {
      eccentric:  { axis:"X", from_deg:0,   to_deg:-45,  duration:2.0 },
      hold:       { duration:0.5 },
      concentric: { axis:"X", from_deg:-45, to_deg:0,    duration:1.2 },
    }
  },
  PIERNA_RODILLA: {
    axis: "X", phases: {
      eccentric:  { axis:"X", from_deg:0,   to_deg:-90,  duration:2.5 },
      hold:       { duration:0.4 },
      concentric: { axis:"X", from_deg:-90, to_deg:0,    duration:1.5 },
    }
  },
  CORE_COLUMNA: {
    axis: "Z", phases: {
      eccentric:  { axis:"Z", from_deg:0,   to_deg:30,   duration:2.0 },
      hold:       { duration:0.5 },
      concentric: { axis:"Z", from_deg:30,  to_deg:0,    duration:1.5 },
    }
  },
  EXTREMIDADES_MOVILIDAD: {
    axis: "X", phases: {
      eccentric:  { axis:"X", from_deg:0,   to_deg:-45,  duration:3.0 },
      hold:       { duration:1.0 },
      concentric: { axis:"X", from_deg:-45, to_deg:0,    duration:2.0 },
    }
  },
};

// ─── Canal C — patrón de estiramiento ────────────────────────────────────────
const CANAL_C_ZONA_PATTERNS = {
  CUELLO_CERVICAL:       { axis:"Z", entry_deg:-30, hold_idle:0.005, camera:"CERVICAL"    },
  HOMBRO_PECHO:          { axis:"X", entry_deg:-35, hold_idle:0.004, camera:"SHOULDER_R"  },
  COLUMNA_CORE:          { axis:"X", entry_deg:45,  hold_idle:0.006, camera:"LUMBAR_CORE" },
  CADERA_GLUTEO:         { axis:"X", entry_deg:-50, hold_idle:0.005, camera:"PELVIS_HIP"  },
  PIERNA_RODILLA_TOBILLO:{ axis:"X", entry_deg:-60, hold_idle:0.005, camera:"KNEE"        },
  MANO_MUNECA:           { axis:"Z", entry_deg:-40, hold_idle:0.004, camera:"FOREARM_R"   },
};

// ─── Velocidad según fase de evolución ───────────────────────────────────────
// Multiplica durations: fase 1 = lento, fase 3 = rápido
const SPEED_BY_FASE = { 1: 1.4, 2: 1.0, 3: 0.75, 4: 0.65 };

// ─── Amplitud según herramienta ──────────────────────────────────────────────
const AMP_BY_TOOL = {
  "Peso Corporal": 1.0,
  "Liga":          0.85,
  "Mancuernas":    0.9,
  "Barra":         1.0,
  "Bosu":          1.1,
  "Foam Roller":   0.7,
  "Pelota":        0.8,
  "TRX":           0.95,
  "Cable":         0.9,
  "Máquina":       1.0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function glbRegionString(glb_region) {
  if (Array.isArray(glb_region)) return glb_region[0];
  return glb_region || "LUMBAR_CORE";
}

function getCameraConfig(glbRegion) {
  const key = glbRegionString(glbRegion).replace(/_[LR]$/, ""); // SHOULDER_R → SHOULDER
  return CAMERA_CONFIG[glbRegionString(glbRegion)] || CAMERA_CONFIG[key] || CAMERA_CONFIG["LUMBAR_CORE"];
}

function scalePhases(phases, speedMult, ampMult) {
  const result = {};
  for (const [name, p] of Object.entries(phases)) {
    const scaled = { ...p };
    if (scaled.duration)  scaled.duration  = +(scaled.duration * speedMult).toFixed(2);
    if (scaled.to_deg !== undefined) scaled.to_deg = +(scaled.to_deg * ampMult).toFixed(1);
    if (scaled.from_deg !== undefined && scaled.from_deg !== 0) {
      scaled.from_deg = +(scaled.from_deg * ampMult).toFixed(1);
    }
    result[name] = scaled;
  }
  return result;
}

// ─── Generar anim para Canal A ────────────────────────────────────────────────
function buildAnimA(ex, blockName) {
  const pattern   = BLOCK_PATTERNS[blockName] || BLOCK_PATTERNS.EMPUJE;
  const fase      = parseInt(ex.fase_evolucion) || 2;
  const speedMult = SPEED_BY_FASE[fase] || 1.0;
  const tool      = ex.herramienta || "Peso Corporal";
  const ampMult   = AMP_BY_TOOL[tool] || 1.0;
  const camCfg    = getCameraConfig(ex.glb_region);

  const phases = scalePhases(pattern.phases, speedMult, ampMult);

  return {
    camera_target: camCfg.target,
    camera_offset: camCfg.offset,
    phases,
    idle_amplitude: 0.015,
    highlight_on_phase: "concentric",
  };
}

// ─── Generar anim para Canal C ────────────────────────────────────────────────
function buildAnimC(ex, zonaName) {
  const zonePattern = CANAL_C_ZONA_PATTERNS[zonaName] || CANAL_C_ZONA_PATTERNS.COLUMNA_CORE;
  const camCfg      = CAMERA_CONFIG[zonePattern.camera] || CAMERA_CONFIG["LUMBAR_CORE"];

  return {
    camera_target: camCfg.target,
    camera_offset: camCfg.offset,
    phases: {
      entry: {
        axis:     zonePattern.axis,
        from_deg: 0,
        to_deg:   zonePattern.entry_deg,
        duration: 3.5,
      },
      hold: {
        duration:       25,
        idle_amplitude: zonePattern.hold_idle,
      },
    },
    highlight_on_phase: "hold",
  };
}

// ─── Procesar Canal A ─────────────────────────────────────────────────────────
function processA(srcPath) {
  const data    = JSON.parse(fs.readFileSync(srcPath, "utf8"));
  const entries = [];

  for (const [blockName, exercises] of Object.entries(data.bloques)) {
    for (const ex of exercises) {
      entries.push({
        id:   ex.id,
        anim: buildAnimA(ex, blockName),
      });
    }
  }

  return {
    version:    "1.0",
    canal:      "A",
    total:      entries.length,
    animations: entries,
  };
}

// ─── Procesar Canal C ─────────────────────────────────────────────────────────
function processC(srcPath) {
  const data    = JSON.parse(fs.readFileSync(srcPath, "utf8"));
  const entries = [];

  for (const [zonaName, exercises] of Object.entries(data.zonas)) {
    for (const ex of exercises) {
      entries.push({
        id:   ex.id,
        anim: buildAnimC(ex, zonaName),
      });
    }
  }

  return {
    version:    "1.0",
    canal:      "C",
    total:      entries.length,
    animations: entries,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ROOT    = path.join(__dirname, "..");
const DESKTOP = path.join(os.homedir(), "Desktop");

console.log("\n─── generateAnimData.js ──────────────────────────────────────────────");

const configs = [
  { src: "data/canal-a-maestro.json", out: "data/canal-a-animations.json", fn: processA, label: "Canal A" },
  { src: "data/canal-c-maestro.json", out: "data/canal-c-animations.json", fn: processC, label: "Canal C" },
];

for (const { src, out, fn, label } of configs) {
  const srcPath = path.join(ROOT, src);
  const outPath = path.join(ROOT, out);

  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠ No encontrado: ${srcPath}`);
    continue;
  }

  const result = fn(srcPath);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  fs.writeFileSync(path.join(DESKTOP, path.basename(out)), JSON.stringify(result, null, 2), "utf8");

  const sample = result.animations[0];
  console.log(`   ${label}: ${result.total} animaciones generadas`);
  console.log(`   Sample [${sample.id}]: phases → ${Object.keys(sample.anim.phases).join(", ")}`);
  console.log(`   ✅ ${outPath}`);
  console.log(`   ✅ ~/Desktop/${path.basename(out)}`);
}

console.log("\n─────────────────────────────────────────────────────────────────────\n");
