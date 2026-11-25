"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { User, Shield, Globe2, Save, Check, LogOut, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { initials, signOut, useUser } from "@/lib/auth";
import { routing } from "@/i18n/routing";

type Tab = "profile" | "security" | "language";

const LANGUAGES: Record<string, string> = {
  es: "Español", en: "English", fr: "Français", pt: "Português", de: "Deutsch",
  zh: "中文", ja: "日本語", ru: "Русский", ar: "العربية", hi: "हिन्दी",
};
const SPECIALTIES = ["physio", "osteo", "chiro", "sports", "rehab", "ot", "other"] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-surface-600">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ onClick, state, label, savedLabel }: { onClick: () => void; state: "idle" | "saving" | "saved"; label: string; savedLabel: string }) {
  return (
    <button onClick={onClick} disabled={state === "saving"}
      className={cn("flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all",
        state === "saved" ? "bg-clinical-500" : "bg-brand-600 hover:bg-brand-500 disabled:opacity-60")}>
      {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {state === "saved" ? savedLabel : label}
    </button>
  );
}

function ProfileTab() {
  const t = useTranslations("st");
  const ta = useTranslations("auth");
  const user = useUser();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [p, setP] = useState({ full_name: "", specialty: "", phone: "", license: "", clinic: "", address: "" });

  useEffect(() => {
    if (!user) return;
    const m = user.user_metadata ?? {};
    setP({ full_name: m.full_name ?? "", specialty: m.specialty ?? "", phone: m.phone ?? "", license: m.license ?? "",
      clinic: m.clinic ?? "", address: m.address ?? "" });
  }, [user]);

  async function save() {
    setState("saving");
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ data: p });
    if (err) {
      setError(ta("genericError"));
      setState("idle");
      return;
    }
    setState("saved");
    setTimeout(() => setState("idle"), 2000);
  }

  const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setP((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-surface-900">{t("profile_title")}</h2>
          <p className="text-xs text-surface-400 mt-0.5">{t("profile_hint")}</p>
        </div>
        <SaveButton onClick={save} state={state} label={t("save")} savedLabel={t("saved")} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
          {initials(p.full_name || user?.email || "")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-surface-900">{p.full_name || "—"}</p>
          <p className="truncate text-xs text-surface-400">{user?.email}</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={ta("name")}><Input value={p.full_name} onChange={set("full_name")} /></Field>
        <Field label={ta("specialty")}>
          <select value={p.specialty} onChange={set("specialty")}
            className="w-full h-10 rounded-xl border border-surface-200 bg-white px-3 text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">{ta("selectSpecialty")}</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{ta(`sp_${s}`)}</option>)}
          </select>
        </Field>
        <Field label={t("phone")}><Input value={p.phone} onChange={set("phone")} dir="ltr" /></Field>
        <Field label={t("license")}><Input value={p.license} onChange={set("license")} /></Field>
        <Field label={t("clinic")}><Input value={p.clinic} onChange={set("clinic")} /></Field>
        <Field label={t("address")}><Input value={p.address} onChange={set("address")} /></Field>
      </div>
    </div>
  );
}

function SecurityTab() {
  const t = useTranslations("st");
  const ta = useTranslations("auth");
  const locale = useLocale();
  const [pw, setPw] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (pw.length < 8) return setError(ta("passwordShort"));
    setError(null);
    setState("saving");
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    if (err) {
      setError(ta("genericError"));
      setState("idle");
      return;
    }
    setPw("");
    setState("saved");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-surface-900">{t("security_title")}</h2>
        <p className="text-xs text-surface-400 mt-0.5">{t("security_hint")}</p>
      </div>
      <div className="max-w-sm space-y-3">
        <Field label={ta("newPassword")}>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={ta("passwordMin")} autoComplete="new-password" />
        </Field>
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <SaveButton onClick={save} state={state} label={ta("savePassword")} savedLabel={t("saved")} />
      </div>
      <div className="border-t border-surface-100 pt-6">
        <button onClick={() => signOut(locale)}
          className="flex items-center gap-2 rounded-xl border border-surface-200 px-4 h-9 text-sm font-medium text-surface-700 hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </div>
    </div>
  );
}

function LanguageTab() {
  const t = useTranslations("st");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-surface-900">{t("language_title")}</h2>
        <p className="text-xs text-surface-400 mt-0.5">{t("language_hint")}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 max-w-lg">
        {routing.locales.map((l) => (
          <a key={l} href={pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${l}`)}
            className={cn("flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm",
              l === locale ? "border-brand-400 bg-brand-50 font-semibold text-brand-700" : "border-surface-200 text-surface-700 hover:bg-surface-50")}>
            {LANGUAGES[l] ?? l}
            {l === locale && <Check className="h-4 w-4" />}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("st");
  const [tab, setTab] = useState<Tab>("profile");
  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: t("tab_profile"), icon: <User className="h-4 w-4" /> },
    { id: "security", label: t("tab_security"), icon: <Shield className="h-4 w-4" /> },
    { id: "language", label: t("tab_language"), icon: <Globe2 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={t("title")} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 sm:p-6 md:flex md:gap-6">
            <nav className="mb-4 flex gap-1 overflow-x-auto md:mb-0 md:w-52 md:shrink-0 md:flex-col">
              {TABS.map((x) => (
                <button key={x.id} onClick={() => setTab(x.id)}
                  className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    tab === x.id ? "bg-brand-50 text-brand-700" : "text-surface-600 hover:bg-white")}>
                  {x.icon} {x.label}
                </button>
              ))}
            </nav>
            <div className="flex-1 rounded-2xl border border-surface-200 bg-white p-5 sm:p-6">
              {tab === "profile" && <ProfileTab />}
              {tab === "security" && <SecurityTab />}
              {tab === "language" && <LanguageTab />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
