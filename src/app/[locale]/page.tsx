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
import { PLATFORM_STATS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const t = useTranslations("landing");

  const stats = [
    { value: PLATFORM_STATS.therapists, label: t("stats.therapists") },
    { value: PLATFORM_STATS.exercises,  label: t("stats.exercises") },
    { value: PLATFORM_STATS.languages,  label: t("stats.languages") },
    { value: PLATFORM_STATS.countries,  label: t("stats.countries") },
  ];

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
            <Button size="xl" variant="primary" asChild>
              <Link href="#signup" className="gap-2">
                {t("cta_primary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="#demo" className="gap-2">
                <Play className="h-4 w-4" />
                {t("cta_secondary")}
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="mt-4 text-xs text-surface-400">
            Free forever for basic use · No credit card · Cancel anytime
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
      key: "tracking",
      icon: UsersIcon,
      color: "brand",
    },
    {
      key: "ai",
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

// ─── Comparison Section ───────────────────────────────────────────────────────

function ComparisonSection() {
  const t = useTranslations("landing");

  const comparisons = [
    { label: "Complete exercise library", wibbi: false, therapia: true },
    { label: "Osteopathy techniques", wibbi: false, therapia: true },
    { label: "Applied anatomy", wibbi: false, therapia: true },
    { label: "10 languages", wibbi: false, therapia: true },
    { label: "Arabic RTL support", wibbi: false, therapia: true },
    { label: "Clinical AI recommendations", wibbi: false, therapia: true },
    { label: "Professional network", wibbi: false, therapia: true },
    { label: "Certifications", wibbi: false, therapia: true },
    { label: "WhatsApp delivery", wibbi: true, therapia: true },
    { label: "Patient adherence tracking", wibbi: true, therapia: true },
    { label: "Unlimited content access", wibbi: false, therapia: true },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
            {t("comparison_title")}
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-200 shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="px-6 py-4 text-start text-sm font-semibold text-surface-700 w-full">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-surface-400 whitespace-nowrap">
                  Wibbi
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-brand-600 whitespace-nowrap">
                  Therapia Global
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {comparisons.map((row, i) => (
                <tr key={i} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-sm text-surface-700">{row.label}</td>
                  <td className="px-6 py-3.5 text-center">
                    {row.wibbi ? (
                      <Check className="mx-auto h-4 w-4 text-surface-400" />
                    ) : (
                      <span className="text-surface-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {row.therapia ? (
                      <Check className="mx-auto h-4 w-4 text-clinical-500" strokeWidth={2.5} />
                    ) : (
                      <span className="text-surface-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA() {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden bg-surface-950 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 to-surface-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Badge variant="dark" className="mb-6 border border-surface-700">
          <Globe className="h-3 w-3" />
          Global Platform
        </Badge>
        <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">
          {t("footer_cta")}
        </h2>
        <p className="mt-4 text-surface-400">{t("footer_cta_sub")}</p>
        <div className="mt-8 flex justify-center">
          <Button size="xl" variant="clinical" asChild>
            <Link href="#signup" className="gap-2">
              {t("cta_primary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function LandingNav() {
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="#login">Sign in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="#signup">{t("cta_primary")}</Link>
          </Button>
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

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ComparisonSection />
        <FooterCTA />
      </main>
      <footer className="border-t border-surface-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Therapia Global. All rights reserved.
          </p>
          <p className="text-xs text-surface-400">
            Available in 10 languages · 80+ countries
          </p>
        </div>
      </footer>
    </div>
  );
}
