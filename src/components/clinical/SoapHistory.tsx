"use client";

import { useState, useEffect } from "react";
import { FileText, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { supabase, type SoapNote } from "@/lib/supabase";

interface SoapHistoryProps {
  patientId: string;
  onCreateTreatment?: (note: SoapNote) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const SOAP_LABELS: Record<string, string> = {
  subjective: "Subjetivo",
  objective: "Objetivo",
  assessment: "Análisis",
  diagnosis: "Diagnóstico",
  plan: "Plan",
};

export function SoapHistory({ patientId, onCreateTreatment }: SoapHistoryProps) {
  const [notes, setNotes] = useState<SoapNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("soap_notes")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (!error && data) setNotes(data);
      setLoading(false);
    }
    fetchNotes();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        <p className="font-medium text-sm">Sin notas SOAP registradas</p>
        <p className="text-xs mt-1">Crea la primera nota clínica para este paciente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isOpen = openId === note.id;
        return (
          <div key={note.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : note.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-start"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 truncate">
                  {note.diagnosis || "Nota clínica"}
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {formatDate(note.created_at)} · {note.doctor}
                </p>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                {(["subjective", "objective", "assessment", "diagnosis", "plan"] as const).map((field) => {
                  const val = note[field];
                  if (!val) return null;
                  return (
                    <div key={field}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                        {SOAP_LABELS[field]}
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{val}</p>
                    </div>
                  );
                })}
                {onCreateTreatment && (
                  <button
                    onClick={() => onCreateTreatment(note)}
                    className="mt-2 w-full py-2 rounded-lg text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    Generar plan de tratamiento con IA →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
