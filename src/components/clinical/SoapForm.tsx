"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { displayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { supabase, type SoapNote } from "@/lib/supabase";
import { Zap, Sparkles } from "lucide-react";
import { buildBasePlan } from "@/lib/planBase";

interface SoapFormProps {
  patientId: string;
  /** nota a editar (si falta, se crea una nueva) */
  note?: SoapNote;
  /** goPlan: el terapeuta pidió armar el plan de ejercicios con el diagnóstico */
  onSave: (note: SoapNote, goPlan?: boolean) => void;
  onCancel: () => void;
}

const FIELDS = ["subjective", "objective", "assessment", "diagnosis", "plan"] as const;

export function SoapForm({ patientId, note, onSave, onCancel }: SoapFormProps) {
  const [form, setForm] = useState({
    subjective: note?.subjective ?? "",
    objective: note?.objective ?? "",
    assessment: note?.assessment ?? "",
    diagnosis: note?.diagnosis ?? "",
    plan: note?.plan ?? "",
  });
  const t = useTranslations("clin");
  const tr = useTranslations("rd");
  const tl = useTranslations("library");
  const plan = buildBasePlan(form.diagnosis);
  const [goPlan, setGoPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subjective.trim()) { setError(t("soap_required")); return; }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // al editar, la versión anterior queda en soap_note_history (trigger en la base)
      const { data, error: err } = note
        ? await supabase.from("soap_notes").update({ ...form }).eq("id", note.id).select().single()
        : await supabase
            .from("soap_notes")
            .insert({ patient_id: patientId, ...form, doctor: displayName(user) || "—" })
            .select()
            .single();
      if (err) throw err;
      onSave(data, goPlan);
    } catch (e: unknown) {
      console.error("SoapForm", e);
      setError(t("save_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map((key) => (
        <div key={key}>
          <label className="block mb-1">
            <span className="text-sm font-bold text-slate-800">{t(`soap_${key}`)}</span>
            <span className="text-xs text-slate-400 ms-2">{t(`soap_${key}_hint`)}</span>
          </label>
          <textarea
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={t(`soap_${key}_ph`)}
            rows={key === "plan" ? 4 : 3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none transition-colors"
          />
          {key === "diagnosis" && plan.ids.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold">{tr("plan_preview", { n: plan.ids.length })}</span>
              {plan.regions.map((r, i) => (
                <span key={r} className={i === 0 ? "rounded-full bg-emerald-600 px-2 py-0.5 text-white" : "rounded-full bg-white px-2 py-0.5 border border-emerald-200"}>
                  {tl(`region.${r}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!note && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Zap className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700">{t("soap_after")}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading} onClick={() => setGoPlan(false)} variant={plan.ids.length ? "outline" : "primary"} className="flex-1">
          {loading && !goPlan ? t("saving") : note ? t("save_changes") : t("save_soap")}
        </Button>
      </div>
      {plan.ids.length > 0 && (
        <Button type="submit" disabled={loading} onClick={() => setGoPlan(true)} className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Sparkles className="h-4 w-4" /> {loading && goPlan ? t("saving") : tr("save_and_plan")}
        </Button>
      )}
    </form>
  );
}
