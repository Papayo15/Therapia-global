import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import {
  Users, ClipboardList, AlertTriangle, Sparkles,
  TrendingUp, Plus, BookOpen, ArrowRight, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

// ─── Mock Data (será reemplazado por API) ──────────────────────────────────────

const MOCK_STATS = {
  activePatients: 24,
  routinesSentToday: 8,
  lowAdherencePatients: 3,
};

const MOCK_RECENT_PATIENTS = [
  { id: "1", name: "María López",    initials: "ML", lastActivity: "2h ago",  adherence: 92, status: "active"    },
  { id: "2", name: "Carlos Ruiz",    initials: "CR", lastActivity: "5h ago",  adherence: 78, status: "active"    },
  { id: "3", name: "Ana Martínez",   initials: "AM", lastActivity: "3d ago",  adherence: 35, status: "attention" },
  { id: "4", name: "Pedro Sánchez",  initials: "PS", lastActivity: "1d ago",  adherence: 88, status: "active"    },
  { id: "5", name: "Laura Gómez",    initials: "LG", lastActivity: "6h ago",  adherence: 65, status: "active"    },
];

const MOCK_AI_SUGGESTION = {
  count: 5,
  condition: "chronic lumbar pain",
  protocol: "Lumbar Advanced Protocol",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
  alert?: boolean;
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, trend, alert }: StatCardProps) {
  return (
    <Card className={cn(alert && "border-amber-200 bg-amber-50/30")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">{title}</p>
            <p className="mt-1.5 text-3xl font-bold text-surface-900">{value}</p>
            {trend && (
              <p className="mt-1 flex items-center gap-1 text-xs text-clinical-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const t = useTranslations("dashboard");

  const actions = [
    { label: t("new_routine"),   icon: Plus,       href: "/routines/new",  variant: "primary"   as const },
    { label: t("add_patient"),   icon: Users,      href: "/patients/new",  variant: "outline"   as const },
    { label: t("view_library"),  icon: BookOpen,   href: "/exercises",     variant: "secondary" as const },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{t("quick_actions")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="justify-start gap-3 h-10"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Recent Patients ──────────────────────────────────────────────────────────

function RecentPatients() {
  const t = useTranslations("dashboard");

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle>{t("recent_patients")}</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1 text-brand-600">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-surface-100">
          {MOCK_RECENT_PATIENTS.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-50 transition-colors cursor-pointer"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-semibold">
                  {patient.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-surface-800 truncate">
                    {patient.name}
                  </p>
                  {patient.status === "attention" && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-surface-400 mt-0.5">{patient.lastActivity}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 hidden sm:block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-surface-400">Adherence</span>
                    <span className={cn(
                      "text-xs font-medium",
                      patient.adherence >= 80 ? "text-clinical-600" :
                      patient.adherence >= 60 ? "text-amber-600" : "text-red-500"
                    )}>
                      {patient.adherence}%
                    </span>
                  </div>
                  <Progress
                    value={patient.adherence}
                    className="h-1.5"
                    indicatorClassName={cn(
                      patient.adherence >= 80 ? "bg-clinical-500" :
                      patient.adherence >= 60 ? "bg-amber-500" : "bg-red-500"
                    )}
                  />
                </div>
                <Button variant="outline" size="xs">
                  <ClipboardList className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── AI Suggestion Banner ─────────────────────────────────────────────────────

function AISuggestionBanner() {
  const t = useTranslations("dashboard");

  return (
    <Card className="border-brand-200 bg-gradient-to-r from-brand-50 to-clinical-50">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100">
          <Sparkles className="h-5 w-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-800">
            <span className="font-bold text-brand-700">{MOCK_AI_SUGGESTION.count} patients</span>
            {" "}with {MOCK_AI_SUGGESTION.condition} — see{" "}
            <span className="font-semibold text-brand-700">{MOCK_AI_SUGGESTION.protocol}</span>
          </p>
          <p className="text-xs text-surface-500 mt-0.5">AI Clinical Recommendation</p>
        </div>
        <Button variant="primary" size="sm" className="shrink-0">
          View <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={t("greeting", { timeOfDay: t("morning"), name: "García" })}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl space-y-6">

            {/* AI Suggestion */}
            <AISuggestionBanner />

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title={t("active_patients")}
                value={MOCK_STATS.activePatients}
                icon={Users}
                iconColor="text-brand-600"
                iconBg="bg-brand-100"
                trend="+3 this week"
              />
              <StatCard
                title={t("sent_routines")}
                value={MOCK_STATS.routinesSentToday}
                icon={ClipboardList}
                iconColor="text-clinical-600"
                iconBg="bg-clinical-100"
              />
              <StatCard
                title={t("low_adherence")}
                value={MOCK_STATS.lowAdherencePatients}
                icon={AlertTriangle}
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
                alert
              />
            </div>

            {/* Main content */}
            <div className="grid gap-4 lg:grid-cols-3">
              <RecentPatients />
              <QuickActions />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
