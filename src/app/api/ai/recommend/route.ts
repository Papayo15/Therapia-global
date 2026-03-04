import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClinicalInput {
  diagnosis: string;
  region: string;
  phase: "acute" | "subacute" | "chronic" | "maintenance";
  painLevel: number; // 0-10
  contraindications: string[];
  goals: string[];
  equipment: string[];
  age?: number;
  comorbidities?: string[];
}

interface RecommendedExercise {
  id: string;
  name: string;
  nameEs: string;
  rationale: string;
  sets: number;
  reps: number | null;
  restSeconds: number;
  progressionTip: string;
  redFlags: string[];
  evidenceLevel: "A" | "B" | "C";
  category: string;
}

interface AIResponse {
  routineName: string;
  clinicalReasoning: string;
  phaseDescription: string;
  precautions: string[];
  exercises: RecommendedExercise[];
  progressionTimeline: string;
  expectedOutcomes: string;
  referralCriteria: string;
  evidenceSummary: string;
  generatedAt: string;
  modelVersion: string;
}

// ─── Clinical knowledge base ──────────────────────────────────────────────────
const CLINICAL_PROTOCOLS: Record<string, Record<string, Partial<AIResponse>>> = {
  lumbar: {
    acute: {
      routineName: "Lumbar — Protocolo Agudo",
      clinicalReasoning: "En fase aguda de lumbalgia, el objetivo es reducir la inflamación y el espasmo muscular mediante ejercicios gentiles de movilidad y activación neuromuscular de baja carga. La evidencia (Cochrane 2021) muestra que la actividad temprana es superior al reposo.",
      phaseDescription: "Fase Aguda (0–2 semanas): actividad controlada, control del dolor, educación al paciente.",
      precautions: ["Evitar flexión lumbar repetida en carga", "Monitorear signos de bandera roja", "No superar EVA >6/10 durante ejercicio"],
      exercises: [
        { id: "cat-cow", name: "Cat-Cow", nameEs: "Gato-Vaca", rationale: "Movilización segmentaria suave que reduce el espasmo muscular y mejora la circulación local.", sets: 2, reps: 10, restSeconds: 20, progressionTip: "Aumentar a 3 sets en semana 2 si tolera bien.", redFlags: ["Irradiación nueva a pierna", "Pérdida de control vesical"], evidenceLevel: "B", category: "mobility" },
        { id: "knee-to-chest", name: "Knee to Chest", nameEs: "Rodilla al Pecho", rationale: "Flexión pasiva de cadera que descomprime las articulaciones facetarias y alivia el dolor.", sets: 2, reps: 0, restSeconds: 15, progressionTip: "Mantener 30s → 45s → 60s progresivamente.", redFlags: ["Aumento de irradiación"], evidenceLevel: "B", category: "mobility" },
        { id: "pelvic-tilt", name: "Pelvic Tilt", nameEs: "Retroversión Pélvica", rationale: "Activa el transverso del abdomen sin carga compresiva significativa. Clave para reconectar el control motor lumbar.", sets: 3, reps: 15, restSeconds: 20, progressionTip: "Progresar a Dead Bug en semana 2.", redFlags: [], evidenceLevel: "A", category: "activation" },
      ],
      progressionTimeline: "Semana 1-2: movilidad + activación. Semana 3-4: estabilización básica (Bird Dog, Dead Bug). Semana 5-8: fortalecimiento funcional.",
      expectedOutcomes: "Reducción del dolor en 40-60% en 2 semanas. Recuperación funcional completa en 6-8 semanas (80% de los casos).",
      referralCriteria: "Déficit neurológico progresivo, síndrome de cauda equina, dolor nocturno severo, pérdida de peso inexplicada, fiebre.",
      evidenceSummary: "Guideline europeo COST B13 (2006), Cochrane Review (2021): ejercicio terapéutico superior a reposo. McKenzie (2003): centralización como indicador pronóstico positivo.",
    },
    chronic: {
      routineName: "Lumbar — Protocolo Crónico",
      clinicalReasoning: "En lumbalgia crónica (>12 semanas), el modelo biopsicosocial guía la intervención. La estabilización espinal combinada con ejercicio aeróbico gradual muestra la mejor evidencia (NICE 2016). Objetivo: restaurar función, no eliminar dolor.",
      phaseDescription: "Fase Crónica: desensibilización del SNC, fortalecimiento progresivo, reintegración funcional.",
      precautions: ["Abordar catastrofismo si EVA subjetivo > medida objetiva", "Progresión gradual para evitar flare-up", "Incluir componente aeróbico suave"],
      exercises: [
        { id: "bird-dog", name: "Bird Dog", nameEs: "Pájaro-Perro", rationale: "Activa el multifidus contralateral y glúteo mayor. Evidencia nivel A para control motor lumbar.", sets: 3, reps: 10, restSeconds: 30, progressionTip: "Agregar peso en tobillo (0.5-1kg) en semana 4.", redFlags: [], evidenceLevel: "A", category: "stabilization" },
        { id: "dead-bug", name: "Dead Bug", nameEs: "Bicho Muerto", rationale: "Activa el transverso con disociación de extremidades. Superior al crunch para lumbalgia.", sets: 3, reps: 8, restSeconds: 45, progressionTip: "Progresar a brazos y piernas extendidos.", redFlags: [], evidenceLevel: "A", category: "stabilization" },
        { id: "glute-bridge", name: "Glute Bridge", nameEs: "Puente de Glúteos", rationale: "Fortalece la cadena posterior con mínima compresión discal. Esencial en síndrome cruzado inferior.", sets: 3, reps: 12, restSeconds: 30, progressionTip: "Progresar a puente unilateral (semana 3), a puente con pelota (semana 6).", redFlags: [], evidenceLevel: "A", category: "strengthening" },
        { id: "mckenzie-press", name: "McKenzie Press-Up", nameEs: "McKenzie Press-Up", rationale: "Centralización de síntomas discales. Protocolo McKenzie con mayor evidencia en lumbalgia con irradiación.", sets: 3, reps: 10, restSeconds: 30, progressionTip: "Solo si centraliza síntomas en evaluación.", redFlags: ["Aumento de irradiación periférica"], evidenceLevel: "A", category: "mobility" },
        { id: "plank", name: "Plank", nameEs: "Plancha", rationale: "Resistencia del core con co-contracción global. Progresar tiempo según tolerancia.", sets: 3, reps: null, restSeconds: 45, progressionTip: "Iniciar 20s → 30s → 45s → 60s semanalmente.", redFlags: [], evidenceLevel: "B", category: "stabilization" },
      ],
      progressionTimeline: "Semana 1-4: estabilización. Semana 5-8: fortalecimiento funcional. Semana 9-12: actividad específica (trabajo/deporte).",
      expectedOutcomes: "Reducción del dolor en 30-50%. Mejora funcional (ODI/Oswestry) en 20-30 puntos. Mayor relevancia: mejorar calidad de vida.",
      referralCriteria: "Sin mejoría en 12 semanas de rehabilitación activa, nuevo déficit neurológico, sospecha de patología sistémica.",
      evidenceSummary: "NICE CG88 (2016): ejercicio + TCC para lumbalgia crónica. Hayden et al. Cochrane (2021): ejercicio supervisado superior a no intervención.",
    },
  },
  shoulder: {
    subacute: {
      routineName: "Hombro — Fase Subaguda",
      clinicalReasoning: "En la fase subaguda del hombro (2-6 semanas), el objetivo es restaurar el ritmo escápulo-humeral y activar los rotadores externos. La evidencia apoya el ejercicio terapéutico sobre la cirugía en la mayoría de patologías del manguito.",
      phaseDescription: "Fase Subaguda (2–6 semanas): restaurar rango, activar manguito, control escapular.",
      precautions: ["Evitar arco doloroso 60-120°", "Proteger tendón si hay lesión parcial", "No forzar rango en dolor"],
      exercises: [
        { id: "band-row", name: "Band Row", nameEs: "Remo con Banda", rationale: "Activa romboides y trapecio medio para retracción escapular. Base del control escápulo-humeral.", sets: 3, reps: 12, restSeconds: 30, progressionTip: "Progresar a cable row en semana 4.", redFlags: [], evidenceLevel: "A", category: "scapular" },
        { id: "shldr-ext-rot", name: "Shoulder Ext. Rotation", nameEs: "Rotación Externa Hombro", rationale: "Infraespinoso + redondo menor. Déficit de RE es el principal factor en impingement. Evidencia nivel A.", sets: 3, reps: 15, restSeconds: 30, progressionTip: "Codo a 90°. Progresar posición neutra → 90° abducción.", redFlags: ["Dolor >6/10"], evidenceLevel: "A", category: "strengthening" },
        { id: "band-pull-apart", name: "Band Pull Apart", nameEs: "Separación de Banda", rationale: "Activa trapecio inferior y posterior deltoid. Esencial para restablcer ritmo escapular.", sets: 3, reps: 15, restSeconds: 20, progressionTip: "Variar altura de inicio para múltiples ángulos.", redFlags: [], evidenceLevel: "B", category: "scapular" },
      ],
      progressionTimeline: "Semana 1-2: activación + rango. Semana 3-4: fortalecimiento isotónico. Semana 5-8: funcional.",
      expectedOutcomes: "Retorno al rango completo en 6-8 semanas. Reducción del dolor en 50-70%.",
      referralCriteria: "Sin mejoría en 6 semanas, sospecha de ruptura completa, inestabilidad glenohumeral.",
      evidenceSummary: "Hanratty et al. (2012): ejercicio terapéutico para manguito. Tate et al.: ejercicios escapulares reducen impingement.",
    },
  },
  cervical: {
    chronic: {
      routineName: "Cervical — Estabilización Profunda",
      clinicalReasoning: "La cervicalgia crónica está asociada a déficit de los flexores cervicales profundos (FCP) y disfunción propioceptiva. El programa de Jull (2002) de activación de FCP es el de mayor evidencia.",
      phaseDescription: "Fase crónica: reconexión neuromuscular, postura, fortalecimiento profundo.",
      precautions: ["Evitar extensión cervical forzada", "Monitorear síntomas de arteria vertebral", "No aplicar tracción sin evaluación previa"],
      exercises: [
        { id: "cervical-ret", name: "Cervical Retraction", nameEs: "Retracción Cervical", rationale: "Activa los flexores cervicales profundos (recto anterior, largo del cuello). Corrección de postura anteproyectada.", sets: 3, reps: 10, restSeconds: 20, progressionTip: "Progresar a retracción con carga axial leve.", redFlags: ["Mareo", "Parestesias en brazos"], evidenceLevel: "A", category: "activation" },
        { id: "band-row", name: "Band Row", nameEs: "Remo con Banda", rationale: "Activa el trapecio medio-inferior reduciendo la carga sobre la región cervical.", sets: 3, reps: 12, restSeconds: 30, progressionTip: "Aumentar resistencia de banda progresivamente.", redFlags: [], evidenceLevel: "B", category: "scapular" },
      ],
      progressionTimeline: "Semana 1-4: FCP. Semana 5-8: fortalecimiento global. Semana 9-12: funcional laboral.",
      expectedOutcomes: "Reducción NDI en 20-30%. Mejora de la postura. Reducción cefaleas tensionales.",
      referralCriteria: "Mielopatía cervical, vértigo severo, déficit neurológico progresivo.",
      evidenceSummary: "Jull et al. (2002): entrenamiento FCP vs convencional. Gross et al. Cochrane: ejercicio para cervicalgia crónica.",
    },
  },
  knee: {
    subacute: {
      routineName: "Rodilla — Protocolo Funcional",
      clinicalReasoning: "La estabilización de rodilla requiere fortalecimiento del cuádriceps y la cadena posterior en cadena cinética cerrada (CCC). Evidencia clase A para ejercicios CCC en gonartrosis y post-lesión ligamentosa.",
      phaseDescription: "Fase subaguda: control del dolor, rango funcional, activación muscular.",
      precautions: ["Evitar flexión >90° en fase inicial post-quirúrgica", "Control de valgo de rodilla en sentadillas", "Monitorear efusión articular"],
      exercises: [
        { id: "wall-sit", name: "Wall Sit", nameEs: "Sentadilla en Pared", rationale: "Isométrico de cuádriceps en CCC. Seguro en fases tempranas. Activa VMO preferentemente.", sets: 3, reps: null, restSeconds: 45, progressionTip: "Iniciar 20s → 30s → 45s. Ajustar ángulo de rodilla.", redFlags: ["Dolor >6/10", "Derrame articular aumentado"], evidenceLevel: "A", category: "strengthening" },
        { id: "glute-bridge", name: "Glute Bridge", nameEs: "Puente de Glúteos", rationale: "Fortalece glúteo mayor reduciendo carga en rodilla. Esencial en síndrome femoropatelar.", sets: 3, reps: 12, restSeconds: 30, progressionTip: "Progresar a unilateral en semana 3.", redFlags: [], evidenceLevel: "A", category: "strengthening" },
        { id: "band-hip-abd", name: "Band Hip Abduction", nameEs: "Abducción Cadera Banda", rationale: "Glúteo medio activo reduce el valgo dinámico de rodilla. Clave en síndrome de cintilla y femoropatelar.", sets: 3, reps: 15, restSeconds: 30, progressionTip: "Progresar a caminata lateral con banda.", redFlags: [], evidenceLevel: "A", category: "strengthening" },
      ],
      progressionTimeline: "Semana 1-2: activación. Semana 3-4: fuerza básica. Semana 5-8: funcional.",
      expectedOutcomes: "Mejoría del dolor en 50-70%. KOOS mejoría en 20+ puntos en 8 semanas.",
      referralCriteria: "Bloqueo mecánico, inestabilidad aguda, sospecha de lesión ligamentosa completa.",
      evidenceSummary: "Fransen et al. Cochrane: ejercicio terapéutico para gonartrosis. Hewett et al.: biomecánica en ligamentos.",
    },
  },
};

