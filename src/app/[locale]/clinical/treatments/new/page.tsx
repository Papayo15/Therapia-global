"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AITreatmentGenerator, type AITreatmentResult } from "@/components/clinical/AITreatmentGenerator";
import { TreatmentPlanEditor } from "@/components/clinical/TreatmentPlanEditor";
import { supabase, type SoapNote, type TreatmentPlan } from "@/lib/supabase";

type Step = "generate" | "edit" | "done";

function TreatmentsNewContent() {
  const searchParams = useSearchParams();
  const soapId = searchParams.get("soap") ?? undefined;
  const patientId = searchParams.get("patient") ?? "";
  const locale = useLocale();
  const router = useRouter();

  const [soap, setSoap] = useState<SoapNote | null>(null);
  const [aiResult, setAiResult] = useState<AITreatmentResult | null>(null);
  const [savedPlan, setSavedPlan] = useState<TreatmentPlan | null>(null);
  const [step, setStep] = useState<Step>("generate");

  useEffect(() => {
    if (!soapId) return;
    supabase
      .from("soap_notes")
      .select("*")
      .eq("id", soapId)
      .single()
      .then(({ data }) => { if (data) setSoap(data); });
  }, [soapId]);

  function handleBack() {
    router.push(patientId
      ? `/${locale}/clinical/patients/${patientId}`
      : `/${locale}/clinical/patients`
    );
  }

  function handleAIResult(result: AITreatmentResult) {
    setAiResult(result);
    setStep("edit");
  }

  function handlePlanSaved(plan: TreatmentPlan) {
    setSavedPlan(plan);
    setStep("done");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Plan de tratamiento" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al paciente
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[
                { label: "Generar con IA", key: "generate" },
                { label: "Revisar plan", key: "edit" },
                { label: "Guardado", key: "done" },
              ].map(({ label, key }, i, arr) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === key ? "bg-blue-600 text-white" :
                    (arr.findIndex((a) => a.key === step) > i) ? "bg-emerald-500 text-white" :
                    "bg-slate-200 text-slate-500"
                  }`}>
                    {arr.findIndex((a) => a.key === step) > i ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-semibold ${step === key ? "text-slate-900" : "text-slate-400"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <div className="w-6 h-px bg-slate-200" />}
                </div>
              ))}
            </div>

            {step === "generate" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-base font-bold text-slate-900 mb-1">Generar plan con TherapIA</h2>
                <p className="text-sm text-slate-500 mb-5">
                  La IA analizará los datos clínicos SOAP y recomendará ejercicios terapéuticos específicos.
                </p>
                {soap ? (
                  <AITreatmentGenerator soap={soap} onResult={handleAIResult} />
                ) : (
                  <div>
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
                      No se encontró nota SOAP. Ingresa el diagnóstico manualmente:
                    </p>
                    <AITreatmentGenerator
                      soap={{
                        id: "", patient_id: patientId, doctor: "",
                        subjective: "", objective: "", assessment: "",
                        diagnosis: "Evaluación fisioterapéutica general",
                        plan: "", created_at: new Date().toISOString(),
                      }}
                      onResult={handleAIResult}
                    />
                  </div>
                )}
              </div>
            )}

            {step === "edit" && aiResult && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Revisar y ajustar el plan</h2>
                <TreatmentPlanEditor
                  patientId={patientId}
                  soapId={soapId}
                  aiResult={aiResult}
                  onSaved={handlePlanSaved}
                  onCancel={() => setStep("generate")}
                />
              </div>
            )}

            {step === "done" && savedPlan && (
              <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-slate-900 mb-1">¡Plan guardado!</h2>
                <p className="text-sm text-slate-500 mb-6">
                  El plan de tratamiento se guardó correctamente con {savedPlan.treatment_exercises?.length ?? 0} ejercicios.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBack}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Ver historial del paciente
                  </button>
                  <button
                    onClick={() => router.push(`/${locale}/clinical/patients`)}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Ir a pacientes
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default function TreatmentsNewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TreatmentsNewContent />
    </Suspense>
  );
}
