import { NextRequest, NextResponse } from "next/server";

// ─── Mock data store (replace with Prisma in production) ──────────────────────
const EXERCISES_DB = [
  { id: "glute-bridge",    name: "Glute Bridge",            nameEs: "Puente de Glúteos",       region: "gluteal",   equipment: "bodyweight", difficulty: "beginner",     category: "strengthening", muscles: ["gluteus maximus", "hamstrings", "core"], duration: 30, sets: 3, reps: 12, restSeconds: 30, clinicalNotes: "Excellent for lumbar stabilization. Avoid hyperextension.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "bird-dog",        name: "Bird Dog",                nameEs: "Pájaro-Perro",             region: "lumbar",    equipment: "bodyweight", difficulty: "beginner",     category: "stabilization", muscles: ["multifidus", "gluteus maximus", "core"], duration: 30, sets: 3, reps: 10, restSeconds: 30, clinicalNotes: "Key for lumbar motor control. Ensure neutral spine.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "dead-bug",        name: "Dead Bug",                nameEs: "Bicho Muerto",             region: "core",      equipment: "bodyweight", difficulty: "intermediate", category: "stabilization", muscles: ["transversus abdominis", "rectus abdominis"], duration: 45, sets: 3, reps: 8, restSeconds: 45, clinicalNotes: "Maintain lumbar contact with floor throughout.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "plank",           name: "Plank",                   nameEs: "Plancha",                  region: "core",      equipment: "bodyweight", difficulty: "beginner",     category: "stabilization", muscles: ["transversus abdominis", "erector spinae", "deltoids"], duration: 30, sets: 3, reps: 0, restSeconds: 45, clinicalNotes: "Start with 20s holds. Progress duration weekly.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat-cow",         name: "Cat-Cow",                 nameEs: "Gato-Vaca",                region: "lumbar",    equipment: "bodyweight", difficulty: "beginner",     category: "mobility", muscles: ["erector spinae", "iliopsoas"], duration: 20, sets: 2, reps: 10, restSeconds: 20, clinicalNotes: "Ideal warm-up. Coordinate with breathing.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "rdl",             name: "Romanian Deadlift",       nameEs: "Peso Muerto Rumano",        region: "lumbar",    equipment: "dumbbells",  difficulty: "intermediate", category: "strengthening", muscles: ["hamstrings", "gluteus maximus", "erector spinae"], duration: 60, sets: 3, reps: 10, restSeconds: 60, clinicalNotes: "Hip hinge pattern. Keep bar close to body.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "shoulder-press",  name: "Shoulder Press",          nameEs: "Press de Hombro",           region: "shoulder",  equipment: "dumbbells",  difficulty: "intermediate", category: "strengthening", muscles: ["deltoids", "rotator cuff", "trapezius"], duration: 60, sets: 3, reps: 10, restSeconds: 60, clinicalNotes: "Monitor scapular upward rotation. Avoid impingement arc.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cervical-ret",    name: "Cervical Retraction",     nameEs: "Retracción Cervical",       region: "cervical",  equipment: "bodyweight", difficulty: "beginner",     category: "mobility", muscles: ["deep neck flexors", "suboccipitals"], duration: 20, sets: 3, reps: 10, restSeconds: 20, clinicalNotes: "Correct forward head posture. Perform hourly for office workers.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "mckenzie-press",  name: "McKenzie Press-Up",       nameEs: "McKenzie Press-Up",         region: "lumbar",    equipment: "bodyweight", difficulty: "beginner",     category: "mobility", muscles: ["erector spinae", "multifidus"], duration: 30, sets: 3, reps: 10, restSeconds: 30, clinicalNotes: "Centralizes disc symptoms. Contraindicated in spinal stenosis.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "band-row",        name: "Band Row",                nameEs: "Remo con Banda",             region: "shoulder",  equipment: "bands",      difficulty: "beginner",     category: "strengthening", muscles: ["rhomboids", "middle trapezius", "posterior deltoid"], duration: 30, sets: 3, reps: 12, restSeconds: 30, clinicalNotes: "Essential for scapular retraction. Focus on scapular movement.", videoUrl: null, thumbnailUrl: null, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const difficulty = searchParams.get("difficulty");
  const equipment = searchParams.get("equipment");
  const category = searchParams.get("category");
  const search = searchParams.get("q")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let data = [...EXERCISES_DB];

  if (region) data = data.filter((e) => e.region === region);
  if (difficulty) data = data.filter((e) => e.difficulty === difficulty);
  if (equipment) data = data.filter((e) => e.equipment === equipment);
  if (category) data = data.filter((e) => e.category === category);
  if (search) {
    data = data.filter(
      (e) =>
        e.name.toLowerCase().includes(search) ||
        e.nameEs.toLowerCase().includes(search) ||
        e.region.toLowerCase().includes(search) ||
        e.muscles.some((m) => m.toLowerCase().includes(search))
    );
  }

  const total = data.length;
  const offset = (page - 1) * limit;
  const paginated = data.slice(offset, offset + limit);

  return NextResponse.json({
    data: paginated,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (!body.name || !body.region || !body.difficulty) {
    return NextResponse.json(
      { error: "name, region, and difficulty are required" },
      { status: 400 }
    );
  }

  const exercise = {
    id: `custom-${Date.now()}`,
    ...body,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // In production: await prisma.exercise.create({ data: exercise })
  return NextResponse.json({ data: exercise }, { status: 201 });
}