// ─── AI recommendation engine ─────────────────────────────────────────────────
function generateRecommendation(input: ClinicalInput): AIResponse {
  const regionData = CLINICAL_PROTOCOLS[input.region];
  const phaseData = regionData?.[input.phase];

  // If we have specific protocol, use it; otherwise generate generic
  if (phaseData && phaseData.exercises) {
    let exercises = [...phaseData.exercises] as RecommendedExercise[];

    // Filter by available equipment
    if (input.equipment.length > 0 && !input.equipment.includes("all")) {
      exercises = exercises.filter((ex) => {
        // Simple mapping — in production would cross-reference exercise DB
        const bodyweight = ["bodyweight", "none"].some((e) => input.equipment.includes(e));
        const hasBands = input.equipment.some((e) => e.includes("band") || e.includes("liga"));
        const hasDumbbells = input.equipment.some((e) => e.includes("dumbbel") || e.includes("mancuerna"));
        if (ex.id.startsWith("band") && !hasBands) return false;
        if (["rdl", "shoulder-press", "bent-row"].includes(ex.id) && !hasDumbbells) return false;
        return true;
      });
    }

    // Adjust for pain level
    if (input.painLevel >= 7) {
      exercises = exercises
        .filter((ex) => ex.evidenceLevel === "A" || ex.category === "mobility")
        .slice(0, 3);
    }

    return {
      routineName: phaseData.routineName || `${input.region} — ${input.phase}`,
      clinicalReasoning: phaseData.clinicalReasoning || "Protocolo clínico basado en evidencia.",
      phaseDescription: phaseData.phaseDescription || "",
      precautions: [...(phaseData.precautions || []), ...input.contraindications.map((c) => `Precaución: ${c}`)],
      exercises,
      progressionTimeline: phaseData.progressionTimeline || "4-8 semanas de evolución esperada.",
      expectedOutcomes: phaseData.expectedOutcomes || "Mejora funcional según respuesta individual.",
      referralCriteria: phaseData.referralCriteria || "Sin mejoría en 6 semanas.",
      evidenceSummary: phaseData.evidenceSummary || "Basado en guías clínicas internacionales.",
      generatedAt: new Date().toISOString(),
      modelVersion: "TherapIA-v1.0",
    };
  }

  // Generic fallback
  return {
    routineName: `Protocolo ${input.region} — ${input.phase}`,
    clinicalReasoning: `Protocolo de rehabilitación para ${input.diagnosis}. Fase ${input.phase}. Enfoque en restauración funcional progresiva.`,
    phaseDescription: `Fase ${input.phase}: intervención personalizada según evaluación clínica.`,
    precautions: input.contraindications.map((c) => `Evitar: ${c}`),
    exercises: [
      { id: "bird-dog", name: "Bird Dog", nameEs: "Pájaro-Perro", rationale: "Estabilización espinal global. Seguro en la mayoría de condiciones.", sets: 3, reps: 10, restSeconds: 30, progressionTip: "Progresar carga distal.", redFlags: [], evidenceLevel: "A", category: "stabilization" },
      { id: "glute-bridge", name: "Glute Bridge", nameEs: "Puente de Glúteos", rationale: "Fortalecimiento de cadena posterior con baja carga compresiva.", sets: 3, reps: 12, restSeconds: 30, progressionTip: "Unilateral como progresión.", redFlags: [], evidenceLevel: "A", category: "strengthening" },
      { id: "cat-cow", name: "Cat-Cow", nameEs: "Gato-Vaca", rationale: "Movilización espinal segmentaria. Warm-up universal.", sets: 2, reps: 10, restSeconds: 20, progressionTip: "Coordinar con respiración.", redFlags: [], evidenceLevel: "B", category: "mobility" },
    ],
    progressionTimeline: "Reevaluación a las 4 semanas. Ajustar programa según respuesta.",
    expectedOutcomes: "Mejora funcional esperada en 4-8 semanas con adherencia adecuada.",
    referralCriteria: "Sin mejoría en 6 semanas, nuevos síntomas neurológicos.",
    evidenceSummary: "Basado en guías NICE, JOSPT y Cochrane Reviews.",
    generatedAt: new Date().toISOString(),
    modelVersion: "TherapIA-v1.0",
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json() as ClinicalInput;

  // Validate
  if (!body.diagnosis || !body.region || !body.phase) {
    return NextResponse.json(
      { error: "diagnosis, region, and phase are required" },
      { status: 400 }
    );
  }

  // Simulate AI processing delay (would be real API call in production)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const recommendation = generateRecommendation(body);

  return NextResponse.json({ data: recommendation });
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "operational",
    model: "TherapIA-v1.0",
    capabilities: ["exercise-prescription", "clinical-reasoning", "protocol-generation"],
    supportedRegions: Object.keys(CLINICAL_PROTOCOLS),
    supportedPhases: ["acute", "subacute", "chronic", "maintenance"],
  });
}
