"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";

// ─── AnatomyLabels ────────────────────────────────────────────────────────────
// Nombres de los músculos que trabajan, encima del video anatómico (anatomico.mp4).
// La fábrica de video escribe etiquetas.json con la posición en pantalla de cada músculo por cuadro;
// aquí se dibuja el nombre en el idioma del paciente, con una línea al músculo y el color de su papel
// (rojo = trabaja, azul = se estira). Las etiquetas aparecen y se apagan con la intensidad del músculo.
// ─────────────────────────────────────────────────────────────────────────────

interface LabelMuscle {
  id: string;
  lado: "L" | "R" | null;
  rol: string;
  nombre_es: string;
}

interface LabelData {
  fps: number;
  frames: number;
  paso?: number;
  resolucion: [number, number];
  musculos: LabelMuscle[];
  pos: ([number, number, number, number] | null)[][];
  /** calculado al cargar: el músculo se ve en algún cuadro del clip */
  everVisible?: boolean[];
}

const BLUE_ROLES = new Set(["elongan", "estirados"]);

export function AnatomyLabels({
  videoRef,
  src,
  fit = "cover",
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  fit?: "cover" | "contain";
}) {
  const t = useTranslations("muscles");
  const [data, setData] = useState<LabelData | null>(null);
  const [tick, setTick] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setData(j ? mergeBilateral(j) : null))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setTick((x) => (x + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const video = videoRef.current;
  const box = boxRef.current;
  if (!data || !video || !box || !video.videoWidth) {
    return <div ref={boxRef} className="pointer-events-none absolute inset-0" data-tick={tick} />;
  }

  // cuadro actual (el clip es un loop)
  const frame = Math.floor(video.currentTime * data.fps) % data.frames;
  const row = data.pos[Math.min(Math.floor(frame / (data.paso ?? 1)), data.pos.length - 1)] ?? [];

  // video (object-fit) → coordenadas del contenedor
  const W = box.clientWidth;
  const H = box.clientHeight;
  const [vw, vh] = [video.videoWidth, video.videoHeight];
  const s = fit === "cover" ? Math.max(W / vw, H / vh) : Math.min(W / vw, H / vh);
  const ox = (W - vw * s) / 2;
  const oy = (H - vh * s) / 2;
  const fontPx = Math.max(10, Math.min(15, W / 48));
  const lineH = fontPx * 1.7;

  // músculos que nunca quedan a la vista (detrás del cuerpo, contra la camilla): igual se nombran, con línea punteada
  const items = data.musculos
    .map((m, j) => ({ m, j, p: row[j] }))
    .filter((it): it is { m: LabelMuscle; j: number; p: [number, number, number, number] } =>
      !!it.p && (it.p[2] > 0 || !data.everVisible?.[it.j]) && it.p[3] > 0.12)
    .map(({ m, p }) => ({ m, x: ox + p[0] * vw * s, y: oy + p[1] * vh * s, a: Math.min(1, p[3] * 1.4), behind: p[2] === 0 }))
    .filter((it) => it.x >= 0 && it.x <= W && it.y >= 0 && it.y <= H)
    .sort((a, b) => a.y - b.y);

  const placed: { it: (typeof items)[number]; tx: number; ty: number; right: boolean }[] = [];
  for (const right of [false, true]) {
    const used: number[] = [];
    for (const it of items.filter((i) => i.x >= W / 2 === right)) {
      let ty = it.y;
      for (const u of used) if (Math.abs(ty - u) < lineH) ty = u + lineH;
      used.push(ty);
      placed.push({ it, tx: right ? W - 12 : 12, ty, right });
    }
  }

  const name = (m: LabelMuscle) => (t.has(m.id) ? t(m.id) : m.nombre_es);

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0" data-tick={tick}>
      <svg className="absolute inset-0 h-full w-full">
        {placed.map(({ it, tx, ty, right }) => {
          const col = BLUE_ROLES.has(it.m.rol) ? "#3b82f6" : "#ef4444";
          const ax = right ? tx - estimateWidth(name(it.m), fontPx) - 6 : tx + estimateWidth(name(it.m), fontPx) + 6;
          return (
            <g key={it.m.id + (it.m.lado ?? "")} opacity={it.a}>
              <line x1={it.x} y1={it.y} x2={ax} y2={ty} stroke={col} strokeWidth={1.5} strokeDasharray={it.behind ? "4 3" : undefined} />
              <circle cx={it.x} cy={it.y} r={3.5} fill={it.behind ? "none" : col} stroke={col} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      {placed.map(({ it, tx, ty, right }) => (
        <span
          key={"t" + it.m.id + (it.m.lado ?? "")}
          className="absolute whitespace-nowrap rounded px-1.5 font-semibold text-white"
          style={{
            top: ty - fontPx * 0.8,
            [right ? "right" : "left"]: right ? W - tx : tx,
            fontSize: fontPx,
            opacity: it.a,
            background: "rgba(15,23,42,0.55)",
            borderLeft: right ? undefined : `3px solid ${BLUE_ROLES.has(it.m.rol) ? "#3b82f6" : "#ef4444"}`,
            borderRight: right ? `3px solid ${BLUE_ROLES.has(it.m.rol) ? "#3b82f6" : "#ef4444"}` : undefined,
          }}
        >
          {name(it.m)}
        </span>
      ))}
    </div>
  );
}

function estimateWidth(text: string, fontPx: number) {
  return text.length * fontPx * 0.55 + 12;
}

/** Músculos bilaterales: una sola etiqueta por músculo (en cada cuadro, el lado que más se ve). */
function mergeBilateral(d: LabelData): LabelData {
  const groups = new Map<string, number[]>();
  d.musculos.forEach((m, j) => groups.set(m.id, [...(groups.get(m.id) ?? []), j]));
  const musculos: LabelMuscle[] = [];
  const pos = d.pos.map(() => [] as ([number, number, number, number] | null)[]);
  for (const [, js] of groups) {
    musculos.push({ ...d.musculos[js[0]], lado: js.length > 1 ? null : d.musculos[js[0]].lado });
    d.pos.forEach((r, i) => {
      const c = js.map((j) => r[j]).filter((x): x is [number, number, number, number] => !!x);
      pos[i].push(c.length ? c.reduce((a, b) => (b[2] > a[2] || (b[2] === a[2] && b[3] > a[3]) ? b : a)) : null);
    });
  }
  const everVisible = musculos.map((_, j) => pos.some((r) => !!r[j] && r[j]![2] > 0));
  return { ...d, musculos, pos, everVisible };
}
