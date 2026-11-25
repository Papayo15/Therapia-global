import { redirect } from "next/navigation";

// La lista de pacientes real vive en /clinical/patients (datos de Supabase por terapeuta).
export default async function PatientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/clinical/patients`);
}
