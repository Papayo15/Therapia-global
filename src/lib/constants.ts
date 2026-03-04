// ─── Feature Flags ────────────────────────────────────────────────────────────
// Change these to enable/disable modules without touching routes or components

export const FEATURES = {
  CERTIFICATIONS_ENABLED: false,   // ← Activar cuando sea el momento (Parte futura)
  AI_RECOMMENDATIONS_ENABLED: true,
  COMMUNITY_ENABLED: true,
  ANATOMY_3D_ENABLED: false,       // ← Requiere Three.js — fase posterior
  WHATSAPP_ENABLED: true,
  EMAIL_ENABLED: true,
} as const;

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_CONFIG = {
  name: "Therapia Global",
  tagline: "The global therapeutic standard",
  url: "https://therapia.global",
  supportEmail: "support@therapia.global",
  version: "0.1.0",
} as const;

// ─── Plans ────────────────────────────────────────────────────────────────────

export const PLANS = {
  FREE: {
    id: "free",
    maxPatients: 10,
    maxMonthlyRoutines: 5,
    hasAI: false,
    hasAnalytics: false,
    hasWhiteLabel: false,
  },
  PROFESSIONAL: {
    id: "professional",
    priceMonthly: 49,
    maxPatients: Infinity,
    maxMonthlyRoutines: Infinity,
    hasAI: true,
    hasAnalytics: true,
    hasWhiteLabel: false,
  },
  CLINIC: {
    id: "clinic",
    priceMonthly: 199,
    maxPatients: Infinity,
    maxMonthlyRoutines: Infinity,
    hasAI: true,
    hasAnalytics: true,
    hasWhiteLabel: false,
    maxTherapists: 20,
  },
  ENTERPRISE: {
    id: "enterprise",
    priceMonthly: null, // custom
    maxPatients: Infinity,
    maxMonthlyRoutines: Infinity,
    hasAI: true,
    hasAnalytics: true,
    hasWhiteLabel: true,
    maxTherapists: Infinity,
  },
} as const;

// ─── Body Regions ─────────────────────────────────────────────────────────────

export const BODY_REGIONS = [
  "shoulder",
  "elbow",
  "wrist",
  "cervical",
  "thoracic",
  "lumbar",
  "hip",
  "knee",
  "ankle",
  "tmj",
  "visceral",
  "global",
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

// ─── Difficulty Levels ────────────────────────────────────────────────────────

export const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

// ─── Osteopathy Categories ────────────────────────────────────────────────────

export const OSTEOPATHY_CATEGORIES = ["visceral", "cranial", "structural"] as const;
export type OsteopathyCategory = (typeof OSTEOPATHY_CATEGORIES)[number];

// ─── Delivery Channels ────────────────────────────────────────────────────────

export const DELIVERY_CHANNELS = ["email", "whatsapp", "qr", "sms"] as const;
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { key: "dashboard",    icon: "LayoutDashboard", href: "/dashboard",      alwaysVisible: true },
  { key: "exercises",    icon: "Dumbbell",        href: "/exercises",      alwaysVisible: true },
  { key: "routines",     icon: "ClipboardList",   href: "/routines",       alwaysVisible: true },
  { key: "patients",     icon: "Users",           href: "/patients",       alwaysVisible: true },
  { key: "osteopathy",   icon: "Bone",            href: "/osteopathy",     alwaysVisible: true },
  { key: "anatomy",      icon: "Scan",            href: "/anatomy",        alwaysVisible: true },
  { key: "community",    icon: "Globe2",          href: "/community",      alwaysVisible: true },
  { key: "ai",           icon: "Brain",           href: "/ai",             alwaysVisible: true },
  {
    key: "certifications",
    icon: "Award",
    href: "/certifications",
    alwaysVisible: false,
    featureFlag: "CERTIFICATIONS_ENABLED" as keyof typeof FEATURES,
  },
] as const;

// ─── Stats for Landing ────────────────────────────────────────────────────────

export const PLATFORM_STATS = {
  therapists: "50K+",
  exercises: "3,000+",
  languages: "10",
  countries: "80+",
} as const;
