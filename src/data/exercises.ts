/**
 * EXERCISE DATABASE
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual classification:
 *   equipment: ball | band | dumbbell | bodyweight | bosu | kettlebell | none
 *   zone:      shoulder | hip | knee | ankle | lumbar | cervical | thoracic |
 *              elbow | wrist | core | global | visceral | tmj
 *
 * animationKey maps to EXERCISE_ANIMATIONS registry.
 * Translations keys map to messages/*.json → exercises.data
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Equipment =
  | "ball" | "band" | "dumbbell" | "barbell"
  | "bodyweight" | "bosu" | "kettlebell"
  | "foam-roller" | "medicine-ball" | "none";

export type BodyZone =
  | "shoulder" | "hip" | "knee" | "ankle" | "lumbar"
  | "cervical" | "thoracic" | "elbow" | "wrist" | "hand"
  | "core" | "global" | "visceral" | "tmj" | "foot";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface ExerciseEntry {
  id: string;
  animationKey: string;
  equipment: Equipment[];
  zones: BodyZone[];
  difficulty: Difficulty;
  defaultSets: number;
  defaultReps?: number;
  defaultSeconds?: number;
  youtubeSearch?: string;
  muscles: string[];
  pathologies: string[];
  /** Translations per locale */
  translations: Record<string, {
    title: string;
    description: string;
    execution: string;       // How to perform it step by step
    indications: string;
    contraindications: string;
    clinicalTip: string;
  }>;
}

