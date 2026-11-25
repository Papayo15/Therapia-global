import { redirect } from "next/navigation";
import { FEATURES } from "@/lib/constants";

// Sección oculta mientras su feature flag esté apagado.
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!FEATURES.ANATOMY_3D_ENABLED) redirect(`/${locale}/dashboard`);
  return children;
}
