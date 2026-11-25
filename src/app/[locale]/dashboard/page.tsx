"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, ClipboardList, CalendarDays, Plus, BookOpen, ArrowRight, Send, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { supabase, type Patient } from "@/lib/supabase";
import { displayName, initials, useUser } from "@/lib/auth";
import { LIBRARY_ITEMS } from "@/lib/videoLibrary";
import { cn } from "@/lib/utils";

type RoutineRow = { id: string; patient_name: string; diagnosis: string | null; created_at: string };

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">{title}</p>
            <p className="mt-1.5 text-3xl font-bold text-surface-900">{value}</p>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const user = useUser();
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [routines, setRoutines] = useState<RoutineRow[] | null>(null);
  const [routineCount, setRoutineCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    (async () => {
      const [p, r, w] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
        supabase.from("routine_plans").select("id, patient_name, diagnosis, created_at", { count: "exact" })
          .order("created_at", { ascending: false }).limit(5),
        supabase.from("routine_plans").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      ]);
      setPatients((p.data as Patient[]) ?? []);
      setPatientCount(p.count ?? 0);
      setRoutines((r.data as RoutineRow[]) ?? []);
      setRoutineCount(r.count ?? 0);
      setWeekCount(w.count ?? 0);
    })();
  }, [user]);

  const name = displayName(user);
  const fmt = (d: string) => new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short" });
  const empty = patients !== null && routines !== null && patientCount === 0 && routineCount === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={name ? t("hello", { name }) : ""} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {empty && (
              <Card className="border-brand-200 bg-gradient-to-r from-brand-50 to-clinical-50">
                <CardContent className="p-5">
                  <p className="font-semibold text-surface-900">{t("first_steps")}</p>
                  <ol className="mt-3 grid gap-2 sm:grid-cols-3">
                    {[
                      { k: "step1", href: "/clinical/patients?nuevo=1", icon: UserPlus },
                      { k: "step2", href: "/routines", icon: ClipboardList },
                      { k: "step3", href: "/routines", icon: Send },
                    ].map((s, i) => (
                      <li key={s.k}>
                        <Link href={`/${locale}${s.href}`}
                          className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2.5 text-sm text-surface-700 hover:bg-white">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                          {t(s.k)}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard title={t("patients_total")} value={patientCount} icon={Users} iconColor="text-brand-600" iconBg="bg-brand-100" />
              <StatCard title={t("routines_total")} value={routineCount} icon={ClipboardList} iconColor="text-clinical-600" iconBg="bg-clinical-100" />
              <StatCard title={t("routines_week")} value={weekCount} icon={CalendarDays} iconColor="text-amber-600" iconBg="bg-amber-100" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex-row items-center justify-between pb-4">
                  <CardTitle>{t("recent_patients")}</CardTitle>
                  <Link href={`/${locale}/clinical/patients`} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                    {t("view_all")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {patients && patients.length === 0 && <p className="px-6 pb-6 text-sm text-surface-400">{t("no_patients")}</p>}
                  <div className="divide-y divide-surface-100">
                    {(patients ?? []).map((p) => (
                      <Link key={p.id} href={`/${locale}/clinical/patients/${p.id}`}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-50 transition-colors">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs font-semibold">{initials(p.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-800 truncate">{p.name}</p>
                          <p className="text-xs text-surface-400 mt-0.5">{fmt(p.created_at)}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-surface-300 rtl:rotate-180" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>{t("quick_actions")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {[
                    { label: t("new_routine"), icon: Plus, href: "/routines", cls: "bg-brand-600 text-white hover:bg-brand-500" },
                    { label: t("add_patient"), icon: Users, href: "/clinical/patients?nuevo=1", cls: "border border-surface-200 text-surface-700 hover:bg-surface-50" },
                    { label: t("view_library"), icon: BookOpen, href: "/exercises", cls: "bg-surface-100 text-surface-700 hover:bg-surface-200" },
                  ].map((a) => (
                    <Link key={a.href + a.label} href={`/${locale}${a.href}`}
                      className={cn("flex h-10 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors", a.cls)}>
                      <a.icon className="h-4 w-4" />
                      {a.label}
                    </Link>
                  ))}
                  <p className="mt-2 text-xs text-surface-400">{t("library_count", { n: LIBRARY_ITEMS.length })}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{t("recent_routines")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {routines && routines.length === 0 && <p className="px-6 pb-6 text-sm text-surface-400">{t("no_routines")}</p>}
                <div className="divide-y divide-surface-100">
                  {(routines ?? []).map((r) => (
                    <a key={r.id} href={`/${locale}/p/${r.id}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-50 transition-colors">
                      <ClipboardList className="h-4 w-4 shrink-0 text-clinical-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-800 truncate">{r.patient_name}</p>
                        <p className="text-xs text-surface-400 mt-0.5 truncate">{r.diagnosis || ""} · {fmt(r.created_at)}</p>
                      </div>
                      <span className="text-xs font-medium text-brand-600">{t("open")}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
