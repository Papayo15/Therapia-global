import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ─── Mock data store ──────────────────────────────────────────────────────────
// In production: replace with Prisma queries
const ROUTINES_DB = [
  {
    id: "r1",
    therapistId: "t1",
    name: "Lumbar — Fase 1",
    description: "Protocolo inicial para lumbalgia mecánica",
    patientId: "p1",
    patientName: "María López",
    exerciseCount: 5,
    totalSets: 15,
    estimatedMinutes: 25,
    exercises: [
      { exerciseId: "cat-cow",       sets: 2, reps: 10, restSeconds: 20, notes: "Respiración profunda" },
      { exerciseId: "bird-dog",      sets: 3, reps: 10, restSeconds: 30, notes: "" },
      { exerciseId: "dead-bug",      sets: 3, reps: 8,  restSeconds: 45, notes: "" },
      { exerciseId: "glute-bridge",  sets: 3, reps: 12, restSeconds: 30, notes: "Sin dolor en lumbar" },
      { exerciseId: "mckenzie-press",sets: 3, reps: 10, restSeconds: 30, notes: "Si aumenta dolor, suspender" },
    ],
    sentVia: "whatsapp",
    sentAt: "2026-02-28T10:00:00Z",
    accessToken: "demo-lumbar-abc123",
    completionRate: 78,
    isActive: true,
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-02-28T09:00:00Z",
  },
  {
    id: "r2",
    therapistId: "t1",
    name: "Hombro post-quirúrgico",
    description: "Semana 4-6 post artroscopia",
    patientId: "p2",
    patientName: "Carlos Ruiz",
    exerciseCount: 7,
    totalSets: 21,
    estimatedMinutes: 35,
    exercises: [
      { exerciseId: "band-row",       sets: 3, reps: 12, restSeconds: 30, notes: "Rango libre de dolor" },
      { exerciseId: "shoulder-press", sets: 3, reps: 10, restSeconds: 60, notes: "Solo a 90°" },
    ],
    sentVia: "email",
    sentAt: "2026-03-01T14:30:00Z",
    accessToken: "demo-shoulder-def456",
    completionRate: 90,
    isActive: true,
    createdAt: "2026-03-01T14:00:00Z",
    updatedAt: "2026-03-01T14:00:00Z",
  },
  {
    id: "r3",
    therapistId: "t1",
    name: "Rodilla — Protocolo ACL",
    description: "Fase 2 recuperación LCA",
    patientId: "p3",
    patientName: null,
    exerciseCount: 6,
    totalSets: 18,
    estimatedMinutes: 30,
    exercises: [],
    sentVia: null,
    sentAt: null,
    accessToken: "demo-knee-ghi789",
    completionRate: 0,
    isActive: true,
    createdAt: "2026-03-01T16:00:00Z",
    updatedAt: "2026-03-01T16:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const therapistId = searchParams.get("therapistId") || "t1";
  const patientId = searchParams.get("patientId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let data = ROUTINES_DB.filter((r) => r.therapistId === therapistId);
  if (patientId) data = data.filter((r) => r.patientId === patientId);

  const total = data.length;
  const paginated = data.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    data: paginated,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.exercises?.length) {
    return NextResponse.json(
      { error: "name and exercises are required" },
      { status: 400 }
    );
  }

  const routine = {
    id: randomUUID(),
    therapistId: body.therapistId || "t1",
    name: body.name,
    description: body.description || null,
    patientId: body.patientId || null,
    patientName: body.patientName || null,
    exercises: body.exercises,
    exerciseCount: body.exercises.length,
    totalSets: body.exercises.reduce((a: number, e: { sets?: number }) => a + (e.sets || 0), 0),
    estimatedMinutes: body.estimatedMinutes || 0,
    sentVia: null,
    sentAt: null,
    accessToken: randomUUID().split("-")[0] + randomUUID().split("-")[0],
    completionRate: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // In production: await prisma.routine.create({ data: routine })
  return NextResponse.json({ data: routine }, { status: 201 });
}
