"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "0",
    features: ["Hasta 10 pacientes", "5 rutinas/mes", "Biblioteca de ejercicios"],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    id: "professional",
    name: "Profesional",
    price: "49",
    features: ["Pacientes ilimitados", "Rutinas ilimitadas", "Motor IA clínico", "Analytics avanzado"],
    cta: "Prueba 14 días gratis",
    highlight: true,
  },
];

export default function SignupPage() {
  const locale = useLocale();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [form, setForm] = useState({ name: "", email: "", password: "", specialty: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SPECIALTIES = [
    "Fisioterapia", "Osteopatía", "Quiropraxia",
    "Medicina del Deporte", "Rehabilitación", "Terapia Ocupacional", "Otra",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    window.location.href = `/${locale}/dashboard`;
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 flex-col justify-between p-12 relative overflow-hidden">
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

        {/* Plan selector on left */}
        <div className="relative space-y-4">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">Elige tu plan</p>
          <div className="space-y-3">
            {PLANS.map((plan) => (
              <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all",
                  selectedPlan === plan.id
                    ? "bg-white/20 border-white/40 backdrop-blur"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{plan.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-lg">${plan.price}</span>
                    <span className="text-white/60 text-xs">/mes</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-white/70 shrink-0" />
                      <span className="text-white/70 text-xs">{f}</span>
                    </div>
                  ))}
                </div>
                {plan.highlight && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                      MÁS POPULAR
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="relative text-white/50 text-xs">
          Sin tarjeta de crédito para el plan gratuito. Cancela cuando quieras.
        </p>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-sm space-y-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <p className="font-bold text-surface-900">Therapia Global</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-surface-900">Crea tu cuenta</h2>
            <p className="text-sm text-surface-500 mt-1">
              ¿Ya tienes cuenta?{" "}
              <Link href={`/${locale}/login`} className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Nombre completo *</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Dr. Juan García" className="h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Email profesional *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com" className="h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Contraseña *</label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres" className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[4, 6, 8, 10].map((n) => (
                    <div key={n} className={cn(
                      "h-1 flex-1 rounded-full transition-all",
                      form.password.length >= n ? "bg-clinical-500" : "bg-surface-200"
                    )} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Especialidad</label>
              <select value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                className="w-full h-11 rounded-lg border border-input bg-background text-sm px-3 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">Selecciona tu especialidad</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Mobile plan selector */}
            <div className="lg:hidden space-y-2">
              <label className="text-sm font-medium text-surface-700">Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map((plan) => (
                  <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-start transition-all",
                      selectedPlan === plan.id
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-surface-200 text-surface-600"
                    )}>
                    <p className="text-xs font-bold">{plan.name}</p>
                    <p className="text-[10px] opacity-70">${plan.price}/mes</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={cn(
                "w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                loading
                  ? "bg-brand-400 text-white cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-500/30"
              )}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading
                ? "Creando cuenta..."
                : selectedPlan === "free" ? "Crear cuenta gratis" : "Iniciar prueba gratuita"
              }
            </button>
          </form>

          <p className="text-center text-[11px] text-surface-400">
            Al registrarte aceptas los{" "}
            <a href="#" className="underline hover:text-surface-600">Términos de uso</a>
            {" "}y la{" "}
            <a href="#" className="underline hover:text-surface-600">Política de privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
