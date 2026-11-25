import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  Dumbbell, Bone, Brain, Users, BarChart3, Sparkles,
  ArrowRight, Check, Globe, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { LIBRARY_ITEMS } from "@/lib/videoLibrary";
import { encodePlanId } from "@/lib/planLink";
import type { PlanExercise } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations("landing");

  // cifras reales, calculadas de la biblioteca
  const stats = [
    { value: String(LIBRARY_ITEMS.length), label: t("stats.techniques") },
    { value: String(LIBRARY_ITEMS.filter((i) => i.categoria === "osteopatia").length), label: t("stats.osteopathy") },
    { value: "2", label: t("stats.views") },
    { value: "10", label: t("stats.languages") },
  ];
  // "Ver demo": una rutina real de ejemplo, tal como la recibe el paciente
  const demoEx = ["F-CAD-007", "F-HOM-003", "E-043"].map((id, i) => ({
    exercise_id: id, nombre_display: "", youtube_id: "", youtube_start_seconds: 0, sets: i === 2 ? 2 : 3, reps: i === 2 ? 0 : 10,
    rest_seconds: 45, frequency_per_week: 3, equipment_used: "", equipment_alternative: "", note_from_therapist: "", instructions_eli5: [], order: i + 1,
  })) as PlanExercise[];
  const demoId = encodePlanId({ patientName: t("demo_patient"), diagnosis: t("demo_title"), phase: "", frequency_per_week: 3, duration_weeks: 4, exercises: demoEx });

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-clinical-50 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-100 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-clinical-100 opacity-40 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="brand" className="gap-1.5 px-3 py-1 text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {t("badge")}
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-surface-950 sm:text-5xl lg:text-6xl text-balance leading-tight">
            {t("headline").split("\n").map((line, i) => (
              <span key={i}>
                {i === 1 ? (
                  <span className="gradient-text">{line}</span>
                ) : (
                  line
                )}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-500 text-pretty leading-relaxed">
            {t("subheadline")}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href={`/${locale}/signup`}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm hover:shadow-md">
              {t("cta_primary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/${locale}/p/${demoId}`}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-semibold rounded-xl border border-surface-200 bg-transparent text-surface-700 hover:bg-surface-50 hover:border-surface-300 transition-all">
              <Play className="h-4 w-4" />
              {t("cta_secondary")}
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="mt-4 text-xs text-surface-400">
            {t("trust")}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-surface-100 bg-white/80 glass px-4 py-5 shadow-card"
            >
              <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
              <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const t = useTranslations("landing");

  const features = [
    {
      key: "routines",
      icon: ClipboardListIcon,
      color: "brand",
    },
    {
      key: "library",
      icon: DumbbellIcon,
      color: "clinical",
    },
    {
      key: "osteopathy",
      icon: BoneIcon,
      color: "brand",
    },
    {
      key: "anatomy",
      icon: BrainIcon,
      color: "clinical",
    },
    {
      key: "clinical",
      icon: UsersIcon,
      color: "brand",
    },
    {
      key: "whatsapp",
      icon: SparklesIcon,
      color: "clinical",
    },
  ] as const;

  return (
    <section className="bg-surface-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
            {t("features_title")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.key}
              className="group overflow-hidden transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5"
            >
              <CardContent className="p-6">
                <div className={cn(
                  "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl",
                  feature.color === "brand" ? "bg-brand-100" : "bg-clinical-100"
                )}>
                  <feature.icon
                    className={cn(
                      "h-5 w-5",
                      feature.color === "brand" ? "text-brand-600" : "text-clinical-600"
                    )}
                  />
                </div>
                <h3 className="mb-2 text-base font-semibold text-surface-900">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {t(`features.${feature.key}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Cómo funciona ────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const t = useTranslations("landing");
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-10 text-center text-3xl font-bold text-surface-900 sm:text-4xl">{t("how_title")}</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {(["how1", "how2", "how3"] as const).map((k, i) => (
            <li key={k} className="rounded-2xl border border-surface-200 bg-surface-50 p-6">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
              <p className="font-semibold text-surface-900">{t(`${k}_title`)}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-surface-500">{t(`${k}_desc`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA({ locale }: { locale: string }) {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden bg-surface-950 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 to-surface-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Badge variant="dark" className="mb-6 border border-surface-700">
          <Globe className="h-3 w-3" />
          {t("languages_badge")}
        </Badge>
        <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">
          {t("footer_cta")}
        </h2>
        <p className="mt-4 text-surface-400">{t("footer_cta_sub")}</p>
        <div className="mt-8 flex justify-center">
          <Link href={`/${locale}/signup`}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-semibold rounded-xl bg-clinical-500 text-white hover:bg-clinical-600 transition-all shadow-sm">
            {t("cta_primary")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function LandingNav({ locale }: { locale: string }) {
  const t = useTranslations("landing");

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
            <span className="text-sm font-bold text-white">T</span>
          </div>
          <span className="text-sm font-bold text-surface-900">Therapia Global</span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href={`/${locale}/login`}
            className="inline-flex items-center h-8 px-3 text-sm font-medium rounded-xl text-surface-600 hover:bg-surface-100 hover:text-surface-800 transition-all">
            {t("sign_in")}
          </Link>
          <Link href={`/${locale}/signup`}
            className="inline-flex items-center h-8 px-3 text-sm font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all">
            {t("cta_primary")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Icon Components (wrappers for type safety) ───────────────────────────────
function ClipboardListIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
}
function DumbbellIcon({ className }: { className?: string }) {
  return <Dumbbell className={className} />;
}
function BoneIcon({ className }: { className?: string }) {
  return <Bone className={className} />;
}
function BrainIcon({ className }: { className?: string }) {
  return <Brain className={className} />;
}
function UsersIcon({ className }: { className?: string }) {
  return <Users className={className} />;
}
function SparklesIcon({ className }: { className?: string }) {
  return <Sparkles className={className} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tl = await getTranslations({ locale, namespace: "legal" });
  return (
    <div className="min-h-screen">
      <LandingNav locale={locale} />
      <main>
        <HeroSection locale={locale} />
        <FeaturesSection />
        <HowItWorksSection />
        <FooterCTA locale={locale} />
      </main>
      <footer className="border-t border-surface-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Therapia Global
          </p>
          <div className="flex items-center gap-4 text-xs text-surface-400">
            <Link href={`/${locale}/privacy`} className="hover:text-surface-700 underline-offset-2 hover:underline">{tl("footer_privacy")}</Link>
            <span>{t("languages_badge")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
