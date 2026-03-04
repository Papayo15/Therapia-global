"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  User, Bell, Shield, CreditCard, Globe2, Palette,
  Save, Check, ChevronRight, LogOut, Trash2, ExternalLink,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "profile" | "notifications" | "security" | "billing" | "appearance";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Perfil",          icon: <User className="h-4 w-4" /> },
  { id: "notifications", label: "Notificaciones",  icon: <Bell className="h-4 w-4" /> },
  { id: "security",      label: "Seguridad",        icon: <Shield className="h-4 w-4" /> },
  { id: "billing",       label: "Plan y facturación",icon: <CreditCard className="h-4 w-4" /> },
  { id: "appearance",    label: "Apariencia",       icon: <Palette className="h-4 w-4" /> },
];

const LANGUAGES = [
  { code: "es", label: "Español" }, { code: "en", label: "English" },
  { code: "fr", label: "Français" }, { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" }, { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" }, { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" }, { code: "hi", label: "हिन्दी" },
];

// ─── Saved feedback ───────────────────────────────────────────────────────────
function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold transition-all",
        saved
          ? "bg-clinical-500 text-white"
          : "bg-brand-600 hover:bg-brand-500 text-white"
      )}>
      {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {saved ? "Guardado" : "Guardar cambios"}
    </button>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Dr. Alejandro Herrera",
    email: "alejandro@physiocenter.mx",
    phone: "+52 55 1234 5678",
    specialty: "Fisioterapia",
    licenseNumber: "COFEPRIS-12345",
    clinicName: "PhysioCenter MX",
    clinicAddress: "Av. Insurgentes Sur 1234, CDMX",
    bio: "Especialista en fisioterapia deportiva y rehabilitación neurológica. 15 años de experiencia.",
    locale: "es",
  });

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-surface-900">Perfil profesional</h2>
          <p className="text-xs text-surface-400 mt-0.5">Visible en los reportes enviados a pacientes</p>
        </div>
        <SaveButton onClick={save} saved={saved} />
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-white">AH</span>
        </div>
        <div>
          <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Cambiar foto
          </button>
          <p className="text-xs text-surface-400 mt-0.5">JPG, PNG. Máx 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Nombre completo", key: "name" as const, placeholder: "Dr. Juan García" },
          { label: "Email", key: "email" as const, placeholder: "tu@email.com", type: "email" },
          { label: "Teléfono", key: "phone" as const, placeholder: "+52 55 ..." },
          { label: "Especialidad", key: "specialty" as const, placeholder: "Fisioterapia" },
          { label: "Número de cédula / licencia", key: "licenseNumber" as const, placeholder: "COFEPRIS-..." },
          { label: "Nombre del consultorio", key: "clinicName" as const, placeholder: "Mi Consultorio" },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-surface-600">{label}</label>
            <Input value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder} type={type || "text"} className="h-9 text-sm" />
          </div>
        ))}
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-surface-600">Dirección del consultorio</label>
          <Input value={profile.clinicAddress} onChange={(e) => setProfile((p) => ({ ...p, clinicAddress: e.target.value }))}
            placeholder="Calle, número, ciudad" className="h-9 text-sm" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-surface-600">Biografía profesional</label>
          <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={3} placeholder="Describe tu especialidad y experiencia..."
            className="w-full text-sm border border-input rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-surface-600">Idioma de la interfaz</label>
          <select value={profile.locale} onChange={(e) => setProfile((p) => ({ ...p, locale: e.target.value }))}
            className="w-full h-9 rounded-lg border border-input bg-background text-sm px-3 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    emailSessions: true,
    emailWeekly: true,
    emailMarketing: false,
    pushNew: true,
    pushCompleted: true,
    pushReminders: false,
  });

  type PrefKey = keyof typeof prefs;

  const groups = [
    {
      title: "Email",
      items: [
        { key: "emailSessions" as PrefKey, label: "Sesiones completadas por pacientes", desc: "Recibe un email cuando un paciente complete una sesión" },
        { key: "emailWeekly" as PrefKey,   label: "Reporte semanal de adherencia",       desc: "Resumen de actividad de todos tus pacientes" },
        { key: "emailMarketing" as PrefKey,label: "Novedades y ofertas",                  desc: "Nuevas funciones, webinars, descuentos" },
      ],
    },
    {
      title: "Push / In-app",
      items: [
        { key: "pushNew" as PrefKey,       label: "Nuevas sesiones iniciadas",    desc: "" },
        { key: "pushCompleted" as PrefKey, label: "Sesiones completadas",          desc: "" },
        { key: "pushReminders" as PrefKey, label: "Recordatorios de inactividad", desc: "Pacientes sin actividad +7 días" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-surface-900">Notificaciones</h2>
          <p className="text-xs text-surface-400 mt-0.5">Controla qué notificaciones recibes</p>
        </div>
        <SaveButton onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} saved={saved} />
      </div>

      {groups.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">{group.title}</p>
          {group.items.map((item) => (
            <div key={item.key}
              className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-xl hover:border-surface-300 transition-colors">
              <div>
                <p className="text-sm font-medium text-surface-800">{item.label}</p>
                {item.desc && <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>}
              </div>
              <button onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                className={cn(
                  "relative w-10 h-5.5 rounded-full transition-all shrink-0",
                  prefs[item.key] ? "bg-brand-600" : "bg-surface-200"
                )}>
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  prefs[item.key] ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-surface-900">Seguridad</h2>
        <p className="text-xs text-surface-400 mt-0.5">Controla el acceso a tu cuenta</p>
      </div>

      {/* Change password */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-bold text-surface-800">Cambiar contraseña</p>
        {[
          { label: "Contraseña actual",    key: "current"  as const },
          { label: "Nueva contraseña",     key: "new"      as const },
          { label: "Confirmar contraseña", key: "confirm"  as const },
        ].map(({ label, key }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-surface-600">{label}</label>
            <Input type="password" value={pw[key]} onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
              placeholder="••••••••" className="h-9 text-sm" />
          </div>
        ))}
        <SaveButton onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); setPw({ current: "", new: "", confirm: "" }); }} saved={saved} />
      </div>

      {/* 2FA */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-surface-800">Autenticación de dos factores</p>
          <p className="text-xs text-surface-400 mt-0.5">Añade una capa extra de seguridad a tu cuenta</p>
        </div>
        <button className="px-4 h-9 border border-brand-600 text-brand-600 rounded-xl text-sm font-semibold hover:bg-brand-50 transition-colors">
          Activar 2FA
        </button>
      </div>

      {/* Sessions */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-bold text-surface-800">Sesiones activas</p>
        {[
          { device: "MacBook Pro — Safari", location: "Ciudad de México", current: true },
          { device: "iPhone 15 — App",      location: "Ciudad de México", current: false },
        ].map((s) => (
          <div key={s.device} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
            <div>
              <p className="text-sm text-surface-800">{s.device}</p>
              <p className="text-xs text-surface-400">{s.location} {s.current && "· Sesión actual"}</p>
            </div>
            {!s.current && (
              <button className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Cerrar</button>
            )}
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-bold text-red-800">Zona de peligro</p>
        <button className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium transition-colors">
          <Trash2 className="h-4 w-4" />
          Eliminar cuenta permanentemente
        </button>
      </div>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────
function BillingTab() {
  const locale = useLocale();

  const PLAN_FEATURES = {
    free: { name: "Gratuito", price: "$0/mes", color: "bg-surface-100 text-surface-700" },
    professional: { name: "Profesional", price: "$49/mes", color: "bg-brand-50 text-brand-700" },
    clinic: { name: "Clínica", price: "$199/mes", color: "bg-clinical-50 text-clinical-700" },
  };

  const current = PLAN_FEATURES.professional;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-surface-900">Plan y facturación</h2>
        <p className="text-xs text-surface-400 mt-0.5">Gestiona tu suscripción</p>
      </div>

      {/* Current plan */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold", current.color)}>{current.name}</span>
          <div>
            <p className="text-sm font-semibold text-surface-900">{current.price}</p>
            <p className="text-xs text-surface-400">Próxima factura: 1 de abril, 2026</p>
          </div>
        </div>
        <button className="px-4 h-9 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors">
          Cambiar plan
        </button>
      </div>

      {/* Usage */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-bold text-surface-800">Uso este mes</p>
        {[
          { label: "Pacientes activos",    value: 12, max: null,  unit: "pacientes" },
          { label: "Rutinas creadas",      value: 38, max: null,  unit: "rutinas" },
          { label: "Sesiones IA",          value: 24, max: 100,   unit: "consultas" },
        ].map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-600">{item.label}</span>
              <span className="text-xs font-semibold text-surface-900">
                {item.value}{item.max ? `/${item.max}` : ""} {item.unit}
              </span>
            </div>
            {item.max && (
              <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(item.value / item.max) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-7 bg-surface-800 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm text-surface-800">•••• •••• •••• 4242</p>
            <p className="text-xs text-surface-400">Vence 12/2027</p>
          </div>
        </div>
        <button className="text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors">Actualizar</button>
      </div>

      {/* Invoice history */}
      <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-bold text-surface-800">Historial de facturas</p>
        {[
          { date: "1 Mar 2026", amount: "$49.00", status: "Pagado" },
          { date: "1 Feb 2026", amount: "$49.00", status: "Pagado" },
          { date: "1 Ene 2026", amount: "$49.00", status: "Pagado" },
        ].map((inv) => (
          <div key={inv.date} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-surface-400 w-20">{inv.date}</span>
              <span className="text-sm text-surface-800 font-medium">{inv.amount}</span>
              <span className="text-[10px] text-clinical-700 bg-clinical-50 px-2 py-0.5 rounded-full font-medium">{inv.status}</span>
            </div>
            <button className="p-1 text-surface-400 hover:text-surface-600 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [density, setDensity] = useState<"compact" | "normal" | "comfortable">("normal");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-surface-900">Apariencia</h2>
          <p className="text-xs text-surface-400 mt-0.5">Personaliza la interfaz</p>
        </div>
        <SaveButton onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} saved={saved} />
      </div>

      <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-surface-800">Tema</p>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)}
                className={cn(
                  "py-3 rounded-xl border text-sm font-medium transition-all capitalize",
                  theme === t
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-200 text-surface-600 hover:border-surface-300"
                )}>
                {t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Sistema"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-surface-800">Densidad</p>
          <div className="grid grid-cols-3 gap-2">
            {(["compact", "normal", "comfortable"] as const).map((d) => (
              <button key={d} onClick={() => setDensity(d)}
                className={cn(
                  "py-3 rounded-xl border text-sm font-medium transition-all",
                  density === d
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-200 text-surface-600 hover:border-surface-300"
                )}>
                {d === "compact" ? "Compacta" : d === "normal" ? "Normal" : "Cómoda"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-surface-100">
          <div>
            <p className="text-sm font-medium text-surface-800">Animaciones reducidas</p>
            <p className="text-xs text-surface-400">Para accesibilidad</p>
          </div>
          <button className="relative w-10 h-5 rounded-full bg-surface-200 transition-all">
            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const CONTENT: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    billing: <BillingTab />,
    appearance: <AppearanceTab />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Configuración" />

        <div className="flex flex-1 overflow-hidden">
          {/* Tab list */}
          <div className="w-56 shrink-0 bg-white border-e border-surface-200 p-3 space-y-0.5">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-start",
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                )}>
                <span className={cn("shrink-0", activeTab === tab.id ? "text-brand-500" : "text-surface-400")}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="ms-auto h-3.5 w-3.5 shrink-0 text-brand-400" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              {CONTENT[activeTab]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
