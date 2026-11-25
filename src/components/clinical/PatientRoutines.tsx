"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ClipboardList, ExternalLink, MessageCircle, Pencil, Trash2, Activity, Copy, CheckCircle2 } from "lucide-react";
import { supabase, type Patient, type RoutineRow, type RoutineSession } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// Rutinas enviadas a un paciente + su seguimiento (cuándo las completa, dolor, dificultad, comentarios).
export function PatientRoutines({ patient }: { patient: Patient }) {
  const t = useTranslations("clin");
  const locale = useLocale();
  const [rows, setRows] = useState<RoutineRow[] | null>(null);
  const [sessions, setSessions] = useState<RoutineSession[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("routine_plans").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false });
    const plans = (data as RoutineRow[]) ?? [];
    setRows(plans);
    if (plans.length) {
      const { data: s } = await supabase.from("routine_sessions").select("*").in("plan_id", plans.map((p) => p.id))
        .order("completed_at", { ascending: false }).limit(200);
      setSessions((s as RoutineSession[]) ?? []);
    } else setSessions([]);
  }, [patient.id]);

  useEffect(() => {
    load();
  }, [load]);

  const link = (id: string) => `${window.location.origin}/${locale}/p/${id}`;
  const fmt = (d: string) => new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short" });

  async function remove(id: string) {
    await supabase.from("routine_plans").delete().eq("id", id);
    setConfirmId(null);
    load();
  }

  function whatsapp(r: RoutineRow) {
    const msg = [`*${r.title || r.diagnosis || ""}*`, t("wa_resend", { name: patient.name.split(" ")[0] }), link(r.id)].join("\n");
    const phone = (r.patient_phone || patient.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // resumen de adherencia: últimos 7 días
  const weekAgo = Date.now() - 7 * 864e5;
  const week = sessions.filter((s) => new Date(s.completed_at).getTime() > weekAgo);
  const withPain = sessions.filter((s) => s.pain !== null).slice(0, 5);
  const avgPain = withPain.length ? (withPain.reduce((a, s) => a + (s.pain ?? 0), 0) / withPain.length).toFixed(1) : null;
  const target = rows?.[0]?.plan_json?.meta?.frequency_per_week ?? 3;

  return (
    <div className="space-y-3">
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] text-slate-500">{t("adh_week")}</p>
            <p className={cn("text-xl font-bold", week.length >= target ? "text-emerald-600" : "text-amber-600")}>{week.length}/{target}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] text-slate-500">{t("adh_last")}</p>
            <p className="text-xl font-bold text-slate-800">{fmt(sessions[0].completed_at)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] text-slate-500">{t("adh_pain")}</p>
            <p className="text-xl font-bold text-slate-800">{avgPain ?? "—"}<span className="text-xs font-normal text-slate-400">/10</span></p>
          </div>
        </div>
      )}

      {rows && rows.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="font-medium text-sm">{t("no_routines")}</p>
        </div>
      )}

      {(rows ?? []).map((r) => {
        const ss = sessions.filter((s) => s.plan_id === r.id);
        const expired = new Date(r.expires_at).getTime() < Date.now();
        return (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <ClipboardList className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{r.title || r.diagnosis || t("routine")}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("exercises_n", { n: r.plan_json?.exercises?.length ?? 0 })} · {t("sent_on", { date: fmt(r.created_at) })}
                  {r.updated_at && ` · ${t("edited_on", { date: fmt(r.updated_at) })}`}
                  {expired && <span className="text-red-500"> · {t("expired")}</span>}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Activity className="h-3 w-3" />
                  {ss.length ? t("sessions_n", { n: ss.length, date: fmt(ss[0].completed_at) }) : t("no_sessions")}
                </p>
                {ss.filter((s) => s.comment).slice(0, 2).map((s) => (
                  <p key={s.id} className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                    “{s.comment}” <span className="text-amber-600">— {fmt(s.completed_at)}{s.pain !== null ? ` · ${t("pain_short", { n: s.pain })}` : ""}</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={link(r.id)} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <ExternalLink className="h-3.5 w-3.5" /> {t("open")}
              </a>
              <button onClick={() => whatsapp(r)}
                className="flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(link(r.id)); setCopied(r.id); }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                {copied === r.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {t("copy_link")}
              </button>
              <Link href={`/${locale}/routines?edit=${r.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Pencil className="h-3.5 w-3.5" /> {t("edit")}
              </Link>
              {confirmId === r.id ? (
                <span className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">
                  {t("confirm_delete_routine")}
                  <button onClick={() => remove(r.id)} className="font-bold underline">{t("yes_delete")}</button>
                  <button onClick={() => setConfirmId(null)} className="text-slate-500">{t("cancel")}</button>
                </span>
              ) : (
                <button onClick={() => setConfirmId(r.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