export const EXERCISES: ExerciseEntry[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 🦾 SHOULDER
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "shoulder-external-rotation",
    animationKey: "shoulder-external-rotation",
    equipment: ["band", "dumbbell"],
    zones: ["shoulder"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Infraspinatus", "Teres minor", "Posterior deltoid"],
    pathologies: ["Rotator cuff syndrome", "Shoulder impingement", "Post-surgical shoulder"],
    translations: {
      en: {
        title: "Shoulder External Rotation",
        description: "Strengthens the posterior rotator cuff to correct glenohumeral imbalances.",
        execution: "1. Stand with elbow at 90° and pinned to your side.\n2. Hold resistance band or dumbbell.\n3. Slowly rotate forearm outward, keeping elbow against body.\n4. Return to start with control.\n5. Avoid shrugging the shoulder.",
        indications: "Rotator cuff weakness, shoulder impingement, postural correction.",
        contraindications: "Acute shoulder inflammation, recent rotator cuff repair (< 6 weeks).",
        clinicalTip: "Keep the elbow glued to the torso. If the patient shrugs, reduce load."
      },
      es: {
        title: "Rotación Externa de Hombro",
        description: "Fortalece el manguito rotador posterior para corregir desequilibrios glenohumerales.",
        execution: "1. Sitúate de pie con codo a 90° pegado al costado.\n2. Sujeta la banda elástica o mancuerna.\n3. Rota el antebrazo hacia afuera manteniendo el codo junto al cuerpo.\n4. Regresa al inicio con control.\n5. Evita elevar el hombro.",
        indications: "Debilidad del manguito rotador, síndrome de impingement, corrección postural.",
        contraindications: "Inflamación aguda del hombro, reparación reciente de manguito (< 6 semanas).",
        clinicalTip: "Mantén el codo pegado al tronco. Si el paciente eleva el hombro, reduce la carga."
      }
    }
  },

  {
    id: "dumbbell-lateral-raise",
    animationKey: "dumbbell-lateral-raise",
    equipment: ["dumbbell"],
    zones: ["shoulder"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 12,
    muscles: ["Middle deltoid", "Supraspinatus", "Trapezius upper"],
    pathologies: ["Shoulder weakness", "Deltoid atrophy"],
    translations: {
      en: {
        title: "Dumbbell Lateral Raise",
        description: "Targets the middle deltoid for shoulder width and strength.",
        execution: "1. Stand with dumbbells at your sides, slight bend in elbows.\n2. Raise arms to shoulder height in a wide arc.\n3. Hold 1 second at the top.\n4. Lower slowly (3 seconds).\n5. Thumbs slightly down to protect the supraspinatus.",
        indications: "Deltoid weakness, shoulder rehabilitation, postural correction.",
        contraindications: "Subacromial impingement (use pain-free range only).",
        clinicalTip: "Slight internal rotation of the wrist (thumbs down) reduces subacromial contact."
      },
      es: {
        title: "Elevación Lateral con Mancuernas",
        description: "Trabaja el deltoides medio para fortalecer el ancho del hombro.",
        execution: "1. De pie con mancuernas a los lados, ligera flexión de codos.\n2. Eleva los brazos hasta la altura del hombro en arco amplio.\n3. Mantén 1 segundo en la cima.\n4. Baja lentamente (3 segundos).\n5. Pulgares ligeramente hacia abajo para proteger el supraespinoso.",
        indications: "Debilidad del deltoides, rehabilitación de hombro, corrección postural.",
        contraindications: "Impingement subacromial (usar solo rango libre de dolor).",
        clinicalTip: "La ligera rotación interna de la muñeca reduce el contacto subacromial."
      }
    }
  },

  {
    id: "band-pull-apart",
    animationKey: "band-pull-apart",
    equipment: ["band"],
    zones: ["shoulder", "thoracic"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 20,
    muscles: ["Rhomboids", "Middle trapezius", "Posterior deltoid"],
    pathologies: ["Kyphosis", "Forward head posture", "Scapular dyskinesis"],
    translations: {
      en: {
        title: "Band Pull Apart",
        description: "Activates scapular retractors to correct postural kyphosis and forward shoulder.",
        execution: "1. Hold band with both hands, arms extended forward at shoulder height.\n2. Pull band apart horizontally, squeezing shoulder blades together.\n3. Hold retraction for 2 seconds.\n4. Return slowly.\n5. Keep neck relaxed — no chin forward.",
        indications: "Postural kyphosis, forward shoulder, scapular instability.",
        contraindications: "Acute posterior shoulder pain.",
        clinicalTip: "Cue 'squeeze an orange between your shoulder blades' for better scapular retraction."
      },
      es: {
        title: "Separación de Banda Elástica",
        description: "Activa los retractores escapulares para corregir cifosis postural y hombro adelantado.",
        execution: "1. Sujeta la banda con ambas manos, brazos extendidos al frente a la altura del hombro.\n2. Separa la banda horizontalmente apretando los omóplatos.\n3. Mantén la retracción 2 segundos.\n4. Regresa lentamente.\n5. Cuello relajado, sin adelantar el mentón.",
        indications: "Cifosis postural, hombro adelantado, inestabilidad escapular.",
        contraindications: "Dolor agudo posterior de hombro.",
        clinicalTip: "Indicación: 'Aprieta una naranja entre los omóplatos' para mejor retracción escapular."
      }
    }
  },

  {
    id: "shoulder-press",
    animationKey: "shoulder-press",
    equipment: ["dumbbell"],
    zones: ["shoulder"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 10,
    muscles: ["Anterior deltoid", "Medial deltoid", "Triceps", "Upper trapezius"],
    pathologies: ["Shoulder strength deficit", "Post-immobilization rehabilitation"],
    translations: {
      en: {
        title: "Shoulder Press",
        description: "Compound press targeting anterior and medial deltoid with triceps stabilization.",
        execution: "1. Stand or sit, dumbbells at shoulder height, palms forward.\n2. Press upward until elbows nearly extended.\n3. Avoid locking the elbows completely.\n4. Lower with control over 3 seconds.\n5. Core braced throughout.",
        indications: "Shoulder strength training, post-rehabilitation strengthening.",
        contraindications: "Subacromial impingement above 90°, cervical instability.",
        clinicalTip: "For patients with impingement, start with a neutral grip (palms facing each other)."
      },
      es: {
        title: "Press de Hombros",
        description: "Press compuesto que trabaja deltoides anterior y medial con estabilización del tríceps.",
        execution: "1. De pie o sentado, mancuernas a la altura del hombro, palmas al frente.\n2. Empuja hacia arriba hasta casi extender los codos.\n3. Evita bloquear los codos completamente.\n4. Baja con control en 3 segundos.\n5. Core activado durante todo el movimiento.",
        indications: "Entrenamiento de fuerza de hombro, fortalecimiento posrehabilitación.",
        contraindications: "Impingement subacromial por encima de 90°, inestabilidad cervical.",
        clinicalTip: "Para pacientes con impingement, iniciar con agarre neutro (palmas enfrentadas)."
      }
    }
  },

  {
    id: "band-shoulder-rotation",
    animationKey: "band-shoulder-rotation",
    equipment: ["band"],
    zones: ["shoulder"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Infraspinatus", "Subscapularis", "Teres minor"],
    pathologies: ["Internal rotation contracture", "Shoulder capsule tightness"],
    translations: {
      en: {
        title: "Seated Band Shoulder Rotation",
        description: "Isolated rotator cuff strengthening with controlled scapular position.",
        execution: "1. Sit upright, elbow at 90° close to waist.\n2. Hold band attached to fixed point at elbow height.\n3. Rotate forearm outward (external rotation).\n4. Return slowly resisting the band.\n5. Keep scapula neutral — no elevation.",
        indications: "Rotator cuff dysfunction, shoulder instability, capsular tightness.",
        contraindications: "Post-operative (< 8 weeks), acute biceps tendinopathy.",
        clinicalTip: "Perform in pain-free range only. Full ROM is not the goal initially."
      },
      es: {
        title: "Rotación de Hombro con Banda (Sentado)",
        description: "Fortalecimiento aislado del manguito rotador con posición escapular controlada.",
        execution: "1. Siéntate erguido, codo a 90° cerca de la cintura.\n2. Sujeta la banda fijada a punto fijo a la altura del codo.\n3. Rota el antebrazo hacia afuera (rotación externa).\n4. Regresa lentamente resistiendo la banda.\n5. Escápula neutra, sin elevación.",
        indications: "Disfunción del manguito rotador, inestabilidad, contractura capsular.",
        contraindications: "Posoperatorio (< 8 semanas), tendinopatía bicipital aguda.",
        clinicalTip: "Ejecutar solo en rango libre de dolor. El ROM completo no es el objetivo inicial."
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🦴 LUMBAR / CORE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "bird-dog",
    animationKey: "bird-dog",
    equipment: ["bodyweight"],
    zones: ["lumbar", "core"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 10,
    muscles: ["Multifidus", "Erector spinae", "Gluteus maximus", "Contralateral arm muscles"],
    pathologies: ["Chronic low back pain", "Lumbar instability", "Spondylolisthesis"],
    translations: {
      en: {
        title: "Bird Dog",
        description: "Fundamental lumbar stabilization exercise activating the multifidus and deep core.",
        execution: "1. Start on hands and knees, neutral spine.\n2. Simultaneously extend opposite arm and leg.\n3. Hold position for 3–5 seconds without rotating the pelvis.\n4. Return to start and switch sides.\n5. Do not allow the lower back to arch or rotate.",
        indications: "Lumbar instability, chronic low back pain, post-discal herniation.",
        contraindications: "Acute lumbar pain, knee pathology on the support side.",
        clinicalTip: "Place a water bottle on the lower back to provide proprioceptive feedback on pelvic rotation."
      },
      es: {
        title: "Bird Dog",
        description: "Ejercicio fundamental de estabilización lumbar que activa el multífido y el core profundo.",
        execution: "1. En posición de cuadrupedia, columna neutra.\n2. Extiende simultáneamente el brazo y la pierna opuestos.\n3. Mantén 3-5 segundos sin rotar la pelvis.\n4. Vuelve al inicio y alterna lados.\n5. No permitas que la zona lumbar se arquee o rote.",
        indications: "Inestabilidad lumbar, lumbalgia crónica, post-hernia discal.",
        contraindications: "Dolor lumbar agudo, patología de rodilla en el lado de apoyo.",
        clinicalTip: "Coloca una botella de agua en la espalda baja para feedback propioceptivo sobre rotación pélvica."
      }
    }
  },

  {
    id: "dead-bug",
    animationKey: "dead-bug",
    equipment: ["bodyweight"],
    zones: ["core", "lumbar"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 8,
    muscles: ["Transversus abdominis", "Diaphragm", "Pelvic floor", "Multifidus"],
    pathologies: ["Core motor control deficit", "Pelvic floor dysfunction", "Postpartum rehabilitation"],
    translations: {
      en: {
        title: "Dead Bug",
        description: "Trains deep core motor control and spinal-pelvic dissociation.",
        execution: "1. Lie on back, arms pointing to ceiling, hips and knees at 90°.\n2. Exhale and engage core (draw navel toward spine).\n3. Slowly lower opposite arm and leg toward floor.\n4. Keep lower back pressed into floor throughout.\n5. Return and alternate.",
        indications: "Core motor control dysfunction, lumbar instability, post-partum.",
        contraindications: "Acute disc herniation with radiculopathy.",
        clinicalTip: "The lumbar spine must not lift from the floor — if it does, reduce range of motion."
      },
      es: {
        title: "Dead Bug",
        description: "Entrena el control motor del core profundo y la disociación espinopélvica.",
        execution: "1. Tumbado boca arriba, brazos apuntando al techo, caderas y rodillas a 90°.\n2. Exhala y activa el core (ombligo hacia la columna).\n3. Baja lentamente el brazo y la pierna opuestos hacia el suelo.\n4. Mantén la zona lumbar pegada al suelo durante todo el movimiento.\n5. Regresa y alterna.",
        indications: "Disfunción del control motor del core, inestabilidad lumbar, posparto.",
        contraindications: "Hernia discal aguda con radiculopatía.",
        clinicalTip: "La columna lumbar no debe despegarse del suelo — si lo hace, reducir el rango de movimiento."
      }
    }
  },

  {
    id: "plank",
    animationKey: "plank",
    equipment: ["bodyweight"],
    zones: ["core"],
    difficulty: "beginner",
    defaultSets: 3, defaultSeconds: 30,
    muscles: ["Transversus abdominis", "Rectus abdominis", "Gluteus maximus", "Scapular stabilizers"],
    pathologies: ["Core weakness", "Non-specific low back pain"],
    translations: {
      en: {
        title: "Plank",
        description: "Full-body isometric core exercise building endurance of the deep stabilizers.",
        execution: "1. Forearm or hands on floor, body in straight line.\n2. Brace core — do not hold breath.\n3. Squeeze glutes, keep neck neutral.\n4. Hold for the prescribed time.\n5. Stop if lower back sinks or hips rise.",
        indications: "Core endurance, non-specific low back pain, general conditioning.",
        contraindications: "Wrist pain (use forearm variant), late pregnancy.",
        clinicalTip: "Start with forearm plank. Progress to hands when tolerated."
      },
      es: {
        title: "Plancha",
        description: "Ejercicio isométrico de cuerpo completo que construye resistencia de los estabilizadores profundos.",
        execution: "1. Antebrazos o manos en el suelo, cuerpo en línea recta.\n2. Activa el core — no contengas la respiración.\n3. Aprieta los glúteos, cuello neutro.\n4. Mantén el tiempo indicado.\n5. Para si la zona lumbar se hunde o las caderas suben.",
        indications: "Resistencia del core, dolor lumbar inespecífico, acondicionamiento general.",
        contraindications: "Dolor de muñeca (usar variante de antebrazos), embarazo avanzado.",
        clinicalTip: "Comenzar con plancha en antebrazos. Progresar a manos cuando sea tolerable."
      }
    }
  },

  {
    id: "foam-roller-thoracic",
    animationKey: "foam-roller-thoracic",
    equipment: ["foam-roller"],
    zones: ["thoracic"],
    difficulty: "beginner",
    defaultSets: 2, defaultSeconds: 45,
    muscles: ["Erector spinae (thoracic)", "Rhomboids", "Thoracic facet joints"],
    pathologies: ["Thoracic kyphosis", "Thoracic stiffness", "Shoulder impingement secondary"],
    translations: {
      en: {
        title: "Thoracic Extension on Foam Roller",
        description: "Mobilizes thoracic spine into extension to counteract desk posture kyphosis.",
        execution: "1. Place foam roller perpendicular to spine at mid-back.\n2. Support head with hands, knees bent.\n3. Slowly extend over the roller, opening the thoracic cage.\n4. Breathe deeply in the extended position.\n5. Move roller 2–3 cm up and down the thoracic spine.",
        indications: "Thoracic kyphosis, limited shoulder flexion secondary to stiff thoracic spine, desk posture.",
        contraindications: "Osteoporosis (caution), acute thoracic pain, rib fracture.",
        clinicalTip: "Keep arms crossed on chest for mid-thoracic segments. Arms behind head for upper thoracic."
      },
      es: {
        title: "Extensión Torácica en Rodillo",
        description: "Moviliza la columna torácica en extensión para contrarrestar la cifosis postural de escritorio.",
        execution: "1. Coloca el rodillo perpendicular a la columna a la altura de la zona media de la espalda.\n2. Sujeta la cabeza con las manos, rodillas flexionadas.\n3. Extiéndete lentamente sobre el rodillo abriendo la caja torácica.\n4. Respira profundamente en la posición de extensión.\n5. Mueve el rodillo 2-3 cm hacia arriba y abajo de la columna torácica.",
        indications: "Cifosis torácica, limitación de flexión de hombro secundaria a rigidez torácica, postura de escritorio.",
        contraindications: "Osteoporosis (precaución), dolor torácico agudo, fractura de costilla.",
        clinicalTip: "Brazos cruzados en el pecho para segmentos torácicos medios. Brazos detrás de la cabeza para zona torácica alta."
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🦵 HIP
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "hip-flexor-stretch",
    animationKey: "hip-flexor-stretch",
    equipment: ["bodyweight"],
    zones: ["hip"],
    difficulty: "beginner",
    defaultSets: 2, defaultSeconds: 45,
    muscles: ["Iliopsoas", "Rectus femoris", "Sartorius"],
    pathologies: ["Hip flexor tightness", "Anterior pelvic tilt", "Lumbar hyperlordosis"],
    translations: {
      en: {
        title: "Hip Flexor Stretch (Kneeling Lunge)",
        description: "Lengthens the iliopsoas and rectus femoris to restore hip extension mobility.",
        execution: "1. Kneel on one knee, other foot forward in lunge position.\n2. Shift hips forward until you feel the stretch in the front of the rear hip.\n3. Keep torso upright, core engaged.\n4. For deeper stretch, raise arm of the stretching side overhead.\n5. Breathe and hold.",
        indications: "Hip flexor tightness, anterior pelvic tilt, lumbar hyperlordosis, post-sitting.",
        contraindications: "Knee pain on the kneeling side, hip flexor tendon injury.",
        clinicalTip: "A posterior pelvic tilt during the stretch increases iliopsoas tension and improves effectiveness."
      },
      es: {
        title: "Estiramiento de Flexores de Cadera (Estocada Arrodillada)",
        description: "Alarga el iliopsoas y el recto femoral para restaurar la movilidad de extensión de cadera.",
        execution: "1. Arrodillate en una rodilla, el otro pie adelante en posición de estocada.\n2. Desplaza las caderas hacia adelante hasta sentir el estiramiento en la parte delantera de la cadera trasera.\n3. Mantén el torso erguido, core activado.\n4. Para un estiramiento más profundo, eleva el brazo del lado que estiras por encima de la cabeza.\n5. Respira y mantén.",
        indications: "Acortamiento de flexores de cadera, anteversión pélvica, hiperlordosis lumbar, sedentarismo.",
        contraindications: "Dolor de rodilla en el lado arrodillado, lesión tendinosa de flexores de cadera.",
        clinicalTip: "Una retroversión pélvica durante el estiramiento aumenta la tensión del iliopsoas y mejora la efectividad."
      }
    }
  },

  {
    id: "band-hip-abduction",
    animationKey: "band-hip-abduction",
    equipment: ["band"],
    zones: ["hip"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Gluteus medius", "Gluteus minimus", "Tensor fasciae latae"],
    pathologies: ["Lateral hip weakness", "Knee valgus", "IT band syndrome", "Hip OA"],
    translations: {
      en: {
        title: "Band Hip Abduction",
        description: "Strengthens the gluteus medius — the key muscle for frontal plane pelvic stability.",
        execution: "1. Stand with band looped around ankles.\n2. Shift weight to one leg (soft knee).\n3. Slowly abduct the free leg outward 30–45°.\n4. Hold 2 seconds. Return with control.\n5. Do not allow trunk to laterally flex.",
        indications: "Gluteus medius weakness, knee valgus, IT band syndrome, hip OA, patellofemoral pain.",
        contraindications: "Acute hip bursitis, post total hip replacement (check clearance angle).",
        clinicalTip: "Palpate the gluteus medius (just below the iliac crest) to confirm it is activating, not the TFL."
      },
      es: {
        title: "Abducción de Cadera con Banda",
        description: "Fortalece el glúteo medio — músculo clave para la estabilidad pélvica en el plano frontal.",
        execution: "1. De pie con la banda alrededor de los tobillos.\n2. Desplaza el peso a una pierna (rodilla suave).\n3. Abduce lentamente la pierna libre hacia afuera 30-45°.\n4. Mantén 2 segundos. Regresa con control.\n5. No permitas que el tronco se flexione lateralmente.",
        indications: "Debilidad del glúteo medio, valgo de rodilla, síndrome de la banda IT, artrosis de cadera, dolor patelofemoral.",
        contraindications: "Bursitis aguda de cadera, post-artroplastia total de cadera (verificar ángulo de tolerancia).",
        clinicalTip: "Palpa el glúteo medio (bajo la cresta ilíaca) para confirmar que activa, no el TFL."
      }
    }
  },

  {
    id: "glute-bridge",
    animationKey: "glute-bridge",
    equipment: ["bodyweight"],
    zones: ["hip", "lumbar"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Gluteus maximus", "Hamstrings", "Erector spinae", "Core"],
    pathologies: ["Gluteal inhibition", "Low back pain", "Hip extension deficit"],
    translations: {
      en: {
        title: "Glute Bridge",
        description: "Activates the gluteus maximus and posterior chain with lumbar stabilization.",
        execution: "1. Lie on back, knees bent 90°, feet flat on floor hip-width.\n2. Press through heels and drive hips toward ceiling.\n3. Squeeze glutes at the top — hold 2 seconds.\n4. Lower slowly, do not fully rest between reps.\n5. Keep ribs down — no hyperextension.",
        indications: "Gluteal inhibition, low back pain, hip extension deficit, post-partum.",
        contraindications: "Acute lumbar disc pathology with pain on extension.",
        clinicalTip: "Place the band above the knees to add hip external rotation and increase glute medius activation."
      },
      es: {
        title: "Puente de Glúteos",
        description: "Activa el glúteo mayor y la cadena posterior con estabilización lumbar.",
        execution: "1. Tumbado boca arriba, rodillas a 90°, pies planos en el suelo al ancho de caderas.\n2. Presiona los talones y eleva la cadera hacia el techo.\n3. Aprieta los glúteos en la cima — mantén 2 segundos.\n4. Baja lentamente, no descanses completamente entre repeticiones.\n5. Costillas hacia abajo — sin hiperextensión.",
        indications: "Inhibición glútea, dolor lumbar, déficit de extensión de cadera, posparto.",
        contraindications: "Patología discal lumbar aguda con dolor en extensión.",
        clinicalTip: "Coloca la banda por encima de las rodillas para añadir rotación externa de cadera y aumentar la activación del glúteo medio."
      }
    }
  },

  {
    id: "romanian-deadlift",
    animationKey: "romanian-deadlift",
    equipment: ["dumbbell"],
    zones: ["hip", "lumbar"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 10,
    muscles: ["Hamstrings", "Gluteus maximus", "Erector spinae", "Core"],
    pathologies: ["Hamstring weakness", "Hip hinge dysfunction", "Lower back strength deficit"],
    translations: {
      en: {
        title: "Romanian Deadlift",
        description: "Hip hinge pattern strengthening the posterior chain — hamstrings and glutes.",
        execution: "1. Stand with dumbbells in front of thighs.\n2. Hinge at the hip (not the waist) — push hips backward.\n3. Lower dumbbells along the legs until hamstrings tension.\n4. Keep back flat, slight knee bend throughout.\n5. Drive hips forward to return to standing.",
        indications: "Hamstring weakness, hip hinge dysfunction, hip and lumbar stabilization.",
        contraindications: "Acute lumbar disc herniation, inability to maintain neutral spine.",
        clinicalTip: "Place two fingers on the lumbar spine during assessment — the patient should maintain neutral, not flex into kyphosis."
      },
      es: {
        title: "Peso Muerto Rumano",
        description: "Fortalece la cadena posterior (isquiotibiales y glúteos) mediante el patrón de bisagra de cadera.",
        execution: "1. De pie con mancuernas frente a los muslos.\n2. Bisagra en la cadera (no en la cintura) — empuja la cadera hacia atrás.\n3. Baja las mancuernas a lo largo de las piernas hasta sentir tensión en los isquiotibiales.\n4. Mantén la espalda plana, ligera flexión de rodilla durante todo el movimiento.\n5. Impulsa las caderas hacia adelante para volver a la posición erguida.",
        indications: "Debilidad de isquiotibiales, disfunción de bisagra de cadera, estabilización lumbar.",
        contraindications: "Hernia discal lumbar aguda, incapacidad de mantener columna neutra.",
        clinicalTip: "Coloca dos dedos en la columna lumbar durante la evaluación — el paciente debe mantener posición neutra, sin flexionarse en cifosis."
      }
    }
  },

  {
    id: "band-glute-kickback",
    animationKey: "band-glute-kickback",
    equipment: ["band"],
    zones: ["hip"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Gluteus maximus", "Hamstrings", "Core (stabilizing)"],
    pathologies: ["Gluteal inhibition", "Hip extension weakness", "Anterior pelvic tilt"],
    translations: {
      en: {
        title: "Band Glute Kickback (Quadruped)",
        description: "Isolated glute max activation in quadruped with band resistance.",
        execution: "1. On hands and knees, band looped around ankle.\n2. Keep core braced, spine neutral.\n3. Extend one leg backward and upward until hip fully extended.\n4. Squeeze glute at the top — 2 seconds.\n5. Return slowly without rotating the pelvis.",
        indications: "Gluteal inhibition, hip extension weakness, anterior pelvic tilt correction.",
        contraindications: "Wrist pain (use fist or forearm), knee pain on support side.",
        clinicalTip: "Cue: 'squeeze a coin between your glute and nothing else'. Stop at neutral extension — not hyperextension."
      },
      es: {
        title: "Extensión de Cadera con Banda (Cuadrupedia)",
        description: "Activación aislada del glúteo mayor en cuadrupedia con resistencia de banda.",
        execution: "1. En cuadrupedia, banda alrededor del tobillo.\n2. Activa el core, columna neutra.\n3. Extiende una pierna hacia atrás y arriba hasta la extensión completa de cadera.\n4. Aprieta el glúteo en la cima — 2 segundos.\n5. Regresa lentamente sin rotar la pelvis.",
        indications: "Inhibición glútea, debilidad de extensión de cadera, corrección de anteversión pélvica.",
        contraindications: "Dolor de muñeca (usar puño o antebrazos), dolor de rodilla en el lado de apoyo.",
        clinicalTip: "Indicación: 'aprieta una moneda solo con el glúteo'. Detente en la extensión neutra — no en hiperextensión."
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🦵 KNEE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "seated-knee-extension",
    animationKey: "seated-knee-extension",
    equipment: ["none"],
    zones: ["knee"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Quadriceps (all four heads)", "Patellar tendon"],
    pathologies: ["Post-ACL repair", "Knee OA", "Quadriceps inhibition", "Post-surgical knee"],
    translations: {
      en: {
        title: "Seated Knee Extension",
        description: "Isolated quadriceps activation — foundational after knee injury or surgery.",
        execution: "1. Sit upright on the edge of a chair.\n2. Slowly extend one knee until fully straight.\n3. Hold fully extended for 3 seconds — strong quad contraction.\n4. Lower slowly over 4 seconds.\n5. Option: add ankle weight for progression.",
        indications: "Post-surgical knee rehabilitation, quadriceps inhibition, knee OA, patellar tendinopathy.",
        contraindications: "Post-ACL repair (terminal range may be restricted — follow surgeon protocol).",
        clinicalTip: "In terminal extension (last 15°), the VMO activates most strongly. Ensure full extension is achieved."
      },
      es: {
        title: "Extensión de Rodilla en Sedestación",
        description: "Activación aislada del cuádriceps — fundamental post-lesión o cirugía de rodilla.",
        execution: "1. Siéntate erguido en el borde de una silla.\n2. Extiende lentamente una rodilla hasta estar completamente recta.\n3. Mantén la extensión completa 3 segundos — fuerte contracción del cuádriceps.\n4. Baja lentamente en 4 segundos.\n5. Opción: añadir peso en el tobillo para progresión.",
        indications: "Rehabilitación posquirúrgica de rodilla, inhibición del cuádriceps, artrosis de rodilla, tendinopatía rotuliana.",
        contraindications: "Post-reparación de LCA (el rango terminal puede estar restringido — seguir protocolo del cirujano).",
        clinicalTip: "En la extensión terminal (últimos 15°), el VMO activa con mayor intensidad. Asegurarse de alcanzar la extensión completa."
      }
    }
  },

  {
    id: "band-squat",
    animationKey: "band-squat",
    equipment: ["band"],
    zones: ["knee", "hip"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 12,
    muscles: ["Quadriceps", "Gluteus medius", "Gluteus maximus", "Adductors"],
    pathologies: ["Knee valgus", "Patellofemoral pain", "VMO weakness"],
    translations: {
      en: {
        title: "Squat with Resistance Band (Knee)",
        description: "Squat with band above knees to correct knee valgus and strengthen hip abductors.",
        execution: "1. Place band just above the knees.\n2. Stand feet hip-width, toes slightly out.\n3. Push knees outward against band as you squat.\n4. Descend until thighs parallel to floor (or pain-free range).\n5. Drive knees out on the way up.",
        indications: "Knee valgus correction, patellofemoral pain syndrome, ACL rehabilitation.",
        contraindications: "Acute knee effusion, knee OA stage 3-4 with pain on loading.",
        clinicalTip: "The band should be challenging enough to require active abduction effort — not just a reminder cue."
      },
      es: {
        title: "Sentadilla con Banda Elástica (Rodilla)",
        description: "Sentadilla con banda sobre las rodillas para corregir valgo y fortalecer abductores de cadera.",
        execution: "1. Coloca la banda justo encima de las rodillas.\n2. De pie con pies al ancho de caderas, pies ligeramente hacia afuera.\n3. Empuja las rodillas hacia afuera contra la banda al hacer la sentadilla.\n4. Desciende hasta que los muslos estén paralelos al suelo (o rango libre de dolor).\n5. Impulsa las rodillas hacia afuera al subir.",
        indications: "Corrección de valgo de rodilla, síndrome patelofemoral, rehabilitación de LCA.",
        contraindications: "Derrame agudo de rodilla, artrosis de rodilla grados 3-4 con dolor en carga.",
        clinicalTip: "La banda debe ser suficientemente resistente para requerir esfuerzo activo de abducción, no solo como recordatorio."
      }
    }
  },

  {
    id: "step-up-single-leg",
    animationKey: "step-up-single-leg",
    equipment: ["none"],
    zones: ["knee", "hip"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 10,
    muscles: ["Quadriceps", "Gluteus maximus", "Gluteus medius", "Calf"],
    pathologies: ["Post ACL", "Knee functional instability", "Patellar tendinopathy"],
    translations: {
      en: {
        title: "Step Up — Single Leg",
        description: "Functional closed chain exercise for knee and hip control — replicates stair climbing.",
        execution: "1. Stand facing a step (15–20 cm height to start).\n2. Place one foot completely on the step.\n3. Drive through the heel to step up — do NOT push off the floor foot.\n4. Control the descent — lower slowly.\n5. Keep knee over 2nd toe throughout.",
        indications: "ACL rehabilitation, patellofemoral pain, functional knee instability.",
        contraindications: "Acute knee effusion, inability to control valgus during the movement.",
        clinicalTip: "Monitor for Trendelenburg — if the hip drops, perform hip abductor strengthening first."
      },
      es: {
        title: "Subida al Step — Una Sola Pierna",
        description: "Ejercicio funcional en cadena cerrada para el control de rodilla y cadera — replica la subida de escaleras.",
        execution: "1. De pie frente al step (15-20 cm de altura para comenzar).\n2. Coloca un pie completamente sobre el step.\n3. Impúlsate desde el talón para subir — NO empujes con el pie del suelo.\n4. Controla el descenso — baja lentamente.\n5. Mantén la rodilla sobre el 2° dedo del pie durante todo el movimiento.",
        indications: "Rehabilitación de LCA, dolor patelofemoral, inestabilidad funcional de rodilla.",
        contraindications: "Derrame agudo de rodilla, incapacidad de controlar el valgo durante el movimiento.",
        clinicalTip: "Observar signo de Trendelenburg — si la cadera cae, reforzar primero los abductores de cadera."
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🦶 ANKLE / FOOT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "ankle-pumps",
    animationKey: "ankle-pumps",
    equipment: ["bodyweight"],
    zones: ["ankle"],
    difficulty: "beginner",
    defaultSets: 2, defaultSeconds: 60,
    muscles: ["Tibialis anterior", "Gastrocnemius", "Soleus", "Calf pump"],
    pathologies: ["Post ankle sprain", "DVT prevention", "Post-surgical immobilization"],
    translations: {
      en: {
        title: "Ankle Pumps",
        description: "Early mobility exercise activating the calf muscle pump to improve venous return.",
        execution: "1. Lie or sit with legs extended.\n2. Pull toes toward you (dorsiflexion) — hold 2 seconds.\n3. Push toes away (plantarflexion) — hold 2 seconds.\n4. Alternate rhythmically.\n5. Perform 20–30 cycles per session.",
        indications: "Post-surgery immobilization, DVT prevention, ankle sprain early stage, edema.",
        contraindications: "Confirmed DVT (consult vascular surgeon first).",
        clinicalTip: "Ankle pumps activate the soleus muscle pump responsible for 20% of venous return from the lower limb."
      },
      es: {
        title: "Bombeo de Tobillo",
        description: "Ejercicio de movilidad temprana que activa la bomba muscular gemelar para mejorar el retorno venoso.",
        execution: "1. Tumbado o sentado con las piernas extendidas.\n2. Acerca los dedos hacia ti (dorsiflexión) — mantén 2 segundos.\n3. Aleja los dedos (flexión plantar) — mantén 2 segundos.\n4. Alterna rítmicamente.\n5. Realiza 20-30 ciclos por sesión.",
        indications: "Inmovilización posquirúrgica, prevención de TVP, esguince de tobillo fase inicial, edema.",
        contraindications: "TVP confirmada (consultar cirujano vascular primero).",
        clinicalTip: "El bombeo de tobillo activa la bomba muscular del sóleo, responsable del 20% del retorno venoso del miembro inferior."
      }
    }
  },

  {
    id: "band-calf-raise",
    animationKey: "band-calf-raise",
    equipment: ["band"],
    zones: ["ankle", "foot"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 20,
    muscles: ["Gastrocnemius", "Soleus", "Tibialis posterior"],
    pathologies: ["Plantar fasciitis", "Achilles tendinopathy", "Post ankle sprain"],
    translations: {
      en: {
        title: "Band Calf Raise",
        description: "Eccentric-concentric calf strengthening with band resistance for tendon loading.",
        execution: "1. Stand with band looped under feet, held at shoulder height.\n2. Rise onto toes as high as possible (concentric).\n3. Slowly lower over 3 seconds (eccentric phase — most important).\n4. Keep slight knee bend for soleus engagement.\n5. Do both legs, then progress to single leg.",
        indications: "Achilles tendinopathy, plantar fasciitis, ankle instability, post-sprain.",
        contraindications: "Acute Achilles rupture, post-surgical calf (check clearance).",
        clinicalTip: "Eccentric loading (slow descent) is the primary therapeutic mechanism for tendinopathy. Prioritize it."
      },
      es: {
        title: "Elevación de Talones con Banda",
        description: "Fortalecimiento excéntrico-concéntrico del gemelo con resistencia de banda para carga tendinosa.",
        execution: "1. De pie con banda bajo los pies, sujetada a la altura del hombro.\n2. Elévate de puntillas lo más alto posible (concéntrico).\n3. Baja lentamente en 3 segundos (fase excéntrica — la más importante).\n4. Mantén ligera flexión de rodilla para activar el sóleo.\n5. Empieza con ambas piernas, progresa a una sola.",
        indications: "Tendinopatía aquílea, fascitis plantar, inestabilidad de tobillo, post-esguince.",
        contraindications: "Rotura aguda del tendón de Aquiles, posquirúrgico de gemelo (verificar tolerancia).",
        clinicalTip: "La carga excéntrica (descenso lento) es el principal mecanismo terapéutico en la tendinopatía. Priorizarla."
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 CERVICAL
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cervical-retraction",
    animationKey: "cervical-retraction",
    equipment: ["bodyweight"],
    zones: ["cervical"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Deep cervical flexors (longus colli, longus capitis)", "Suboccipitals (lengthening)"],
    pathologies: ["Forward head posture", "Cervicogenic headache", "Neck pain", "Upper crossed syndrome"],
    translations: {
      en: {
        title: "Cervical Retraction (Chin Tuck)",
        description: "Activates deep cervical flexors and restores the craniocervical alignment.",
        execution: "1. Sit or stand with good posture.\n2. Gently glide the head backward (not downward).\n3. Feel a mild stretch at the base of the skull.\n4. Hold 5–10 seconds.\n5. Return to neutral. Do not flex the neck — only retract.",
        indications: "Forward head posture, cervicogenic headache, neck pain, upper crossed syndrome.",
        contraindications: "Acute cervical radiculopathy, vertebral artery insufficiency.",
        clinicalTip: "Imagine pressing the back of your skull against a wall behind you. The movement is horizontal, not a chin-down nod."
      },
      es: {
        title: "Retracción Cervical (Chin Tuck)",
        description: "Activa los flexores cervicales profundos y restaura la alineación craneocervical.",
        execution: "1. Sentado o de pie con buena postura.\n2. Desliza la cabeza suavemente hacia atrás (no hacia abajo).\n3. Siente un suave estiramiento en la base del cráneo.\n4. Mantén 5-10 segundos.\n5. Regresa a neutro. No flexiones el cuello — solo retrae.",
        indications: "Postura de cabeza adelantada, cefalea cervicogénica, dolor cervical, síndrome cruzado superior.",
        contraindications: "Radiculopatía cervical aguda, insuficiencia de arteria vertebral.",
        clinicalTip: "Imagina que intentas presionar la nuca contra una pared que está detrás de ti. El movimiento es horizontal, no un gesto de asentir con la cabeza hacia abajo."
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🟠 BOSU
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "bosu-balance",
    animationKey: "bosu-balance",
    equipment: ["bosu"],
    zones: ["ankle", "knee", "hip"],
    difficulty: "intermediate",
    defaultSets: 3, defaultSeconds: 30,
    muscles: ["All ankle stabilizers", "Gluteus medius", "Core"],
    pathologies: ["Chronic ankle instability", "Proprioception deficit", "Post ankle sprain"],
    translations: {
      en: {
        title: "Bosu Single Leg Balance",
        description: "Challenges proprioception and neuromuscular control of the entire lower chain.",
        execution: "1. Step onto the dome of the Bosu with one foot — center of the dome.\n2. Find balance, slight knee bend.\n3. Hold for prescribed time — raise other knee for challenge.\n4. Focus eyes on a fixed point ahead.\n5. Progressions: close eyes, arm movements, throw/catch.",
        indications: "Ankle instability, post-sprain proprioception training, fall prevention in elderly.",
        contraindications: "Acute ankle injury, inability to safely step on/off without support.",
        clinicalTip: "Bare feet improve proprioceptive input. Avoid shoes with thick soles during Bosu training."
      },
      es: {
        title: "Equilibrio Monopodal en Bosu",
        description: "Desafía la propiocepción y el control neuromuscular de toda la cadena inferior.",
        execution: "1. Sube al domo del Bosu con un pie — en el centro del domo.\n2. Encuentra el equilibrio, ligera flexión de rodilla.\n3. Mantén el tiempo indicado — eleva la otra rodilla para mayor reto.\n4. Fija la mirada en un punto fijo adelante.\n5. Progresiones: ojos cerrados, movimientos de brazos, lanzar/atrapar.",
        indications: "Inestabilidad de tobillo, entrenamiento propioceptivo post-esguince, prevención de caídas en mayores.",
        contraindications: "Lesión aguda de tobillo, incapacidad para subir/bajar sin apoyo con seguridad.",
        clinicalTip: "Los pies descalzos mejoran la entrada propioceptiva. Evitar zapatos de suela gruesa en el entrenamiento con Bosu."
      }
    }
  },

  {
    id: "ball-bridge",
    animationKey: "ball-bridge",
    equipment: ["ball"],
    zones: ["hip", "lumbar", "core"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 12,
    muscles: ["Gluteus maximus", "Hamstrings", "Erector spinae", "Core stabilizers"],
    pathologies: ["Lumbar instability", "Hamstring weakness", "Hip extensor deficit"],
    translations: {
      en: {
        title: "Ball Bridge",
        description: "Glute bridge on the ball adds instability and hamstring engagement.",
        execution: "1. Lie on back, legs extended, calves resting on the ball.\n2. Press heels into ball and lift hips until body forms straight line.\n3. Squeeze glutes — hold 3 seconds.\n4. Lower with control.\n5. Progress to single leg for greater challenge.",
        indications: "Hip extensor strengthening, lumbar stabilization, hamstring rehabilitation.",
        contraindications: "Acute lumbar disc pathology, severe hamstring strain.",
        clinicalTip: "Actively press heels into the ball during the hold — this increases hamstring activation through the proximal attachment."
      },
      es: {
        title: "Puente en Pelota",
        description: "El puente de glúteos sobre la pelota añade inestabilidad y mayor trabajo de isquiotibiales.",
        execution: "1. Tumbado boca arriba, piernas extendidas, gemelos sobre la pelota.\n2. Presiona los talones en la pelota y eleva la cadera hasta que el cuerpo forme una línea recta.\n3. Aprieta los glúteos — mantén 3 segundos.\n4. Baja con control.\n5. Progresa a una pierna para mayor dificultad.",
        indications: "Fortalecimiento de extensores de cadera, estabilización lumbar, rehabilitación de isquiotibiales.",
        contraindications: "Patología discal lumbar aguda, desgarro grave de isquiotibiales.",
        clinicalTip: "Presiona activamente los talones contra la pelota durante la posición mantenida — esto aumenta la activación de los isquiotibiales desde la inserción proximal."
      }
    }
  },

  {
    id: "kettlebell-swing",
    animationKey: "kettlebell-swing",
    equipment: ["kettlebell"],
    zones: ["hip", "lumbar", "core"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 15,
    muscles: ["Gluteus maximus", "Hamstrings", "Erector spinae", "Lat", "Core"],
    pathologies: ["Posterior chain weakness", "Functional rehabilitation", "Athletic conditioning"],
    translations: {
      en: {
        title: "Kettlebell Swing",
        description: "Explosive hip hinge developing power in the posterior chain.",
        execution: "1. Stand with feet shoulder-width, kettlebell between ankles.\n2. Hinge at hip, grip the kettlebell, hike it back between legs.\n3. Drive hips forward explosively — do not squat.\n4. Swing to chest height using hip power, not arms.\n5. Control the descent back into the hip hinge.",
        indications: "Posterior chain power development, athletic rehabilitation, metabolic conditioning.",
        contraindications: "Acute lumbar disc herniation, inability to hip hinge with neutral spine.",
        clinicalTip: "This is a hip hinge, not a squat. The power comes entirely from glute and hamstring contraction. Arms are just cables."
      },
      es: {
        title: "Swing de Kettlebell",
        description: "Bisagra de cadera explosiva que desarrolla potencia en la cadena posterior.",
        execution: "1. De pie con pies al ancho de hombros, kettlebell entre los tobillos.\n2. Bisagra en la cadera, agarra la kettlebell, balancea hacia atrás entre las piernas.\n3. Impulsa la cadera hacia adelante de forma explosiva — no es una sentadilla.\n4. Sube el kettlebell a la altura del pecho usando la potencia de cadera, no los brazos.\n5. Controla el descenso de vuelta a la bisagra de cadera.",
        indications: "Desarrollo de potencia de la cadena posterior, rehabilitación atlética, acondicionamiento metabólico.",
        contraindications: "Hernia discal lumbar aguda, incapacidad de hacer bisagra de cadera con columna neutra.",
        clinicalTip: "Esto es una bisagra de cadera, no una sentadilla. La potencia proviene completamente de la contracción del glúteo e isquiotibiales. Los brazos solo son cables."
      }
    }
  },

  {
    id: "medicine-ball-rotation",
    animationKey: "medicine-ball-rotation",
    equipment: ["medicine-ball"],
    zones: ["core", "thoracic"],
    difficulty: "intermediate",
    defaultSets: 3, defaultReps: 12,
    muscles: ["Obliques", "Transversus abdominis", "Thoracic rotators", "Gluteus medius"],
    pathologies: ["Core rotational weakness", "Thoracic stiffness", "Athletic rehabilitation"],
    translations: {
      en: {
        title: "Medicine Ball Rotation",
        description: "Develops rotational core power and thoracic mobility.",
        execution: "1. Stand feet shoulder-width, hold medicine ball at chest.\n2. Rotate trunk to one side, keeping hips forward.\n3. Quickly rotate to the other side in one fluid motion.\n4. For advanced: throw against a wall (partner or rebounder).\n5. Keep core braced — movement comes from thoracic, not lumbar.",
        indications: "Core rotational deficit, sports rehabilitation, thoracic mobility training.",
        contraindications: "Acute lumbar disc herniation with rotation pain, thoracic compression fracture.",
        clinicalTip: "Cue 'rotate from the sternum, not the pelvis'. Hips should remain mostly stable."
      },
      es: {
        title: "Rotación con Balón Medicinal",
        description: "Desarrolla potencia rotacional del core y movilidad torácica.",
        execution: "1. De pie con pies al ancho de hombros, sujeta el balón medicinal al nivel del pecho.\n2. Rota el tronco hacia un lado manteniendo las caderas al frente.\n3. Rota rápidamente hacia el otro lado en un movimiento fluido.\n4. Para nivel avanzado: lanza contra una pared (compañero o rebotador).\n5. Core activado — el movimiento proviene de la zona torácica, no lumbar.",
        indications: "Déficit de rotación del core, rehabilitación deportiva, entrenamiento de movilidad torácica.",
        contraindications: "Hernia discal lumbar aguda con dolor en rotación, fractura vertebral torácica por compresión.",
        clinicalTip: "Indicación: 'rota desde el esternón, no desde la pelvis'. Las caderas deben mantenerse mayormente estables."
      }
    }
  },

  {
    id: "goblet-squat",
    animationKey: "goblet-squat",
    equipment: ["dumbbell"],
    zones: ["knee", "hip", "core"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 12,
    muscles: ["Quadriceps", "Gluteus maximus", "Core", "Thoracic extensors"],
    pathologies: ["Movement pattern training", "Knee rehabilitation", "Squat mechanics correction"],
    translations: {
      en: {
        title: "Goblet Squat",
        description: "The counterweight of the dumbbell facilitates an upright torso and deep squat pattern.",
        execution: "1. Hold dumbbell vertically at chest, elbows pointing down.\n2. Feet slightly wider than hip-width, toes out 30°.\n3. Sit back and down, keeping torso upright.\n4. Elbows should touch inside of knees at the bottom.\n5. Drive through heels to stand.",
        indications: "Squat pattern learning, thoracic kyphosis during squat, knee rehabilitation.",
        contraindications: "Significant knee OA with loading pain, hip impingement (reduce depth).",
        clinicalTip: "The goblet position automatically promotes thoracic extension. Use it to teach squat mechanics before progressing to barbell."
      },
      es: {
        title: "Sentadilla Goblet",
        description: "El contrapeso de la mancuerna facilita el tronco erguido y el patrón de sentadilla profunda.",
        execution: "1. Sujeta la mancuerna verticalmente al pecho, codos apuntando hacia abajo.\n2. Pies ligeramente más anchos que el ancho de caderas, puntas hacia afuera 30°.\n3. Siéntate hacia atrás y abajo manteniendo el tronco erguido.\n4. Los codos deben tocar el interior de las rodillas en la posición inferior.\n5. Impúlsate desde los talones para ponerte de pie.",
        indications: "Aprendizaje del patrón de sentadilla, cifosis torácica durante la sentadilla, rehabilitación de rodilla.",
        contraindications: "Artrosis de rodilla significativa con dolor en carga, impingement de cadera (reducir profundidad).",
        clinicalTip: "La posición goblet promueve automáticamente la extensión torácica. Úsala para enseñar la mecánica de sentadilla antes de progresar a barra."
      }
    }
  },

  {
    id: "lunge",
    animationKey: "lunge",
    equipment: ["bodyweight"],
    zones: ["knee", "hip"],
    difficulty: "beginner",
    defaultSets: 3, defaultReps: 10,
    muscles: ["Quadriceps", "Gluteus maximus", "Gluteus medius", "Soleus"],
    pathologies: ["Knee functional training", "Hip strengthening", "Sport return"],
    translations: {
      en: {
        title: "Bodyweight Lunge",
        description: "Functional single-leg exercise training hip and knee control in the sagittal plane.",
        execution: "1. Stand upright, hands on hips.\n2. Step forward — front shin vertical, back knee hovering above floor.\n3. Knee over 2nd toe, do not let it cave inward.\n4. Push through front heel to return.\n5. Alternate legs.",
        indications: "Lower limb functional training, post-injury sport return, balance training.",
        contraindications: "Acute knee/hip inflammation, severe balance deficit (use support).",
        clinicalTip: "Check from the front: knee should not collapse medially. If it does, address hip abductor weakness first."
      },
      es: {
        title: "Estocada con Peso Corporal",
        description: "Ejercicio funcional unilateral que entrena el control de cadera y rodilla en el plano sagital.",
        execution: "1. De pie erguido, manos en las caderas.\n2. Da un paso adelante — espinilla delantera vertical, rodilla trasera flotando sobre el suelo.\n3. Rodilla sobre el 2° dedo del pie, no la dejes colapsar hacia adentro.\n4. Empuja desde el talón delantero para volver.\n5. Alterna piernas.",
        indications: "Entrenamiento funcional de miembro inferior, vuelta al deporte post-lesión, entrenamiento de equilibrio.",
        contraindications: "Inflamación aguda de rodilla/cadera, déficit grave de equilibrio (usar apoyo).",
        clinicalTip: "Observa desde el frente: la rodilla no debe colapsar hacia el interior. Si lo hace, trabaja primero la debilidad de abductores de cadera."
      }
    }
  },

  {
    id: "wall-sit",
    animationKey: "wall-sit",
    equipment: ["bodyweight"],
    zones: ["knee"],
    difficulty: "beginner",
    defaultSets: 3, defaultSeconds: 45,
    muscles: ["Quadriceps", "Gluteus maximus", "Core"],
    pathologies: ["Knee OA", "Quadriceps endurance", "Post-surgical knee"],
    translations: {
      en: {
        title: "Wall Sit",
        description: "Isometric quadriceps endurance exercise with minimal joint shear force.",
        execution: "1. Stand with back against wall, feet 60 cm from wall.\n2. Slide down until knees at 90° (or pain-free angle).\n3. Weight equally on both heels.\n4. Hold for the prescribed time.\n5. Do not exceed 90° knee flexion for OA patients.",
        indications: "Knee OA (low load option), quadriceps endurance, post-surgical rehabilitation.",
        contraindications: "Patellofemoral pain exacerbated by loading in flexion, angle should be individualized.",
        clinicalTip: "For knee OA, an angle of 60° (less flexion) reduces patellofemoral compressive force while still training quads."
      },
      es: {
        title: "Sentadilla en Pared",
        description: "Ejercicio isométrico de resistencia de cuádriceps con mínima fuerza de cizallamiento articular.",
        execution: "1. De pie con la espalda contra la pared, pies 60 cm de la pared.\n2. Deslízate hasta que las rodillas estén a 90° (o ángulo libre de dolor).\n3. Peso igualmente repartido en ambos talones.\n4. Mantén el tiempo indicado.\n5. No superar 90° de flexión de rodilla en pacientes con artrosis.",
        indications: "Artrosis de rodilla (opción de baja carga), resistencia del cuádriceps, rehabilitación posquirúrgica.",
        contraindications: "Dolor patelofemoral exacerbado por carga en flexión — el ángulo debe individualizarse.",
        clinicalTip: "En artrosis de rodilla, un ángulo de 60° (menos flexión) reduce la fuerza compresiva patelofemoral mientras sigue entrenando el cuádriceps."
      }
    }
  },

];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getExerciseById(id: string): ExerciseEntry | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getExercisesByZone(zone: BodyZone): ExerciseEntry[] {
  return EXERCISES.filter((e) => e.zones.includes(zone));
}

export function getExercisesByEquipment(equipment: Equipment): ExerciseEntry[] {
  return EXERCISES.filter((e) => e.equipment.includes(equipment));
}

export const ALL_ZONES: BodyZone[] = [
  "shoulder", "hip", "knee", "ankle", "lumbar", "cervical",
  "thoracic", "elbow", "wrist", "hand", "core", "foot",
];

export const ALL_EQUIPMENT: Equipment[] = [
  "bodyweight", "band", "dumbbell", "ball", "bosu",
  "kettlebell", "foam-roller", "medicine-ball", "none",
];

export const EQUIPMENT_LABELS: Record<Equipment, { label: string; emoji: string; color: string }> = {
  "bodyweight":    { label: "Body Weight",     emoji: "🟢", color: "bg-green-100 text-green-700"   },
  "band":          { label: "Resistance Band", emoji: "🔴", color: "bg-red-100 text-red-700"       },
  "dumbbell":      { label: "Dumbbell",        emoji: "🔵", color: "bg-blue-100 text-blue-700"     },
  "ball":          { label: "Therapy Ball",    emoji: "🟡", color: "bg-yellow-100 text-yellow-700" },
  "bosu":          { label: "Bosu / Fitball",  emoji: "🟠", color: "bg-orange-100 text-orange-700" },
  "kettlebell":    { label: "Kettlebell",      emoji: "⚫", color: "bg-gray-100 text-gray-700"     },
  "foam-roller":   { label: "Foam Roller",     emoji: "🟠", color: "bg-orange-100 text-orange-700" },
  "medicine-ball": { label: "Medicine Ball",   emoji: "🔵", color: "bg-indigo-100 text-indigo-700" },
  "none":          { label: "No Equipment",    emoji: "✋", color: "bg-surface-100 text-surface-700"},
  "barbell":       { label: "Barbell",         emoji: "🏋️", color: "bg-gray-100 text-gray-800"     },
};

export const ZONE_LABELS: Record<string, { label: string; emoji: string }> = {
  shoulder:  { label: "Shoulder",  emoji: "💪" },
  hip:       { label: "Hip",       emoji: "🔵" },
  knee:      { label: "Knee",      emoji: "🦵" },
  ankle:     { label: "Ankle",     emoji: "🦶" },
  lumbar:    { label: "Lumbar",    emoji: "🦴" },
  cervical:  { label: "Cervical",  emoji: "🔍" },
  thoracic:  { label: "Thoracic",  emoji: "🫁" },
  elbow:     { label: "Elbow",     emoji: "💫" },
  wrist:     { label: "Wrist",     emoji: "🖐️" },
  core:      { label: "Core",      emoji: "⚙️" },
  foot:      { label: "Foot",      emoji: "👣" },
  global:    { label: "Global",    emoji: "🌐" },
};
