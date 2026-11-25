"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, ChevronDown, ChevronUp, Clock, Pencil, Trash2, RotateCcw, ClipboardList } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { supabase, type SoapNote } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SoapHistoryProps {
  patientId: string;
  /** cambia para forzar recarga (p. ej. tras guardar una nota) */
  refreshKey?: number;
  onEdit: (note: SoapNote) => void;
  onCreateRoutine?: (note: SoapNote) => void;
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const FIELDS = ["subjective", "objective", "assessment", "diagnosis", "plan"] as const;

// Notas SOAP del paciente: ver, editar, mandar a la papelera y recuperar.
// México (NOM-004-SSA3-2012): el expediente se conserva; "eliminar" solo lo oculta y queda en la papelera.
export function SoapHistory({ patientId, refreshKey = 0, onEdit, onCreateRoutine }: SoapHistoryProps) {
  const t = useTranslations("clin");
  const locale = useLocale();
  const [notes, setNotes] = useState<SoapNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [trash, setTrash] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("soap_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (!error && data) setNotes(data as SoapNote[]);
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function setDeleted(note: SoapNote, deleted: boolean) {
    setBusy(true);
    const { error } = await supabase.from("soap_notes").update({ deleted_at: deleted ? new Date().toISOString() : null }).eq("id", note.id);
    setBusy(false);
    setConfirmId(null);
    if (!error) await load();
  }

  const active = notes.filter((n) => !n.deleted_at);
  const deleted = notes.filter((n) => n.deleted_at);
  const list = trash ? deleted : active;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(deleted.length > 0 || trash) && (
        <div className="flex justify-end">
          <button onClick={() => setTrash(!trash)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
            <Trash2 className="h-3.5 w-3.5" />
            {trash ? t("back_to_notes") : t("trash_n", { n: deleted.length })}
          </button>
        </div>
      )}
      {trash && <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{t("trash_hint")}</p>}

      {list.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="font-medium text-sm">{trash ? t("trash_empty") : t("no_soap")}</p>
          {!trash && <p className="text-xs mt-1">{t("no_soap_hint")}</p>}
        </div>
      )}

      {list.map((note) => {
        const isOpen = openId === note.id;
        return (
          <div key={note.id} className={cn("rounded-xl border bg-white overflow-hidden", trash ? "border-slate-200 opacity-80" : "border-slate-200")}>
            <button
              onClick={() => setOpenId(isOpen ? null : note.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-start"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{note.diagnosis || t("clinical_note")}</p>
                <p className="flex flex-wrap items-center gap-x-1 text-xs text-slate-400 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {formatDate(note.created_at, locale)} · {note.doctor}
                  {note.updated_at && <span className="text-amber-600">· {t("edited_on", { date: formatDate(note.updated_at, locale) })}</span>}
                </p>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                {FIELDS.map((field) => {
                  const val = note[field];
                  if (!val) return null;
                  return (
                    <div key={field} className="pt-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t(`soap_${field}`)}</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{val}</p>
                    </div>
                  );
                })}

                <div className="flex flex-wrap gap-2 pt-2">
                  {trash ? (
                    <button disabled={busy} onClick={() => setDeleted(note, false)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <RotateCcw className="h-3.5 w-3.5" /> {t("restore")}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => onEdit(note)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <Pencil className="h-3.5 w-3.5" /> {t("edit")}
                      </button>
                      {onCreateRoutine && (
                        <button onClick={() => onCreateRoutine(note)}
                          className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                          <ClipboardList className="h-3.5 w-3.5" /> {t("routine_from_note")}
                        </button>
                      )}
                      {confirmId === note.id ? (
                        <span className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">
                          {t("confirm_delete_note")}
                          <button disabled={busy} onClick={() => setDeleted(note, true)} className="font-bold underline">{t("yes_delete")}</button>
                          <button onClick={() => setConfirmId(null)} className="text-slate-500">{t("cancel")}</button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmId(note.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
