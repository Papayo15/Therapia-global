"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Illustration */}
        <div className="relative mx-auto w-32 h-32">
          <div className="w-32 h-32 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <span className="text-6xl font-black text-brand-200 leading-none select-none">404</span>
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
            <Search className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-surface-900">Página no encontrada</h1>
          <p className="text-surface-500 text-sm max-w-xs mx-auto leading-relaxed">
            La página que buscas no existe o fue movida. No te preocupes — tu historial clínico sigue intacto.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}/dashboard`}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-brand-500/30">
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </Link>
          <button onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-surface-200 hover:border-surface-300 text-surface-700 hover:bg-white rounded-xl text-sm font-medium transition-all">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </div>

        {/* Quick nav */}
        <div className="pt-2">
          <p className="text-xs text-surface-400 mb-3">Accesos rápidos</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Ejercicios",  href: "/exercises" },
              { label: "Rutinas",     href: "/routines" },
              { label: "Pacientes",   href: "/patients" },
              { label: "Motor IA",    href: "/ai" },
            ].map((item) => (
              <Link key={item.href} href={`/${locale}${item.href}`}
                className="px-3 py-1.5 bg-white border border-surface-200 rounded-full text-xs text-surface-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-all">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-xs text-surface-400">Therapia Global</span>
        </div>
      </div>
    </div>
  );
}
