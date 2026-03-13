#!/usr/bin/env node
/**
 * pipeline/updateRegistry.js
 *
 * Rebuilds registry/exercises.json from data/pipeline-status.json.
 * Run after uploading new videos to a CDN (R2, Cloudinary, etc.)
 * or after fetching new Pexels CDN URLs.
 *
 * Usage:
 *   node pipeline/updateRegistry.js
 *
 * Also accepts R2 inventory via environment:
 *   R2_PUBLIC_URL=https://pub-xxx.r2.dev node pipeline/updateRegistry.js
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const STATUS_FILE = join(ROOT, "data", "pipeline-status.json");
const REGISTRY_FILE = join(ROOT, "registry", "exercises.json");
const TERMS_FILE = join(ROOT, "data", "video_search_terms.json");

// Determine category from the slug → known exercises vs osteopathy
function getCategory(slug, terms) {
  const exerciseSlugs = new Set(terms.exercises.map((e) => e.id));
  return exerciseSlugs.has(slug) ? "exercises" : "osteopathy";
}

// Load existing registry (if any) as base
function loadExisting() {
  try {
    return JSON.parse(readFileSync(REGISTRY_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function main() {
  // Load pipeline-status.json
  let statusData = {};
  try {
    statusData = JSON.parse(readFileSync(STATUS_FILE, "utf-8"));
  } catch {
    console.error("ERROR: data/pipeline-status.json not found. Run fetch_pexels_urls.py first.");
    process.exit(1);
  }

  // Load video_search_terms to determine categories
  let terms = { exercises: [], osteopathy: [] };
  try {
    terms = JSON.parse(readFileSync(TERMS_FILE, "utf-8"));
  } catch {
    console.warn("WARN: data/video_search_terms.json not found — categories will be 'unknown'");
  }

  const existing = loadExisting();
  const registry = { ...existing };

  let added = 0;
  let updated = 0;

  for (const [slug, entry] of Object.entries(statusData)) {
    const video = entry.video;
    if (!video) continue;

    const category = getCategory(slug, terms);
    const current = registry[slug];

    if (!current) {
      registry[slug] = { video, category };
      added++;
    } else if (current.video !== video) {
      registry[slug] = { ...current, video, category };
      updated++;
    }
  }

  mkdirSync(join(ROOT, "registry"), { recursive: true });
  writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));

  const total = Object.keys(registry).length;
  console.log(`✓ registry/exercises.json updated`);
  console.log(`  Total entries: ${total}`);
  console.log(`  Added: ${added}, Updated: ${updated}, Unchanged: ${total - added - updated}`);
  console.log(`  CDN: ${Object.values(registry).filter((e) => e.video?.startsWith("https://")).length} entries with CDN URLs`);
  console.log(`  Local: ${Object.values(registry).filter((e) => e.video?.startsWith("/")).length} entries with local paths`);
}

main();
