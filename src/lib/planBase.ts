// Plan base de ejercicios a partir del diagnóstico de la nota SOAP.
// No sustituye el criterio clínico: arma una propuesta inicial (fase temprana, niveles bajos, material sencillo)
// que cubre la región lesionada y su cadena; el terapeuta la revisa y cambia lo que quiera.
import { LIBRARY_ITEMS, regionGroup, type LibraryItem } from "@/lib/videoLibrary";
import { regionsForDiagnosis, musclesForDiagnosis } from "@/lib/dxRegions";

const HOME_PROPS = new Set(["", "banda_elastica", "toalla", "silla", "pared", "pelota_pequena", "correa", "escalon", "mancuerna", "rollo", "masilla"]);

const isHome = (i: LibraryItem) => i.props.every((p) => HOME_PROPS.has(p));

/** Cuánto trabaja (o estira) los músculos clave: el primero de la lista vale más. */
function score(i: LibraryItem, targets: string[]) {
  const ms = i.categoria === "estiramiento" ? i.musculos.elongan : i.musculos.activos;
  let s = 0;
  ms.forEach((m, k) => {
    const t = targets.indexOf(m);
    if (t >= 0) s += (k === 0 ? 3 : 1) * (1 + (targets.length - t) / targets.length);
  });
  return s;
}

const cands = (region: string, cat: "fortalecimiento" | "estiramiento", maxLevel: number, targets: string[]) =>
  LIBRARY_ITEMS.filter((i) => i.categoria === cat && regionGroup(i) === region && (i.nivel ?? 1) <= maxLevel && isHome(i))
    .sort((a, b) => score(b, targets) - score(a, targets) || (a.nivel ?? 1) - (b.nivel ?? 1)
      || a.props.length - b.props.length || a.id.localeCompare(b.id));

/** Elige n técnicas variando los músculos principales (no tres versiones del mismo ejercicio). */
function pickVaried(list: LibraryItem[], n: number, taken: Set<string>): LibraryItem[] {
  const out: LibraryItem[] = [];
  const seenMuscle = new Set<string>();
  const seenMove = new Set<string>();
  for (const pass of [0, 1]) {
    for (const i of list) {
      if (out.length >= n) break;
      if (taken.has(i.id) || out.includes(i)) continue;
      const main = (i.categoria === "estiramiento" ? i.musculos.elongan[0] : i.musculos.activos[0]) ?? i.id;
      const move = i.movimiento ?? i.id;
      if (pass === 0 && (seenMuscle.has(main) || seenMove.has(move))) continue;
      out.push(i);
      seenMuscle.add(main);
      seenMove.add(move);
    }
  }
  out.forEach((i) => taken.add(i.id));
  return out;
}

export interface BasePlan {
  regions: string[];
  ids: string[];
}

/** Región principal: 3 de fortalecimiento + 2 estiramientos. Cadena: 1 de fortalecimiento por región (+1 estiramiento en la primera). */
export function buildBasePlan(dx: string | null | undefined): BasePlan {
  const regions = regionsForDiagnosis(dx);
  if (!regions.length) return { regions, ids: [] };
  const taken = new Set<string>();
  const targets = musclesForDiagnosis(dx);
  const [main, ...chain] = regions;
  const ids: LibraryItem[] = [
    ...pickVaried(cands(main, "fortalecimiento", 2, targets), 3, taken),
    ...pickVaried(cands(main, "estiramiento", 2, targets), 2, taken),
  ];
  chain.slice(0, 3).forEach((r, k) => {
    ids.push(...pickVaried(cands(r, "fortalecimiento", 2, targets), 1, taken));
    if (k === 0) ids.push(...pickVaried(cands(r, "estiramiento", 2, targets), 1, taken));
  });
  return { regions, ids: ids.map((i) => i.id) };
}

/** Alternativas para cambiar un ejercicio: misma región y tipo, de menor a mayor nivel. */
export function alternativesFor(id: string): LibraryItem[] {
  const it = LIBRARY_ITEMS.find((i) => i.id === id);
  if (!it) return [];
  const g = regionGroup(it);
  return LIBRARY_ITEMS.filter((i) => i.id !== id && i.categoria === it.categoria && regionGroup(i) === g)
    .sort((a, b) => Number(isHome(b)) - Number(isHome(a))
      || Math.abs((a.nivel ?? 1) - (it.nivel ?? 1)) - Math.abs((b.nivel ?? 1) - (it.nivel ?? 1)) || (a.nivel ?? 1) - (b.nivel ?? 1));
}
