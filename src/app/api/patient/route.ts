import { NextRequest, NextResponse } from "next/server";

// Public patient endpoint — accessed via token (no auth required)
// GET /api/patient?token=abc123

const PATIENT_TOKENS: Record<string, object> = {
  "demo-lumbar-abc123": {
    routine: {
      id: "r1",
      name: "Lumbar — Fase 1",
      therapistName: "Dr. Alejandro Herrera",
      clinicName: "PhysioCenter MX",
      estimatedMinutes: 25,
      frequency: "3 veces por semana",
      exercises: [
        { id: "cat-cow",        nameLocal: "Gato-Vaca",             sets: 2, reps: 10, restSeconds: 20, notes: "Respiración profunda y lenta" },
        { id: "bird-dog",       nameLocal: "Pájaro-Perro",          sets: 3, reps: 10, restSeconds: 30, notes: "" },
        { id: "dead-bug",       nameLocal: "Bicho Muerto",          sets: 3, reps: 8,  restSeconds: 45, notes: "" },
        { id: "glute-bridge",   nameLocal: "Puente de Glúteos",     sets: 3, reps: 12, restSeconds: 30, notes: "Sin molestia en la espalda baja" },
        { id: "mckenzie-press", nameLocal: "McKenzie Press-Up",     sets: 3, reps: 10, restSeconds: 30, notes: "Para si el dolor aumenta" },
      ],
    },
    patient: { name: "María", completedSessions: 7, totalSessions: 12 },
  },
  "demo-shoulder-def456": {
    routine: {
      id: "r2",
      name: "Hombro post-quirúrgico",
      therapistName: "Dr. Alejandro Herrera",
      clinicName: "PhysioCenter MX",
      estimatedMinutes: 35,
      frequency: "Diario",
      exercises: [
        { id: "band-row",       nameLocal: "Remo con Banda",        sets: 3, reps: 12, restSeconds: 30, notes: "Solo rango libre de dolor" },
        { id: "shoulder-press", nameLocal: "Press de Hombro",       sets: 3, reps: 10, restSeconds: 60, notes: "Solo hasta 90°" },
      ],
    },
    patient: { name: "Carlos", completedSessions: 9, totalSessions: 10 },
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const data = PATIENT_TOKENS[token];
  if (!data) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
