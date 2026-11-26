"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";
import { supabase, type Patient } from "@/lib/supabase";
import { displayName, useRequireUser } from "@/lib/auth";

// Formato de consentimiento del paciente para tratar sus datos de salud (LFPDPPP: datos sensibles → consentimiento
// expreso y por escrito). El terapeuta lo imprime, el paciente lo firma y el original va al expediente.
const CONTACT = "se_salud@yahoo.com";

export default function ConsentPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations("legal");
  const user = useRequireUser();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("patients").select("*").eq("id", id).single().then(({ data }) => data && setPatient(data));
  }, [id, user]);

  async function toggleSigned() {
    if (!patient) return;
    setBusy(true);
    const consent_at = patient.consent_at ? null : new Date().toISOString();
    const { data } = await supabase.from("patients").update({ consent_at }).eq("id", id).select().single();
    if (data) setPatient(data);
    setBusy(false);
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const pro = displayName(user);
  const today = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  const privacyUrl = `${window.location.origin}/es/privacy`;
  const line = "border-b border-slate-400 h-10";

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 print:p-0">
        <div className="mb-4 space-y-3 print:hidden">
          <Link href={`/${locale}/clinical/patients/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("back_patient")}
          </Link>
          <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{t("consent_steps")}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Printer className="h-4 w-4" /> {t("consent_print")}
            </button>
            <button onClick={toggleSigned} disabled={busy}
              className={patient.consent_at
                ? "flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                : "flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"}>
              <CheckCircle2 className="h-4 w-4" />
              {patient.consent_at
                ? `${t("consent_signed", { date: new Date(patient.consent_at).toLocaleDateString(locale) })} · ${t("consent_unmark")}`
                : t("consent_mark")}
            </button>
          </div>
        </div>

        <article lang="es" dir="ltr"
          className="rounded-2xl bg-white p-6 text-[13.5px] leading-relaxed text-slate-800 shadow-sm sm:p-10 print:rounded-none print:p-0 print:shadow-none">
          <h1 className="text-center text-lg font-bold">Consentimiento para el tratamiento de datos personales y de salud</h1>
          <p className="mt-6 text-end">Lugar: ______________________ &nbsp; Fecha: {today}</p>

          <p className="mt-5">
            Yo, <b>{patient.name}</b>, autorizo de manera expresa a <b>{pro || "______________________"}</b> (en adelante,
            &ldquo;el profesional&rdquo;) a recabar y tratar mis datos personales, incluidos mis datos de salud, que la Ley Federal de
            Protección de Datos Personales en Posesión de los Particulares considera datos sensibles, para las siguientes finalidades:
          </p>
          <ul className="mt-2 list-disc space-y-1 ps-6">
            <li>Integrar y conservar mi expediente clínico.</li>
            <li>Realizar mi valoración, diagnóstico y tratamiento.</li>
            <li>Elaborar y enviarme rutinas de ejercicios, y conocer el seguimiento que yo registre en ellas (sesiones realizadas, dolor, dificultad y comentarios).</li>
            <li>Comunicarse conmigo por teléfono, WhatsApp o correo electrónico para fines relacionados con mi tratamiento.</li>
          </ul>

          <p className="mt-4">Declaro que se me informó que:</p>
          <ul className="mt-2 list-disc space-y-1 ps-6">
            <li>
              El profesional guarda mi información en la plataforma Therapia Global, cuyos servidores se ubican en Estados Unidos de América,
              con medidas de seguridad para protegerla, conforme a su aviso de privacidad, disponible en {privacyUrl}.
            </li>
            <li>Mis datos no se utilizarán con fines publicitarios ni se venderán o cederán a terceros, salvo requerimiento de autoridad competente.</li>
            <li>Mi expediente clínico se conservará durante el plazo que exige la normativa sanitaria (mínimo cinco años, conforme a la NOM-004-SSA3-2012).</li>
            <li>
              Puedo acceder a mis datos, rectificarlos, cancelarlos u oponerme a su tratamiento (derechos ARCO), así como revocar este consentimiento,
              dirigiéndome al profesional o escribiendo a {CONTACT}. La revocación no afecta los tratamientos ya realizados ni la obligación legal de
              conservar el expediente.
            </li>
          </ul>

          <p className="mt-4">
            He leído este documento, se me resolvieron mis dudas y otorgo mi consentimiento de forma libre e informada.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 print:grid-cols-2">
            <div>
              <div className={line} />
              <p className="mt-1 text-center text-xs">Nombre y firma del paciente<br />{patient.name}</p>
            </div>
            <div>
              <div className={line} />
              <p className="mt-1 text-center text-xs">Nombre y firma del profesional<br />{pro}</p>
            </div>
            <div className="sm:col-span-2 print:col-span-2">
              <div className={line} />
              <p className="mt-1 text-center text-xs">
                En caso de menor de edad o persona que no pueda otorgar su consentimiento: nombre, firma y parentesco del padre, madre, tutor o representante legal
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
