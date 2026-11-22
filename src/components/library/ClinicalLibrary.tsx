"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LIBRARY_ITEMS,
  REGION_GROUPS,
  type LibraryCategory,
  type LibraryItem,
  regionColor,
  regionGroup,
  videoUrl,
} from "@/lib/videoLibrary";
import { LibraryPlayerModal } from "./LibraryPlayerModal";

// ─── ClinicalLibrary ──────────────────────────────────────────────────────────
// Galería de la biblioteca clínica producida por la fábrica de video
// (fortalecimiento, estiramientos y osteopatía), con filtros y reproductor.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: LibraryCategory[] = ["fortalecimiento", "estiramiento", "osteopatia"];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ClinicalLibrary({
  initialCategory = "all",
  initialId,
  initialView,
}: {
  initialCategory?: LibraryCategory | "all";
  /** abre directamente esta técnica (enlace compartible ?id=F-HOM-007) */
  initialId?: string;
  initialView?: "exercise" | "anatomy";
}) {
  const t = useTranslations("library");
  const tm = useTranslations("muscles");
  const [cat, setCat] = useState<LibraryCategory | "all">(initialCategory);
  const [group, setGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<number | null>(() => {
    if (!initialId) return null;
    const i = LIBRARY_ITEMS.filter((x) => initialCategory === "all" || x.categoria === initialCategory).findIndex((x) => x.id === initialId);
    return i >= 0 ? i : null;
  });

  const byCat = useMemo(() => LIBRARY_ITEMS.filter((i) => cat === "all" || i.categoria === cat), [cat]);

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    return byCat.filter((i) => {
      if (group !== "all" && regionGroup(i) !== group) return false;
      if (!q) return true;
      const muscles = [...i.musculos.activos, ...i.musculos.elongan].map((m) => (tm.has(m) ? tm(m) : m));
      return [i.nombre, i.id, i.region, i.tipo ?? "", ...muscles].some((s) => norm(s).includes(q));
    });
  }, [byCat, group, search, tm]);

  const groups = REGION_GROUPS.map((g) => ({ ...g, n: byCat.filter((i) => regionGroup(i) === g.key).length })).filter((g) => g.n > 0);
  const item = open !== null ? filtered[open] : null;

  return (
    <div className="space-y-5">
      {/* Categorías */}
      <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {(["all", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setGroup("all");
            }}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              cat === c ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            {c === "all" ? t("all") : t(`categoryPlural.${c}`)}{" "}
            <span className="opacity-60">({c === "all" ? LIBRARY_ITEMS.length : LIBRARY_ITEMS.filter((i) => i.categoria === c).length})</span>
          </button>
        ))}
      </div>

      {/* Búsqueda y regiones */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="border-slate-200 bg-white ps-9" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Pill active={group === "all"} onClick={() => setGroup("all")} color="#1e293b">
          {t("allRegions")}
        </Pill>
        {groups.map((g) => (
          <Pill key={g.key} active={group === g.key} onClick={() => setGroup(g.key)} color={g.color}>
            {t(`region.${g.key}`)} <span className="opacity-60">({g.n})</span>
          </Pill>
        ))}
      </div>

      <p className="text-sm text-slate-500">{t("count", { n: filtered.length })}</p>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Video className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-medium">{t("noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((i, idx) => (
            <Card key={i.id} item={i} onClick={() => setOpen(idx)} label={t(`category.${i.categoria}`)} />
          ))}
        </div>
      )}

      {item && (
        <LibraryPlayerModal
          item={item}
          initialView={item.id === initialId ? initialView : undefined}
          onClose={() => setOpen(null)}
          onPrev={open! > 0 ? () => setOpen(open! - 1) : undefined}
          onNext={open! < filtered.length - 1 ? () => setOpen(open! + 1) : undefined}
        />
      )}
    </div>
  );
}

function Card({ item, onClick, label }: { item: LibraryItem; onClick: () => void; label: string }) {
  const color = regionColor(regionGroup(item));
  return (
    <button
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-slate-100 bg-white text-start transition-all hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={videoUrl(item.variantes[0].poster)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: color }}>
          {label}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">{item.nombre}</p>
        <p className="mt-1 truncate text-[11px] text-slate-400">{item.region}</p>
      </div>
    </button>
  );
}

function Pill({ active, onClick, color, children }: { active: boolean; onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
      )}
      style={active ? { background: color, borderColor: color } : {}}
    >
      {children}
    </button>
  );
}
