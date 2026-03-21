"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Canal B (Osteopatía) has been merged into the Exercises page under Canal B tab.
export default function OsteopathyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/exercises?canal=B");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-400 text-sm">Redirigiendo a Canal B — Osteopatía...</p>
    </div>
  );
}
