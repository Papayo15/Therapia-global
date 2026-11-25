"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

/** Marco común de las pantallas de cuenta (entrar, registrarse, recuperar contraseña). */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <Link href={`/${locale}`} className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-white text-lg font-bold">T</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Therapia</p>
            <p className="text-white/60 text-sm leading-none">Global</p>
          </div>
        </Link>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">{t("brandTitle")}</h1>
          <p className="text-white/70 text-lg max-w-md">{t("brandSubtitle")}</p>
          <div className="space-y-3">
            {(["proof1", "proof2", "proof3"] as const).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white/80 shrink-0" />
                <span className="text-white/80 text-sm">{t(k)}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/50 text-xs">{t("freeNote")}</p>
      </div>

      <div className="flex-1 flex flex-col bg-surface-50">
        <div className="flex justify-end p-4">
          <LanguageSwitcher compact />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm space-y-8">
            <Link href={`/${locale}`} className="flex lg:hidden items-center gap-2 justify-center">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <p className="font-bold text-surface-900">Therapia Global</p>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{msg}</p>;
}

export function AuthOk({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{msg}</p>;
}

export const authBtn =
  "w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-brand-600 hover:bg-brand-500 text-white shadow-lg disabled:bg-brand-400 disabled:cursor-not-allowed";
