"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { AuthShell, AuthError, authBtn } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError(t("fillAll"));
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) return setError(/invalid/i.test(err.message) ? t("badCredentials") : t("genericError"));
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/") ? next : `/${locale}/dashboard`;
  }

  return (
    <AuthShell>
      <div>
        <h2 className="text-2xl font-bold text-surface-900">{t("loginTitle")}</h2>
        <p className="text-sm text-surface-500 mt-1">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/signup`} className="text-brand-600 font-semibold hover:text-brand-700">
            {t("signupFree")}
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-700">{t("email")}</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com" autoComplete="email" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">{t("password")}</label>
            <Link href={`/${locale}/forgot-password`} className="text-xs text-brand-600 hover:text-brand-700">
              {t("forgot")}
            </Link>
          </div>
          <div className="relative">
            <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" className="h-11 pe-10" />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label="show password"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <AuthError msg={error} />
        <button type="submit" disabled={loading} className={authBtn}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
          {loading ? t("loggingIn") : t("login")}
        </button>
      </form>
      <p className="text-center text-[11px] text-surface-400">{t("terms")}</p>
    </AuthShell>
  );
}
