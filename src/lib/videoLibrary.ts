// ─── Biblioteca clínica con video (fábrica de video) ──────────────────────────
// data/video-library.json lo escribe scripts/factory/export_library.py a partir de
// data/biblioteca.json y de los renders. Las rutas de video son relativas: la base
// se configura con NEXT_PUBLIC_VIDEO_BASE (por defecto /videos/fabrica, servido desde public/),
// así cambiar de alojamiento (CDN, bucket) no requiere tocar código.
// ─────────────────────────────────────────────────────────────────────────────

import library from "@data/video-library.json";

export type LibraryCategory = "fortalecimiento" | "estiramiento" | "osteopatia";

export interface LibraryVariant {
  variante: "gym" | "casa" | "ambos" | string;
  video: string;
  poster: string;
}

export interface LibraryItem {
  id: string;
  slug: string;
  categoria: LibraryCategory;
  region: string;
  nombre: string;
  nivel: number | null;
  nivel_nombre: string | null;
  movimiento: string | null;
  tipo: string | null;
  estructuras: string[] | null;
  props: string[];
  musculos: { activos: string[]; elongan: string[] };
  variantes: LibraryVariant[];
  anatomico: { video: string; etiquetas: string } | null;
}

export const LIBRARY_ITEMS = (library as { items: LibraryItem[] }).items;
export const LIBRARY_BY_ID = new Map(LIBRARY_ITEMS.map((i) => [i.id, i]));

const BASE = (process.env.NEXT_PUBLIC_VIDEO_BASE || "/videos/fabrica").replace(/\/$/, "");

export function videoUrl(rel: string) {
  return `${BASE}/${rel}`;
}

/** Región de la biblioteca → grupo amplio para filtrar y colorear. */
export const REGION_GROUPS: { key: string; regions: string[]; color: string }[] = [
  { key: "craneal", regions: ["Craneal"], color: "#64748b" },
  { key: "cervical", regions: ["Cervical", "Cervical alta (occipitoatloidea / C1-C2)", "Cervical media e inferior (C2-C7)"], color: "#8b5cf6" },
  { key: "atm", regions: ["ATM (mandíbula)"], color: "#14b8a6" },
  { key: "hombro", regions: ["Hombro (glenohumeral)", "Hombro / tórax", "Escápula", "Escapulotorácica", "Esternoclavicular y acromioclavicular"], color: "#3b82f6" },
  { key: "codo", regions: ["Codo", "Antebrazo", "Antebrazo (radiocubital)"], color: "#f97316" },
  { key: "muneca", regions: ["Muñeca", "Mano y dedos"], color: "#ef4444" },
  { key: "toracica", regions: ["Columna torácica", "Tronco", "Costillas"], color: "#06b6d4" },
  { key: "lumbar", regions: ["Columna lumbar / core", "Columna lumbar", "Sacroilíaca y pelvis"], color: "#f59e0b" },
  { key: "visceral", regions: ["Visceral"], color: "#db2777" },
  { key: "cadera", regions: ["Cadera"], color: "#a855f7" },
  { key: "rodilla", regions: ["Rodilla", "Tibioperonea"], color: "#10b981" },
  { key: "tobillo", regions: ["Tobillo", "Pierna y pie", "Pie"], color: "#0ea5e9" },
];

export function regionGroup(item: Pick<LibraryItem, "region">): string {
  return REGION_GROUPS.find((r) => r.regions.includes(item.region))?.key ?? "otros";
}

export function regionColor(key: string) {
  return REGION_GROUPS.find((r) => r.key === key)?.color ?? "#64748b";
}
