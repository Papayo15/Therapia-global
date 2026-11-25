"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, type Patient } from "@/lib/supabase";

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [form, setForm] = useState({
    name: patient?.name ?? "",
    birth_date: patient?.birth_date ?? "",
    gender: patient?.gender ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    notes: patient?.notes ?? "",
  });
  const t = useTranslations("clin");
  const tl = useTranslations("legal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError(t("name_required")); return; }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("not_auth"));
      // campos vacíos → null (la base rechaza "" en columnas de fecha)
      const row = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" && !v.trim() ? null : v]));

      if (patient?.id) {
        const { data, error: err } = await supabase
          .from("patients")
          .update(row)
          .eq("id", patient.id)
          .select()
          .single();
        if (err) throw err;
        onSave(data);
      } else {
        const { data, error: err } = await supabase
          .from("patients")
          .insert({ ...row, doctor_id: user.id })
          .select()
          .single();
        if (err) throw err;
        onSave(data);
      }
    } catch (e: unknown) {
      console.error("PatientForm", e);
      setError(e instanceof Error && e.message === t("not_auth") ? e.message : t("save_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            {t("full_name")} *
          </label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("name_ph")}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            {t("birth_date")}
          </label>
          <Input
            type="date"
            value={form.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">{t("gender")}</label>
          <select
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">{t("unspecified")}</option>
            <option value="male">{t("male")}</option>
            <option value="female">{t("female")}</option>
            <option value="other">{t("other")}</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">{t("phone")}</label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+52 55 1234 5678"
            dir="ltr"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">{t("email")}</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@ejemplo.com"
            dir="ltr"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700 mb-1 block">{t("patient_notes")}</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder={t("patient_notes_ph")}
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!patient?.id && <p className="text-xs text-slate-500">{tl("patient_consent_hint")}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? t("saving") : patient?.id ? t("update") : t("create_patient")}
        </Button>
      </div>
    </form>
  );
}
