"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { AuthShell, AuthError, AuthOk, authBtn } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return setError(t("fillAll"));
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });
    setLoading(false);
    if (err && !/not found/i.test(err.message)) return setError(t("genericError"));
    setOk(t("linkSent"));
  }

  return (
    <AuthShell>
      <div>
        <h2 className="text-2xl font-bold text-surface-900">{t("forgotTitle")}</h2>
        <p className="text-sm text-surface-500 mt-1">{t("forgotText")}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-700">{t("email")}</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" className="h-11" />
        </div>
        <AuthError msg={error} />
        <AuthOk msg={ok} />
        <button type="submit" disabled={loading || !!ok} className={authBtn}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {loading ? t("sending") : t("sendLink")}
        </button>
      </form>
      <p className="text-center text-sm">
        <Link href={`/${locale}/login`} className="text-brand-600 font-semibold hover:text-brand-700">{t("backToLogin")}</Link>
      </p>
    </AuthShell>
  );
}
