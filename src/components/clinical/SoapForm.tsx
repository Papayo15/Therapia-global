"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { displayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { supabase, type SoapNote } from "@/lib/supabase";
import { Zap } from "lucide-react";

interface SoapFormProps {
  patientId: string;
  onSave: (note: SoapNote) => void;
  onCancel: () => void;
}

const FIELDS = ["subjective", "objective", "assessment", "diagnosis", "plan"] as const;

export function SoapForm({ patientId, onSave, onCancel }: SoapFormProps) {
  const [form, setForm] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    diagnosis: "",
    plan: "",
  });
  const t = useTranslations("clin");
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
      const { data, error: err } = await supabase
        .from("soap_notes")
        .insert({
          patient_id: patientId,
          ...form,
          doctor: displayName(user) || "—",
        })
        .select()
        .single();
      if (err) throw err;
      onSave(data);
    } catch (e: unknown) {
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
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Zap className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700">
          {t("soap_after")}
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? t("saving") : t("save_soap")}
        </Button>
      </div>
    </form>
  );
}
