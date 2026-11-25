import { redirect } from "next/navigation";
import { FEATURES } from "@/lib/constants";

// Planes de tratamiento con IA: ocultos hasta configurar la IA (sin clave responde con ejemplos).
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!FEATURES.AI_RECOMMENDATIONS_ENABLED) redirect(`/${locale}/clinical/patients`);
  return children;
}
