import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ShieldCheck } from "lucide-react";

// Aviso de privacidad integral (LFPDPPP, México). La versión con validez legal es la redactada en español.
const UPDATED = "25 de noviembre de 2026";
const CONTACT = "se_salud@yahoo.com";

type Block = { h: string; p?: string[]; li?: string[] };

const AVISO: Block[] = [
  {
    h: "1. Identidad y domicilio del responsable",
    p: [
      "Juan Pablo Cevallos (en adelante, “Therapia Global”), con domicilio en Calle 37-A número 322, colonia Monte Albán, Mérida, Yucatán, México, es responsable del tratamiento de los datos personales que se recaban a través de la plataforma Therapia Global (therapiaglobal-app.netlify.app), conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y demás normativa aplicable.",
      `Medio de contacto para cualquier asunto relacionado con sus datos personales: ${CONTACT}.`,
    ],
  },
  {
    h: "2. A quién aplica este aviso",
    li: [
      "Profesionales de la salud (fisioterapeutas, osteópatas, quiroprácticos y afines) que crean una cuenta en la plataforma (“el terapeuta”).",
      "Pacientes cuyos datos captura el terapeuta, y pacientes que abren la rutina de ejercicios que su terapeuta les envía por enlace (“el paciente”).",
    ],
  },
  {
    h: "3. Datos personales que se tratan",
    p: ["Del terapeuta:"],
    li: [
      "Nombre, correo electrónico, especialidad, idioma de preferencia y contraseña (esta se guarda cifrada; nadie, incluido Therapia Global, puede leerla).",
    ],
  },
  {
    h: "",
    p: ["Del paciente, capturados por su terapeuta:"],
    li: [
      "Identificación y contacto: nombre, fecha de nacimiento, teléfono y correo electrónico.",
      "Datos de salud: notas clínicas en formato SOAP (motivo de consulta, exploración, evaluación, diagnóstico y plan), antecedentes y notas generales, y las rutinas de ejercicios indicadas.",
    ],
  },
  {
    h: "",
    p: ["Del paciente, enviados por él mismo al usar su rutina:"],
    li: [
      "Fecha en que realizó la rutina, número de ejercicios completados, nivel de dolor (0 a 10), dificultad percibida y, si lo desea, un comentario para su terapeuta.",
    ],
  },
  {
    h: "",
    p: [
      "Los datos de salud son datos personales sensibles. Se tratan con medidas de seguridad reforzadas y únicamente para las finalidades descritas en este aviso. No se recaban datos financieros ni patrimoniales.",
    ],
  },
  {
    h: "4. Finalidades del tratamiento",
    p: ["Finalidades primarias, necesarias para prestar el servicio:"],
    li: [
      "Crear y administrar la cuenta del terapeuta y permitirle iniciar sesión.",
      "Permitir al terapeuta llevar el expediente de sus pacientes: registrar, consultar, editar y conservar sus datos y notas clínicas.",
      "Generar las rutinas de ejercicios y el enlace personal con el que el paciente las consulta.",
      "Registrar el seguimiento que envía el paciente (sesiones, dolor, dificultad y comentarios) y mostrárselo únicamente a su terapeuta.",
      "Dar soporte técnico, mantener la seguridad de la plataforma y cumplir obligaciones legales.",
    ],
  },
  {
    h: "",
    p: [
      "Therapia Global no utiliza los datos para finalidades secundarias: no envía publicidad, no vende ni renta datos, no elabora perfiles comerciales y no usa los datos clínicos para entrenar sistemas de inteligencia artificial.",
    ],
  },
  {
    h: "5. Papel del terapeuta respecto a los datos de sus pacientes",
    p: [
      "Los datos de cada paciente los captura y controla su terapeuta, quien decide qué información registrar y es responsable frente al paciente de haber obtenido su consentimiento expreso para tratar sus datos de salud. Respecto de esos datos, Therapia Global actúa como encargado: los almacena y procesa por cuenta del terapeuta y solo conforme a sus instrucciones dentro de la plataforma.",
      "Cada terapeuta solo puede ver a sus propios pacientes. Ningún otro usuario de la plataforma tiene acceso a ellos.",
    ],
  },
  {
    h: "6. Con quién se comparten los datos",
    p: [
      "Para operar, la plataforma utiliza proveedores de infraestructura que actúan como encargados y no pueden usar los datos para fines propios:",
    ],
    li: [
      "Supabase Inc.: base de datos y autenticación. Los datos se alojan en servidores ubicados en Estados Unidos de América.",
      "Netlify Inc.: hospedaje del sitio web.",
    ],
  },
  {
    h: "",
    p: [
      "Estas comunicaciones son remisiones a encargados y no requieren su consentimiento. Fuera de ellas, los datos solo se comunican a autoridades competentes cuando lo exija la ley o una orden judicial. Therapia Global no realiza otras transferencias de datos personales.",
    ],
  },
  {
    h: "7. Conservación",
    p: [
      "Los datos del terapeuta se conservan mientras su cuenta esté activa. Los expedientes clínicos se conservan durante el plazo que exige la normativa sanitaria (la NOM-004-SSA3-2012 establece un mínimo de cinco años desde el último acto médico). Por eso, cuando el terapeuta “elimina” a un paciente o una nota, la información deja de mostrarse pero se conserva de forma segura hasta que concluya dicho plazo, y después se suprime.",
      "Los enlaces de rutina vencen a los 180 días.",
    ],
  },
  {
    h: "8. Derechos ARCO y revocación del consentimiento",
    p: [
      `Usted puede Acceder a sus datos, Rectificarlos, Cancelarlos u Oponerse a su tratamiento (derechos ARCO), así como revocar su consentimiento, enviando una solicitud a ${CONTACT} que incluya:`,
    ],
    li: [
      "Su nombre y un medio para comunicarle la respuesta.",
      "Una copia de su identificación oficial o, en su caso, la de su representante legal y el documento que acredite la representación.",
      "La descripción clara de los datos y del derecho que desea ejercer.",
      "Cualquier documento que facilite localizar sus datos (por ejemplo, el nombre de su terapeuta).",
    ],
  },
  {
    h: "",
    p: [
      "Le responderemos en un plazo máximo de 20 días hábiles y, si la solicitud procede, se hará efectiva dentro de los 15 días hábiles siguientes. Si usted es paciente, también puede dirigirse directamente a su terapeuta, quien puede corregir sus datos desde la plataforma. La cancelación de datos clínicos puede estar limitada por la obligación legal de conservar el expediente. Usted puede, además, limitar el uso de sus datos por el mismo medio.",
    ],
  },
  {
    h: "9. Cookies y tecnologías similares",
    p: [
      "La plataforma solo utiliza el almacenamiento del navegador indispensable para mantener la sesión iniciada y recordar el idioma. No se usan cookies publicitarias ni herramientas de rastreo o analítica de terceros.",
    ],
  },
  {
    h: "10. Medidas de seguridad",
    li: [
      "Toda la comunicación viaja cifrada (HTTPS).",
      "Las contraseñas se almacenan cifradas.",
      "Reglas de acceso en la base de datos que impiden que un terapeuta vea datos de otro.",
      "El paciente solo accede a su propia rutina mediante un enlace único y difícil de adivinar, que vence a los 180 días.",
      "Las notas clínicas guardan un historial de cambios.",
    ],
  },
  {
    h: "11. Cambios al aviso de privacidad",
    p: [
      "Cualquier cambio a este aviso se publicará en esta misma página, indicando la fecha de la última actualización. Si el cambio afecta las finalidades o requiere un nuevo consentimiento, se le informará al iniciar sesión.",
    ],
  },
  {
    h: "12. Autoridad",
    p: [
      "Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir ante la autoridad competente en materia de protección de datos personales en México.",
    ],
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: `${t("privacy_title")} · Therapia Global` };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Therapia Global
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{t("privacy_title")}</h1>
            <p className="text-xs text-surface-500">Última actualización: {UPDATED}</p>
          </div>
        </div>

        {locale !== "es" && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("official_es")}</p>
        )}

        <article lang="es" dir="ltr" className="mt-6 rounded-2xl border border-surface-200 bg-white p-5 sm:p-8 space-y-4 text-[15px] leading-relaxed text-surface-700">
          {AVISO.map((b, i) => (
            <section key={i} className="space-y-2">
              {b.h && <h2 className="pt-3 text-base font-bold text-surface-900">{b.h}</h2>}
              {b.p?.map((x, j) => <p key={j}>{x}</p>)}
              {b.li && (
                <ul className="list-disc space-y-1 ps-5">
                  {b.li.map((x, j) => <li key={j}>{x}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
