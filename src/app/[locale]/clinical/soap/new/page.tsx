"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SoapForm } from "@/components/clinical/SoapForm";
import { supabase, type Patient, type SoapNote } from "@/lib/supabase";

function SoapNewContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patient") ?? "";
  const locale = useLocale();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!patientId) return;
    supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single()
      .then(({ data }) => { if (data) setPatient(data); });
  }, [patientId]);

  function handleSaved(note: SoapNote) {
    router.push(`/${locale}/clinical/treatments/new?soap=${note.id}&patient=${patientId}`);
  }

  function handleCancel() {
    router.push(patientId
      ? `/${locale}/clinical/patients/${patientId}`
      : `/${locale}/clinical/patients`
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={patient ? `SOAP — ${patient.name}` : "Nueva nota SOAP"} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            {!patientId ? (
              <p className="text-red-600 text-sm">Error: no se especificó un paciente. Regresa y selecciona un paciente.</p>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Registrar nota SOAP</h2>
                <SoapForm
                  patientId={patientId}
                  onSave={handleSaved}
                  onCancel={handleCancel}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SoapNewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SoapNewContent />
    </Suspense>
  );
}
