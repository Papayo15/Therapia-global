"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { AuthShell, AuthError, AuthOk, authBtn } from "@/components/auth/AuthShell";

const SPECIALTIES = ["physio", "osteo", "chiro", "sports", "rehab", "ot", "other"] as const;

export default function SignupPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const tl = useTranslations("legal");
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialty: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError(t("fillAll"));
    if (form.password.length < 8) return setError(t("passwordShort"));
    if (!accepted) return setError(tl("accept_required"));
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim(), specialty: form.specialty, locale, privacy_accepted_at: new Date().toISOString() },
        emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
      },
    });
    setLoading(false);
    if (err) return setError(/already|registered|exists/i.test(err.message) ? t("emailInUse") : t("genericError"));
    if (data.session) {
      window.location.href = `/${locale}/dashboard`;
    } else {
      setOk(t("checkEmail"));
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthShell>
      <div>
        <h2 className="text-2xl font-bold text-surface-900">{t("signupTitle")}</h2>
        <p className="text-sm text-surface-500 mt-1">
          {t("haveAccount")}{" "}
          <Link href={`/${locale}/login`} className="text-brand-600 font-semibold hover:text-brand-700">
            {t("login")}
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-700">{t("name")} *</label>
          <Input value={form.name} onChange={set("name")} autoComplete="name" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-700">{t("email")} *</label>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="tu@email.com" autoComplete="email" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-700">{t("password")} *</label>
          <div className="relative">
            <Input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")}
              placeholder={t("passwordMin")} autoComplete="new-password" className="h-11 pe-10" />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label="show password"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-700">{t("specialty")}</label>
          <select value={form.specialty} onChange={set("specialty")}
            className="w-full h-11 rounded-xl border border-surface-200 bg-white px-3 text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">{t("selectSpecialty")}</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{t(`sp_${s}`)}</option>
            ))}
          </select>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-surface-600">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-300 accent-brand-600" />
          <span>
            {tl("accept_prefix")}{" "}
            <Link href={`/${locale}/privacy`} target="_blank" className="font-semibold text-brand-600 hover:text-brand-700">{tl("accept_link")}</Link>
          </span>
        </label>
        <AuthError msg={error} />
        <AuthOk msg={ok} />
        <button type="submit" disabled={loading || !!ok} className={authBtn}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
          {loading ? t("creating") : t("createAccount")}
        </button>
      </form>
    </AuthShell>
  );
}
