/**
 * CERTIFICATIONS MODULE
 * ─────────────────────────────────────────────────────────────
 * This module is BUILT but NOT VISIBLE to end users.
 *
 * To activate it:
 * 1. Open: src/lib/constants.ts
 * 2. Change: CERTIFICATIONS_ENABLED: false  →  CERTIFICATIONS_ENABLED: true
 * 3. The sidebar will automatically show the Certifications link.
 *
 * All pricing, tracks and UI are ready to launch.
 * ─────────────────────────────────────────────────────────────
 */

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Clock, Users, Star, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const CERTIFICATION_TRACKS = [
  {
    id:"1",
    title:"Visceral Osteopathy",
    subtitle:"3 levels · Foundation to Master",
    levels:["Level I — Foundation","Level II — Clinical","Level III — Advanced"],
    price: 299,
    duration:"40h",
    students: 1240,
    rating: 4.9,
    emoji:"🫀",
    color:"from-rose-500 to-pink-600",
    available: true,
  },
  {
    id:"2",
    title:"Functional Rehabilitation",
    subtitle:"Complete Track",
    levels:["Fundamentals","Advanced Protocols","Clinical Integration"],
    price: 249,
    duration:"35h",
    students: 876,
    rating: 4.8,
    emoji:"💪",
    color:"from-blue-500 to-brand-600",
    available: true,
  },
  {
    id:"3",
    title:"Applied Neurology",
    subtitle:"For therapists and osteopaths",
    levels:["Neuroanatomy Applied","Neurological Assessment","Treatment Protocols"],
    price: 349,
    duration:"45h",
    students: 632,
    rating: 4.9,
    emoji:"🧠",
    color:"from-purple-500 to-indigo-600",
    available: true,
  },
  {
    id:"4",
    title:"Advanced Manual Therapy",
    subtitle:"Evidence-based techniques",
    levels:["HVLA Techniques","Muscle Energy","Soft Tissue Mastery"],
    price: 199,
    duration:"30h",
    students: 1890,
    rating: 4.7,
    emoji:"🦴",
    color:"from-clinical-500 to-emerald-600",
    available: true,
  },
  {
    id:"5",
    title:"Cranial Osteopathy",
    subtitle:"Complete craniosacral track",
    levels:["Craniosacral Fundamentals","SBS & Membrane Techniques","Pediatric Application"],
    price: 399,
    duration:"50h",
    students: 445,
    rating: 5.0,
    emoji:"💡",
    color:"from-amber-500 to-orange-600",
    available: false,
    comingSoon: "Q2 2025",
  },
];

function CertificationCard({ track }: { track: typeof CERTIFICATION_TRACKS[0] }) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      track.available
        ? "hover:shadow-card-lg hover:-translate-y-1 cursor-pointer"
        : "opacity-60"
    )}>
      {/* Header gradient */}
      <div className={cn("h-28 bg-gradient-to-br flex items-center justify-center relative", track.color)}>
        <span className="text-5xl">{track.emoji}</span>
        {!track.available && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-semibold text-white">Coming {track.comingSoon}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-surface-900">{track.title}</h3>
          <span className="text-lg font-bold text-surface-900 shrink-0">€{track.price}</span>
        </div>
        <p className="text-xs text-surface-500 mb-3">{track.subtitle}</p>

        {/* Levels */}
        <div className="space-y-1.5 mb-4">
          {track.levels.map((level) => (
            <div key={level} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-clinical-500 shrink-0" />
              <span className="text-xs text-surface-600">{level}</span>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-surface-400 mb-4">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{track.duration}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{track.students.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{track.rating}</span>
        </div>

        {/* CTA */}
        {track.available ? (
          <Button variant="primary" className="w-full gap-2">
            Enroll Now <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Coming Soon
          </Button>
        )}

        {/* Credential note */}
        <p className="mt-2 text-center text-2xs text-surface-400">
          Verifiable digital credential · Renewable annually
        </p>
      </CardContent>
    </Card>
  );
}

export default function CertificationsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Professional Certifications" subtitle="International credentials for modern therapists" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl space-y-6">

            {/* Hero */}
            <Card className="border-brand-200 bg-gradient-to-r from-brand-50 to-clinical-50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
                  <Award className="h-7 w-7 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-surface-900">
                    Therapia Global Certifications
                  </h2>
                  <p className="text-sm text-surface-600 mt-1">
                    Internationally recognized credentials validated by clinical experts.
                    Verifiable on LinkedIn and through our public registry.
                  </p>
                </div>
                <div className="ms-auto hidden lg:flex items-center gap-6 shrink-0">
                  {[
                    { value:"5", label:"Tracks" },
                    { value:"1,200+", label:"Certified" },
                    { value:"40+", label:"Countries" },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-xl font-bold text-brand-700">{value}</p>
                      <p className="text-xs text-surface-500">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracks grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CERTIFICATION_TRACKS.map((track) => (
                <CertificationCard key={track.id} track={track} />
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
