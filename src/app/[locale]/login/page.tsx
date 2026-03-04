"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SOCIAL_PROOF = [
  "50,000+ terapeutas activos",
  "10 idiomas soportados",
  "Motor IA clínico incluido",
];

export default function LoginPage() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setError(null);
    setLoading(true);
    // Simulate auth — replace with real NextAuth/Clerk call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    window.location.href = `/${locale}/dashboard`;
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (branding) ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-white text-lg font-bold">T</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Therapia</p>
            <p className="text-white/60 text-sm leading-none">Global</p>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            La plataforma terapéutica<br />
            <span className="text-white/70">#1 del mundo</span>
          </h1>
          <p className="text-white/70 text-lg max-w-sm">
            Gestiona pacientes, crea rutinas con IA y eleva tu práctica clínica.
          </p>
          <div className="space-y-3">
            {SOCIAL_PROOF.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white/80 shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative bg-white/10 backdrop-blur rounded-2xl p-5">
          <p className="text-white/90 text-sm italic leading-relaxed">
            "Therapia Global transformó completamente mi consulta. El Motor IA me ahorra 2 horas diarias en prescripciones."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">MR</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Dr. Miguel Rodríguez</p>
              <p className="text-white/60 text-xs">Fisioterapeuta, Madrid</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <p className="font-bold text-surface-900">Therapia Global</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-surface-900">Bienvenido de vuelta</h2>
            <p className="text-sm text-surface-500 mt-1">
              ¿Sin cuenta?{" "}
              <Link href={`/${locale}/signup`} className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Email profesional</label>
              <Input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-surface-700">Contraseña</label>
                <Link href={`/${locale}/forgot-password`} className="text-xs text-brand-600 hover:text-brand-700 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className={cn(
                "w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                loading
                  ? "bg-brand-400 text-white cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-500/30"
              )}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-surface-400">o continúa con</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          {/* SSO placeholders */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Google", icon: "G" },
              { label: "Microsoft", icon: "M" },
            ].map((sso) => (
              <button key={sso.label}
                className="flex items-center justify-center gap-2 h-11 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 hover:border-surface-300 transition-all">
                <span className="w-5 h-5 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold">
                  {sso.icon}
                </span>
                {sso.label}
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] text-surface-400">
            Al iniciar sesión aceptas los{" "}
            <a href="#" className="underline hover:text-surface-600">Términos de uso</a>
            {" "}y la{" "}
            <a href="#" className="underline hover:text-surface-600">Política de privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
