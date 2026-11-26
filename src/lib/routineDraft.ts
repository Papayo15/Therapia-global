"use client";

// Rutina en preparación, compartida entre la Biblioteca y el constructor de rutinas.
// La Biblioteca agrega ids; el constructor los convierte en ejercicios y guarda aquí su estado para no perderlo al navegar.
import { useEffect, useState } from "react";

const KEY = "tg:routine-draft";
const EVT = "tg:routine-draft";

export interface Draft<E = unknown> {
  /** ejercicios ya armados por el constructor */
  exercises: E[];
  /** ids agregados desde la Biblioteca que el constructor aún no recoge */
  pending: string[];
  name?: string;
  initial?: { name: string; phone: string; dx: string; pid: string };
}

const EMPTY: Draft = { exercises: [], pending: [] };

export function readDraft<E = unknown>(): Draft<E> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY as Draft<E>;
    const d = JSON.parse(raw);
    return { exercises: Array.isArray(d.exercises) ? d.exercises : [], pending: Array.isArray(d.pending) ? d.pending : [], name: d.name, initial: d.initial };
  } catch {
    return EMPTY as Draft<E>;
  }
}

export function writeDraft<E>(d: Draft<E>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* almacenamiento no disponible */
  }
  window.dispatchEvent(new Event(EVT));
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* */
  }
  window.dispatchEvent(new Event(EVT));
}

/** ids de todos los ejercicios en la rutina en preparación */
export function draftIds(d: Draft): string[] {
  return [...(d.exercises as { id: string }[]).map((e) => e.id), ...d.pending];
}

export function toggleInDraft(id: string) {
  const d = readDraft<{ id: string }>();
  if (d.pending.includes(id)) d.pending = d.pending.filter((x) => x !== id);
  else if (d.exercises.some((e) => e.id === id)) d.exercises = d.exercises.filter((e) => e.id !== id);
  else d.pending = [...d.pending, id];
  writeDraft(d);
}

/** ids en la rutina en preparación, actualizado al cambiar (también desde otra pestaña) */
export function useDraftIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(draftIds(readDraft()));
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return ids;
}
