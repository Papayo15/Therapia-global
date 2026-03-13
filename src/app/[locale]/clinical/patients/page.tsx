"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PatientList } from "@/components/clinical/PatientList";
import { PatientForm } from "@/components/clinical/PatientForm";
import { X } from "lucide-react";
import type { Patient } from "@/lib/supabase";

type View = "list" | "new-patient";

export default function PatientsPage() {
  const [view, setView] = useState<View>("list");
  const router = useRouter();
  const locale = useLocale();

  function handleSelectPatient(patient: Patient) {
    router.push(`/${locale}/clinical/patients/${patient.id}`);
  }

  function handlePatientSaved(patient: Patient) {
    router.push(`/${locale}/clinical/patients/${patient.id}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Pacientes clínicos" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6">

            {view === "list" && (
              <PatientList
                onSelectPatient={handleSelectPatient}
                onNewPatient={() => setView("new-patient")}
              />
            )}

            {view === "new-patient" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900">Nuevo paciente</h2>
                  <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <PatientForm
                    onSave={handlePatientSaved}
                    onCancel={() => setView("list")}
                  />
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
