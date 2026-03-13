"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SoapHistory } from "@/components/clinical/SoapHistory";
import { SoapForm } from "@/components/clinical/SoapForm";
import { Button } from "@/components/ui/button";
import { supabase, type Patient, type SoapNote } from "@/lib/supabase";

type View = "overview" | "new-soap" | "new-treatment";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [selectedSoap, setSelectedSoap] = useState<SoapNote | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setPatient(data);
      setLoading(false);
    }
    fetchPatient();
  }, [id]);

  function handleSoapSaved(note: SoapNote) {
    setSelectedSoap(note);
    router.push(`/${locale}/clinical/treatments/new?soap=${note.id}&patient=${id}`);
  }

  function handleCreateTreatment(note: SoapNote) {
    router.push(`/${locale}/clinical/treatments/new?soap=${note.id}&patient=${id}`);
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-surface-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title="Paciente" />
          <main className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-screen overflow-hidden bg-surface-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title="Paciente no encontrado" />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-slate-500">Este paciente no existe o no tienes acceso.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={patient.name} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

            {/* Back */}
            <button
              onClick={() => router.push(`/${locale}/clinical/patients`)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a pacientes
            </button>

            {/* Patient info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-700 font-bold text-xl">
                    {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {patient.birth_date && (
                      <span className="text-xs text-slate-500">
                        {new Date(patient.birth_date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    )}
                    {patient.phone && <span className="text-xs text-slate-500">{patient.phone}</span>}
                    {patient.email && <span className="text-xs text-slate-500">{patient.email}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* SOAP section */}
            {view === "overview" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Notas SOAP
                  </h3>
                  <Button
                    onClick={() => setView("new-soap")}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nueva nota SOAP
                  </Button>
                </div>
                <SoapHistory
                  patientId={id}
                  onCreateTreatment={handleCreateTreatment}
                />
              </div>
            )}

            {view === "new-soap" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900">Nueva nota SOAP</h3>
                  <button onClick={() => setView("overview")} className="text-sm text-slate-500 hover:text-slate-800">
                    Cancelar
                  </button>
                </div>
                <SoapForm
                  patientId={id}
                  onSave={handleSoapSaved}
                  onCancel={() => setView("overview")}
                />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
