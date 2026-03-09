/**
 * export_registry.mjs
 * Reads exercise + osteopathy registries (TypeScript) via regex,
 * then writes data/video_search_terms.json for use by fetch_pexels_videos.py.
 *
 * Usage: node scripts/export_registry.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function normalizeSlug(s) {
  return s.trim().toLowerCase();
}

function fallbackTerm(slug) {
  return slug.replace(/[-_]/g, " ") + " physical therapy exercise";
}

/**
 * Parses a TypeScript registry file with regex.
 * Extracts every id:"..." and its nearest youtubeSearch:"..." value.
 * If youtubeSearch is missing, generates a fallback term from the slug.
 */
function parseRegistry(filePath) {
  let src;
  try {
    src = readFileSync(filePath, "utf8");
  } catch {
    console.warn(`  [WARN] File not found: ${filePath}`);
    return [];
  }

  const ids = [...src.matchAll(/\bid:\s*"([^"]+)"/g)].map(m => normalizeSlug(m[1]));
  const searches = [...src.matchAll(/youtubeSearch:\s*"([^"]+)"/g)].map(m => m[1]);

  return ids.map((id, i) => ({
    id,
    youtubeSearch: (searches[i] ?? fallbackTerm(id)).trim(),
  }));
}

// ── Exercise registry ──────────────────────────────────────────────────────
const exercises = parseRegistry(join(root, "src/lib/exerciseRegistry.ts"));

// ── Osteopathy registry (dedicated file) ──────────────────────────────────
const osteopathyFromRegistry = parseRegistry(join(root, "src/lib/osteopathyRegistry.ts"));

// ── BASE_TECHNIQUES inline in osteopathy page ──────────────────────────────
let pageSrc = "";
try {
  pageSrc = readFileSync(join(root, "src/app/[locale]/osteopathy/page.tsx"), "utf8");
} catch {
  console.warn("  [WARN] osteopathy/page.tsx not found");
}

const pageIds = [...pageSrc.matchAll(/\bid:\s*"([^"]+)"/g)].map(m => normalizeSlug(m[1]));
const pageSearches = [...pageSrc.matchAll(/youtubeSearch:\s*"([^"]+)"/g)].map(m => m[1]);
const pageEntries = pageIds.map((id, i) => ({
  id,
  youtubeSearch: (pageSearches[i] ?? fallbackTerm(id)).trim(),
}));

// ── Merge osteopathy, deduplicate by id ───────────────────────────────────
const dedup = {};
for (const e of [...osteopathyFromRegistry, ...pageEntries]) {
  if (!dedup[e.id]) dedup[e.id] = e;
}
const osteopathy = Object.values(dedup);

// ── Write output ──────────────────────────────────────────────────────────
const output = { exercises, osteopathy };
mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(
  join(root, "data/video_search_terms.json"),
  JSON.stringify(output, null, 2)
);

console.log(
  `Exported ${exercises.length} exercises + ${osteopathy.length} osteopathy techniques`
);
console.log(`Output: data/video_search_terms.json`);
