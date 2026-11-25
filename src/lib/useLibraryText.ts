"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { type LibraryItem, termKey } from "@/lib/videoLibrary";

/** Textos de una ficha de la biblioteca en el idioma del usuario (español original si falta la traducción). */
export function useLibraryText() {
  const ti = useTranslations("libraryItems");
  const tt = useTranslations("libraryTerms");
  return useMemo(() => {
    const term = (s: string | null | undefined) =>
      s ? (tt.has(termKey(s)) ? tt(termKey(s)) : s) : "";
    const base = (i: LibraryItem) => (ti.has(i.id) ? ti(i.id) : i.nombre);
    return {
      /** nombre completo: en estiramientos, antepone el músculo objetivo ("Pectoral mayor · En marco de puerta") */
      name: (i: LibraryItem) =>
        i.objetivo ? `${term(i.objetivo)} · ${base(i)}` : base(i),
      region: (i: LibraryItem) => term(i.region),
      level: (i: LibraryItem) => term(i.nivel_nombre),
      type: (i: LibraryItem) => term(i.tipo),
    };
  }, [ti, tt]);
}
