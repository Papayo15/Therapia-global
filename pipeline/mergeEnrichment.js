#!/usr/bin/env node
/**
 * mergeEnrichment.js
 * Aplica los lotes de enriquecimiento sobre master-registry.json
 * Uso: node pipeline/mergeEnrichment.js [--lote 01]
 *
 * Sin argumentos → aplica TODOS los lotes disponibles en data/enriched/
 */

const fs   = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(__dirname, "../data/master-registry.json");
const ENRICHED_DIR  = path.join(__dirname, "../data/enriched");

// ── Leer registry (objeto keyed por ID) ─────────────────────────────────────
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));

// ── Determinar lotes a procesar ─────────────────────────────────────────────
const arg = process.argv.indexOf("--lote");
let loteFiles = [];

if (arg !== -1 && process.argv[arg + 1]) {
  const num = process.argv[arg + 1].padStart(2, "0");
  loteFiles = [`lote-${num}.json`];
} else {
  loteFiles = fs.readdirSync(ENRICHED_DIR)
    .filter(f => f.startsWith("lote-") && f.endsWith(".json"))
    .sort();
}

if (loteFiles.length === 0) {
  console.log("⚠️  No hay lotes en data/enriched/ para procesar.");
  process.exit(0);
}

// ── Aplicar lotes ────────────────────────────────────────────────────────────
let totalUpdated = 0;
let totalSkipped = 0;

for (const file of loteFiles) {
  const lotePath = path.join(ENRICHED_DIR, file);
  if (!fs.existsSync(lotePath)) {
    console.log(`⚠️  No encontrado: ${file}`);
    continue;
  }

  const lote = JSON.parse(fs.readFileSync(lotePath, "utf8"));
  let updated = 0;

  for (const enriched of lote) {
    const id = enriched.id;
    if (!registry[id]) {
      console.log(`  ⚠️  ID no encontrado: ${id}`);
      totalSkipped++;
      continue;
    }
    // Merge: sobreescribir campos del lote sobre el esqueleto existente
    registry[id] = { ...registry[id], ...enriched };
    updated++;
    totalUpdated++;
  }

  console.log(`✅ ${file}: ${updated} entradas actualizadas`);
}

// ── Guardar ──────────────────────────────────────────────────────────────────
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

console.log("\n📊 RESUMEN:");
console.log(`   Total actualizadas:          ${totalUpdated}`);
console.log(`   Saltadas (ID no encontrado): ${totalSkipped}`);
console.log(`   Registry guardado → data/master-registry.json\n`);
