import { NextRequest, NextResponse } from "next/server";
import { supabase, PlanExercise } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { therapist_id, patient, exercises, meta } = body as {
      therapist_id: string;
      patient: { id?: string; name: string; phone: string };
      exercises: PlanExercise[];
      meta: {
        diagnosis: string;
        phase: string;
        frequency_per_week: number;
        duration_weeks: number;
      };
    };

    if (!exercises?.length) {
      return NextResponse.json({ error: "No exercises provided" }, { status: 400 });
    }

    const plan_json = { meta, exercises };

    const { data, error } = await supabase
      .from("routine_plans")
      .insert({
        therapist_id: therapist_id || "demo-therapist",
        patient_id: patient.id ?? null,
        patient_name: patient.name,
        patient_phone: patient.phone,
        diagnosis: meta.diagnosis,
        plan_json,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // Fallback: return a mock ID so UI still works in dev
      const mockId = `demo-${Date.now()}`;
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      return NextResponse.json({
        plan_id: mockId,
        share_url: `${baseUrl}/p/${mockId}`,
        warning: "Supabase not configured — demo mode",
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const share_url = `${baseUrl}/p/${data.id}`;

    return NextResponse.json({ plan_id: data.id, share_url });
  } catch (err) {
    console.error("Send routine error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
