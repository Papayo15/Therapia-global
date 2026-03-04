import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ─── Mock data store ──────────────────────────────────────────────────────────
const PATIENTS_DB = [
  {
    id: "p1",
    therapistId: "t1",
    name: "María López",
    email: "maria.lopez@email.com",
    phone: "+52 55 1234 5678",
    birthDate: "1985-06-15",
    age: 40,
    gender: "female",
    occupation: "Oficinista",
    primaryDiagnosis: "Lumbalgia mecánica L4-L5",
    secondaryDiagnoses: ["Síndrome cruzado inferior"],
    painLevel: 5,
    functionalGoals: ["Volver a correr 5km", "Trabajar sin dolor"],
    notes: "Hipermóvil. Evitar exercises de end range.",
    activeSince: "2026-01-15",
    lastVisit: "2026-03-01",
    routineCount: 3,
    completionRate: 78,
    status: "active",
    avatar: null,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-01T14:00:00Z",
  },
  {
    id: "p2",
    therapistId: "t1",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    phone: "+52 55 2345 6789",
    birthDate: "1978-11-30",
    age: 47,
    gender: "male",
    occupation: "Constructor",
    primaryDiagnosis: "Post-artroscopia hombro derecho",
    secondaryDiagnoses: ["Tendinopatía manguito rotador"],
    painLevel: 3,
    functionalGoals: ["Regresar al trabajo", "Levantar por encima de cabeza"],
    notes: "Cirugía 2026-01-20. Protocolo fase 2.",
    activeSince: "2026-01-25",
    lastVisit: "2026-03-02",
    routineCount: 2,
    completionRate: 90,
    status: "active",
    avatar: null,
    createdAt: "2026-01-25T10:00:00Z",
    updatedAt: "2026-03-02T16:00:00Z",
  },
  {
    id: "p3",
    therapistId: "t1",
    name: "Ana Torres",
    email: "ana.torres@email.com",
    phone: "+52 55 3456 7890",
    birthDate: "1995-03-22",
    age: 30,
    gender: "female",
    occupation: "Deportista / Maestra",
    primaryDiagnosis: "Ruptura LCA rodilla izquierda",
    secondaryDiagnoses: ["Menisco medial grado 2"],
    painLevel: 2,
    functionalGoals: ["Regresar al deporte competitivo", "Correr en 6 meses"],
    notes: "Cirugía 2025-12-10. Muy motivada. Avance rápido.",
    activeSince: "2026-01-05",
    lastVisit: "2026-03-03",
    routineCount: 4,
    completionRate: 95,
    status: "active",
    avatar: null,
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-03-03T11:00:00Z",
  },
  {
    id: "p4",
    therapistId: "t1",
    name: "Roberto Mendoza",
    email: "roberto.mendoza@email.com",
    phone: "+52 55 4567 8901",
    birthDate: "1962-08-14",
    age: 63,
    gender: "male",
    occupation: "Jubilado",
    primaryDiagnosis: "Artrosis cervical C5-C6",
    secondaryDiagnoses: ["Síndrome cruzado superior", "Cefalea tensional"],
    painLevel: 6,
    functionalGoals: ["Reducir dolor de cabeza", "Mejorar postura"],
    notes: "Tensión alta. Monitorear PA. Ejercicios suaves.",
    activeSince: "2026-02-01",
    lastVisit: "2026-02-28",
    routineCount: 1,
    completionRate: 60,
    status: "active",
    avatar: null,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-28T14:00:00Z",
  },
  {
    id: "p5",
    therapistId: "t1",
    name: "Laura Sánchez",
    email: "laura.sanchez@email.com",
    phone: "+52 55 5678 9012",
    birthDate: "1990-12-05",
    age: 35,
    gender: "female",
    occupation: "Corredora amateur",
    primaryDiagnosis: "Síndrome de cintilla iliotibial",
    secondaryDiagnoses: [],
    painLevel: 4,
    functionalGoals: ["Completar maratón en mayo"],
    notes: "Caída del pie izquierdo. Fortalecer abductores.",
    activeSince: "2026-02-10",
    lastVisit: "2026-03-01",
    routineCount: 2,
    completionRate: 85,
    status: "active",
    avatar: null,
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const therapistId = searchParams.get("therapistId") || "t1";
  const status = searchParams.get("status");
  const search = searchParams.get("q")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let data = PATIENTS_DB.filter((p) => p.therapistId === therapistId);
  if (status) data = data.filter((p) => p.status === status);
  if (search) {
    data = data.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.primaryDiagnosis.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search)
    );
  }

  const total = data.length;
  const paginated = data.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    data: paginated,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.primaryDiagnosis) {
    return NextResponse.json(
      { error: "name and primaryDiagnosis are required" },
      { status: 400 }
    );
  }

  const patient = {
    id: randomUUID(),
    therapistId: body.therapistId || "t1",
    ...body,
    routineCount: 0,
    completionRate: 0,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // In production: await prisma.patient.create({ data: patient })
  return NextResponse.json({ data: patient }, { status: 201 });
}
