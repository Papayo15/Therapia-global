"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, ClipboardList, FileText, Plus, Pencil, Trash2, Phone, Mail, Cake, ShieldCheck, ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SoapHistory } from "@/components/clinical/SoapHistory";
import { SoapForm } from "@/components/clinical/SoapForm";
import { PatientForm } from "@/components/clinical/PatientForm";
import { PatientRoutines } from "@/components/clinical/PatientRoutines";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { supabase, type Patient, type SoapNote } from "@/lib/supabase";

type View = "overview" | "soap-form" | "edit-patient";
type Tab = "routines" | "soap";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("clin");
  const tl = useTranslations("legal");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [tab, setTab] = useState<Tab>("routines");
  const [editingNote, setEditingNote] = useState<SoapNote | undefined>();
  const [refresh, setRefresh] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id).single();
      if (!error && data && !data.deleted_at) setPatient(data);
      setLoading(false);
    })();
    if (new URLSearchParams(window.location.search).get("tab") === "soap") setTab("soap");
  }, [id]);

  // rutina para el paciente: el constructor abre ligado a él, con su nombre y el diagnóstico de la nota
  function routineUrl(note?: SoapNote) {
    const q = new URLSearchParams({ pid: id, p: patient?.name ?? "", ...(patient?.phone ? { tel: patient.phone } : {}),
      ...(note?.diagnosis ? { dx: note.diagnosis } : {}) });
    return `/${locale}/routines?${q}`;
  }

  async function deletePatient() {
    // borrado lógico: el expediente se conserva (NOM-004) pero desaparece de la lista
    await supabase.from("patients").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    router.push(`/${locale}/clinical/patients`);
  }

  const shell = (title: string, body: React.ReactNode) => (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        {body}
      </div>
    </div>
  );

  if (loading) {
    return shell(t("patient"), (
      <main className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    ));
  }
  if (!patient) {
    return shell(t("patient_not_found"), (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 px-6 text-center">{t("patient_not_found_hint")}</p>
      </main>
    ));
  }

  return shell(patient.name, (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <button onClick={() => router.push(`/${locale}/clinical/patients`)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("back_to_patients")}
        </button>

        {view === "edit-patient" ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 mb-5">{t("edit_patient")}</h3>
            <PatientForm patient={patient} onSave={(p) => { setPatient(p); setView("overview"); }} onCancel={() => setView("overview")} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-xl">{initials(patient.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {patient.birth_date && (
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Cake className="h-3 w-3" />
                      {new Date(patient.birth_date + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  )}
                  {patient.phone && <span className="flex items-center gap-1 text-xs text-slate-500" dir="ltr"><Phone className="h-3 w-3" />{patient.phone}</span>}
                  {patient.email && <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" />{patient.email}</span>}
                </div>
                {patient.notes && <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{patient.notes}</p>}
                <Link href={`/${locale}/clinical/patients/${id}/consent`}
                  className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    patient.consent_at ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 hover:bg-amber-100")}>
                  {patient.consent_at ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {patient.consent_at
                    ? tl("consent_signed", { date: new Date(patient.consent_at).toLocaleDateString(locale) })
                    : tl("consent_missing")}
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button onClick={() => setView("edit-patient")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Pencil className="h-3.5 w-3.5" /> {t("edit_patient")}
              </button>
              <Link href={`/${locale}/clinical/patients/${id}/consent`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <ShieldCheck className="h-3.5 w-3.5" /> {tl("consent_doc")}
              </Link>
              {confirmDelete ? (
                <span className="flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">
                  {t("confirm_delete_patient")}
                  <button onClick={deletePatient} className="font-bold underline">{t("yes_delete")}</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-slate-500">{t("cancel")}</button>
                </span>
              ) : (
                <button onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> {t("delete_patient")}
                </button>
              )}
            </div>
          </div>
        )}

        {view === "soap-form" && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">{editingNote ? t("edit_soap") : t("new_soap")}</h3>
              <button onClick={() => setView("overview")} className="text-sm text-slate-500 hover:text-slate-800">{t("cancel")}</button>
            </div>
            <SoapForm
              key={editingNote?.id ?? "new"}
              patientId={id}
              note={editingNote}
              onSave={() => { setView("overview"); setTab("soap"); setRefresh((r) => r + 1); }}
              onCancel={() => setView("overview")}
            />
          </div>
        )}

        {view === "overview" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex rounded-xl bg-slate-100 p-1">
                {([
                  { id: "routines", icon: ClipboardList, label: t("tab_routines") },
                  { id: "soap", icon: FileText, label: t("soap_notes") },
                ] as const).map((x) => (
                  <button key={x.id} onClick={() => setTab(x.id)}
                    className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold",
                      tab === x.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>
                    <x.icon className="h-4 w-4" /> {x.label}
                  </button>
                ))}
              </div>
              {tab === "routines" ? (
                <Button onClick={() => router.push(routineUrl())} size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> {t("new_routine")}
                </Button>
              ) : (
                <Button onClick={() => { setEditingNote(undefined); setView("soap-form"); }} size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> {t("new_soap")}
                </Button>
              )}
            </div>
            {tab === "routines" ? (
              <PatientRoutines patient={patient} />
            ) : (
              <SoapHistory
                patientId={id}
                refreshKey={refresh}
                onEdit={(n) => { setEditingNote(n); setView("soap-form"); }}
                onCreateRoutine={(n) => router.push(routineUrl(n))}
              />
            )}
          </div>
        )}
      </div>
    </main>
  ));
}
