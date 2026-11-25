"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { AuthShell, AuthError, AuthOk, authBtn } from "@/components/auth/AuthShell";

// Destino del enlace del correo de recuperación: Supabase abre aquí con una sesión temporal de recuperación.
export default function ResetPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === "PASSWORD_RECOVERY" || s) setReady(true);
    });
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setReady((r) => r ?? !!data.session);
    }, 1500);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError(t("passwordShort"));
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(t("genericError"));
    setOk(t("passwordSaved"));
    setTimeout(() => (window.location.href = `/${locale}/dashboard`), 1200);
  }

  return (
    <AuthShell>
      <h2 className="text-2xl font-bold text-surface-900">{t("resetTitle")}</h2>
      {ready === false ? (
        <div className="space-y-4">
          <AuthError msg={t("resetInvalid")} />
          <Link href={`/${locale}/forgot-password`} className="text-sm text-brand-600 font-semibold">{t("sendLink")}</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700">{t("newPassword")}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordMin")} autoComplete="new-password" className="h-11" />
          </div>
          <AuthError msg={error} />
          <AuthOk msg={ok} />
          <button type="submit" disabled={loading || !ready || !!ok} className={authBtn}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {t("savePassword")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
