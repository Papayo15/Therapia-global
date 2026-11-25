"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ClinicalLibrary } from "@/components/library/ClinicalLibrary";
import type { LibraryCategory } from "@/lib/videoLibrary";

// Biblioteca clínica con video (439 técnicas). Parámetros: ?cat=fortalecimiento|estiramiento|osteopatia, ?id=, ?view=anatomy
export default function ExercisesPage() {
  const t = useTranslations("library");
  const [libCat, setLibCat] = useState<LibraryCategory | "all" | null>(null);
  const [libOpen, setLibOpen] = useState<{ id?: string; view?: "exercise" | "anatomy" }>({});

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("cat") ?? (q.get("canal") === "B" ? "osteopatia" : null);
    setLibCat(c === "fortalecimiento" || c === "estiramiento" || c === "osteopatia" ? c : "all");
    setLibOpen({ id: q.get("id") ?? undefined, view: q.get("view") === "anatomy" ? "anatomy" : undefined });
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={t("title")} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
              <p className="text-slate-500 mt-1">{t("subtitle")}</p>
            </div>
            {libCat && <ClinicalLibrary initialCategory={libCat} initialId={libOpen.id} initialView={libOpen.view} />}
          </div>
        </main>
      </div>
    </div>
  );
}
