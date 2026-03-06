"use client";

import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExercisePlayer, type ExerciseData } from "@/components/exercises/ExercisePlayer";
import { Play } from "lucide-react";

// ─── Técnicas de osteopatía con instrucciones completas ──────────────────────
const ALL_TECHNIQUES: (ExerciseData & { category: string; mechanism: string })[] = [
  // ── VISCERAL ──────────────────────────────────────────────────────────────
  {
    id: "hepatic-pump",
    name: "Hepatic Pump",
    nameLocal: "Bomba Hepática",
    region: "Hígado · Hipocondrio derecho",
    difficulty: "intermediate",
    category: "visceral",
    mechanism: "Mejora el drenaje linfático y la circulación hepática mediante compresión rítmica.",
    musclesWorked: ["Cápsula de Glisson", "Ligamentos hepatoduodenales", "Sistema porta"],
    keyPoint: "El ritmo es la clave: 2 Hz. Demasiado rápido pierde efectividad linfática.",
    steps: [
      "POSICIÓN PACIENTE: Decúbito supino, brazos relajados a los lados.",
      "POSICIÓN TERAPEUTA: De pie a la derecha del paciente, a la altura del tórax.",
      "CONTACTO: Ambas manos superpuestas sobre el hipocondrio derecho, talón de mano sobre el reborde costal.",
      "TÉCNICA: Aplicar compresión rítmica suave hacia el diafragma a 2 Hz (2 compresiones/segundo).",
      "DURACIÓN: Mantener 30–60 segundos. Buscar el 'punto de quietud' (pausa en el ritmo hepático) y mantener hasta sentir la relajación tisular.",
      "RETEST: Palpar el hipocondrio y evaluar cambio en la tensión hepática.",
    ],
    tip: "Si el paciente restringe la respiración, pídele que exhale profundo. La respiración amplifica el efecto.",
    contraindications: "Hepatitis aguda, cirrosis avanzada, carcinoma hepático activo.",
    youtubeSearch: "hepatic pump osteopathy visceral technique",
  },
  {
    id: "mesenteric-release",
    name: "Mesenteric Release",
    nameLocal: "Liberación Mesentérica",
    region: "Intestino delgado · Raíz del mesenterio",
    difficulty: "intermediate",
    category: "visceral",
    mechanism: "Reduce adherencias viscerales y mejora la motilidad intestinal por liberación fascial.",
    musclesWorked: ["Raíz del mesenterio", "Fascia peritoneal", "Arteria mesentérica superior"],
    keyPoint: "El mesenterio va de L2 a la fosa ilíaca derecha — sigue ese vector.",
    steps: [
      "POSICIÓN PACIENTE: Supino con rodillas flexionadas a 45° para relajar los psoas.",
      "POSICIÓN TERAPEUTA: De pie a la derecha, a la altura del abdomen.",
      "CONTACTO: Yemas de los dedos de ambas manos en la zona umbilical, profundizando hacia la raíz del mesenterio.",
      "EVALUACIÓN: Palpa la dirección de mayor restricción tisular (vector de la raíz del mesenterio: ombligo → fosa ilíaca derecha).",
      "TÉCNICA: Eleva suavemente los tejidos hacia el esternón, siguiendo la dirección de menor resistencia. No fuerces.",
      "MANTENER: 30–90 segundos hasta sentir la liberación (sensación de 'soltar' o calor).",
    ],
    tip: "Rodillas flexionadas relajan los psoas y facilitan el acceso al mesenterio. Fundamental.",
    contraindications: "Obstrucción intestinal aguda, post-cirugía abdominal reciente (<6 semanas).",
    youtubeSearch: "mesenteric release osteopathy visceral manipulation technique",
  },
  {
    id: "kidney-mobilization",
    name: "Kidney Mobilization",
    nameLocal: "Movilización Renal Bimanual",
    region: "Riñón · Espacio retroperitoneal",
    difficulty: "advanced",
    category: "visceral",
    mechanism: "Restaura la movilidad renal para mejorar el drenaje venoso y linfático perirrenal.",
    musclesWorked: ["Fascia renal (Gerota)", "Cápsula renal", "Pedículo renal"],
    keyPoint: "El riñón se mueve 3–5 cm en respiración normal — eso es lo que buscamos liberar.",
    steps: [
      "POSICIÓN PACIENTE: Decúbito lateral (riñón a tratar hacia arriba), pierna superior flexionada.",
      "POSICIÓN TERAPEUTA: De frente al paciente, a la altura del flanco.",
      "CONTACTO POSTERIOR: Mano caudal bajo el flanco, dedos apuntando hacia la columna.",
      "CONTACTO ANTERIOR: Mano craneal en la zona lumbar anterior, dedos hacia el riñón.",
      "TÉCNICA — PINZA BIMANUAL: Acercar ambas manos suavemente hasta contactar el polo inferior renal. Seguir el movimiento renal con la respiración (desciende con la inspiración).",
      "MOVILIZACIÓN: En la espiración, guiar el riñón en la dirección restringida. Mantener 3–5 ciclos respiratorios.",
    ],
    tip: "La palpación renal directa requiere práctica. Si no encuentras el riñón, busca la tensión perirrenal.",
    contraindications: "Litiasis renal aguda, pielonefritis activa, trauma renal reciente.",
    youtubeSearch: "kidney mobilization osteopathy visceral technique",
  },
  {
    id: "colon-release",
    name: "Colon Release",
    nameLocal: "Liberación del Colon",
    region: "Colon ascendente · Transverso · Descendente",
    difficulty: "intermediate",
    category: "visceral",
    mechanism: "Restaura la movilidad del marco cólico y mejora el tránsito intestinal.",
    musclesWorked: ["Fascia parietal del colon", "Haustras del colon", "Bandas de Toldt"],
    keyPoint: "Sigue el marco cólico: ascendente → transverso → descendente.",
    steps: [
      "POSICIÓN PACIENTE: Supino, piernas relajadas, abdomen descubierto.",
      "POSICIÓN TERAPEUTA: De pie a la derecha del paciente.",
      "SEGMENTO 1 — COLON ASCENDENTE: Yemas de los dedos en la fosa ilíaca derecha. Presión suave hacia la izquierda y cefálicamente. 15–30 seg.",
      "SEGMENTO 2 — COLON TRANSVERSO: Ambas manos bajo el reborde costal, deslizar de derecha a izquierda siguiendo el colon transverso. 15–30 seg.",
      "SEGMENTO 3 — COLON DESCENDENTE: Dedos en hipocondrio izquierdo, guiar hacia la fosa ilíaca izquierda. 15–30 seg.",
      "RETEST: Palpar cada segmento y evaluar cambio en la tensión y movilidad.",
    ],
    tip: "Si hay resistencia, NO fuerces. Espera a que el tejido ceda — puede tardar 20–30 segundos.",
    contraindications: "Cólico agudo activo, sospecha de vólvulo, colitis ulcerosa en brote.",
    youtubeSearch: "colon release osteopathy visceral manipulation large intestine",
  },
  // ── CRANEAL ───────────────────────────────────────────────────────────────
  {
    id: "cv4",
    name: "CV4 Compression",
    nameLocal: "Compresión del 4° Ventrículo",
    region: "Occipital · 4° ventrículo",
    difficulty: "advanced",
    category: "craneal",
    mechanism: "Actúa sobre el mecanismo respiratorio primario comprimiendo el 4° ventrículo.",
    musclesWorked: ["Occipital", "Líquido cefalorraquídeo", "Dura madre craneal"],
    keyPoint: "El still point (pausa del MRP) es el momento terapéutico — no interrumpas.",
    steps: [
      "POSICIÓN PACIENTE: Supino, sin almohada, cabeza centrada.",
      "POSICIÓN TERAPEUTA: Sentado a la cabecera del paciente, codos apoyados en la camilla.",
      "CONTACTO: Coloca los tenar de ambas manos bajo el occipital, contactando las protuberancias occipitales laterales (squama occipital, lateral a la protuberancia occipital externa).",
      "ESCUCHA: Siente el MRP (Mecanismo Respiratorio Primario) sin aplicar fuerza. Frecuencia normal: 8–12 ciclos/min.",
      "TÉCNICA: En la fase de FLEXIÓN del MRP (occipital se ensancha), añade una resistencia mínima — como si no dejaras que las escamas occipitales se separen. Presión: 5–10 gramos.",
      "STILL POINT: Mantén hasta que el MRP se detenga (still point, 2–30 segundos). Espera hasta que el ritmo se reanude con mayor amplitud y suavidad.",
    ],
    tip: "Tus manos reciben información más que aplican fuerza. Si no sientes el MRP, relaja más tus manos.",
    contraindications: "Hipertensión intracraneal, trauma craneal agudo, hemorragia subaracnoidea.",
    youtubeSearch: "CV4 compression fourth ventricle osteopathy cranial technique",
  },
  {
    id: "sbs",
    name: "Sphenobasilar Synchondrosis",
    nameLocal: "Evaluación de la SBS",
    region: "Esfenoides · Occipital",
    difficulty: "expert",
    category: "craneal",
    mechanism: "Evalúa y corrige las tensiones del mecanismo respiratorio primario en la SBS.",
    musclesWorked: ["Esfenoides", "Occipital", "Huesos temporales", "Sacro (por reciprocidad)"],
    keyPoint: "6 patrones de la SBS: flexión/extensión, torsión D/I, inclinación lateral, compresión.",
    steps: [
      "POSICIÓN PACIENTE: Supino sin almohada. Cabeza centrada y relajada.",
      "POSICIÓN TERAPEUTA: Sentado a la cabecera, codos apoyados cómodamente.",
      "CONTACTO ESFENOIDES (mano craneal): Pulgares sobre las alas mayores del esfenoides (lateral a las órbitas, en las sienes). Dedos 2–5 envolviendo el cráneo.",
      "CONTACTO OCCIPITAL (mano caudal): Tenar bajo las escamas occipitales.",
      "ESCUCHA MRP: Siente la flexión (esfenoides sube, occipital se aplana) y extensión (esfenoides baja, occipital se eleva). Identifica el patrón de disfunción.",
      "CORRECCIÓN: Sigue la dirección de facilidad (donde el tejido va más fácil) hasta el still point. Espera la corrección espontánea.",
    ],
    tip: "Este es el examen más sutil de la osteopatía craneal. Requiere 200+ horas de práctica para ser fiable.",
    contraindications: "Trauma craneal agudo, fractura de base de cráneo, tumor craneal.",
    youtubeSearch: "sphenobasilar synchondrosis SBS osteopathy cranial sacral technique",
  },
  {
    id: "frontal-lift",
    name: "Frontal Lift",
    nameLocal: "Elevación del Frontal",
    region: "Hueso frontal",
    difficulty: "intermediate",
    category: "craneal",
    mechanism: "Libera la sutura coronal y mejora el drenaje del seno frontal.",
    musclesWorked: ["Hueso frontal", "Sutura coronal", "Seno frontal", "Fascia epicraneal"],
    keyPoint: "Muy efectivo en migraña frontal y sinusitis crónica.",
    steps: [
      "POSICIÓN PACIENTE: Supino sin almohada, completamente relajado.",
      "POSICIÓN TERAPEUTA: Sentado a la cabecera, codos apoyados en la camilla.",
      "CONTACTO: Pulgares sobre el hueso frontal paralelos a la línea de pelo (a 1–2 cm del nacimiento del cabello). Dedos envuelven suavemente la parte superior del cráneo.",
      "ESCUCHA: Siente el movimiento del frontal en el MRP — avanza (flexión craneal) y retrocede (extensión craneal).",
      "TÉCNICA: En la fase de EXTENSIÓN, aplica un leve lift anterior de 0.5–1 mm. Es mínimo — la fuerza es de gramos, no kilos.",
      "MANTENER: Espera el still point y la posterior ampliación del movimiento frontal. El seno frontal puede drenar (el paciente puede sentir presión que se libera).",
    ],
    tip: "Si el paciente tiene cefalea, este contacto puede ser muy sensible. Comienza con presión mínima y aumenta gradualmente.",
    youtubeSearch: "frontal lift craniosacral osteopathy frontal bone technique",
  },
  // ── ESTRUCTURAL ───────────────────────────────────────────────────────────
  {
    id: "hvla-lumbar-roll",
    name: "HVLA Lumbar Roll",
    nameLocal: "HVLA — Thrust Lumbar en Roll",
    region: "Lumbar L1–L5",
    difficulty: "advanced",
    category: "structural",
    mechanism: "Thrust de alta velocidad y baja amplitud para restaurar la movilidad articular lumbar.",
    musclesWorked: ["Articulaciones facetarias lumbares", "Ligamentos iliolumbares", "Multífidos"],
    keyPoint: "La barrera se alcanza SIN fuerza — el thrust es pequeño y rápido SOBRE la barrera.",
    steps: [
      "POSICIÓN PACIENTE: Decúbito lateral, segmento a tratar (faceta restringida) hacia arriba. Almohada bajo la cabeza.",
      "POSICIÓN TERAPEUTA: De frente al paciente, a la altura de la cintura.",
      "SETUP INFERIOR: Flexiona la cadera inferior ~30° y la rodilla ~90°. La pierna inferior actúa como base.",
      "SETUP SUPERIOR: Flexiona la cadera superior hasta que el movimiento llegue al segmento a tratar (se siente como tensión en los procesos espinosos). Rodilla superior cae hacia la camilla.",
      "PALANCA: Rota el tronco superior hacia atrás (hombro hacia la camilla) hasta sentir tensión en el segmento. Ahora tienes la palanca dual: cadera abajo, hombro atrás.",
      "THRUST: Cuando la tensión está en su máximo, aplica un impulso corto, rápido y controlado sobre la pelvis (ASIS) hacia abajo. La amplitud es de 1–2 cm.",
    ],
    tip: "Si escuchas cavitación (clic/pop), es normal pero no necesario. La técnica es efectiva sin sonido.",
    contraindications: "Osteoporosis grave, hernia discal con neurológico activo, fractura vertebral.",
    youtubeSearch: "HVLA lumbar roll manipulation osteopathy technique",
  },
  {
    id: "met-sacrum",
    name: "Muscle Energy — Sacrum",
    nameLocal: "MET — Muscle Energy para Sacro",
    region: "Sacro · Ilion",
    difficulty: "intermediate",
    category: "structural",
    mechanism: "Usa contracciones isométricas del paciente para corregir la torsión sacra.",
    musclesWorked: ["Piriforme", "Glúteo mayor", "Ligamentos sacroilíacos", "Isquiotibiales"],
    keyPoint: "Contracción del 20% — suficiente para activar el mecanismo reflejo muscular.",
    steps: [
      "POSICIÓN PACIENTE: Decúbito prono, cara hacia abajo (o girada), brazos relajados.",
      "POSICIÓN TERAPEUTA: De pie al lado del sacro a tratar, a la altura de la pelvis.",
      "EVALUACIÓN: Palpa los surcos sacros para identificar el sacro posterior (el lado que está caído).",
      "SETUP: Flexiona la rodilla ipsilateral al sacro posterior a 90°. Mano caudal sobre el sacro para monitorear. Mano craneal estabiliza la pelvis (ASIS contralateral).",
      "PALANCA: Lleva el pie hacia el exterior (rotación interna de cadera) hasta alcanzar la barrera sacra. Mantén ahí.",
      "MET: Pide al paciente: 'Lleva el pie hacia dentro contra mi mano, 20% de fuerza, 5 segundos'. Resiste sin ceder. Tras la contracción: 'Relaja'. Avanza al nuevo rango. Repite 3–5 veces.",
    ],
    tip: "Tras las 3 contracciones el rango debe aumentar notablemente. Si no, revisa la identificación del sacro posterior.",
    youtubeSearch: "muscle energy technique sacrum osteopathy MET sacroiliac",
  },
  {
    id: "thoracic-thrust",
    name: "Thoracic Thrust",
    nameLocal: "Thrust Torácico Anterior",
    region: "Torácica T3–T8",
    difficulty: "advanced",
    category: "structural",
    mechanism: "Thrust anterior sobre la columna torácica para restaurar la movilidad segmentaria.",
    musclesWorked: ["Articulaciones costovertebales", "Facetas torácicas", "Ligamentos longitudinales"],
    keyPoint: "La posición de los brazos del paciente (cruzados) sube o baja el nivel de palanca.",
    steps: [
      "POSICIÓN PACIENTE: Supino, brazos cruzados sobre el pecho (manos en hombros opuestos). Cabeza en posición neutra.",
      "POSICIÓN TERAPEUTA: De pie al lado del paciente, a la altura del tórax a tratar.",
      "CONTACTO POSTERIOR: Coloca tu mano dominante (en puño suave o borde hipotenar) directamente sobre el proceso espinoso del segmento a tratar.",
      "AJUSTE DE NIVEL: Pide al paciente que suba los codos — esto sube el nivel de palanca. Baje los codos — baja el nivel. Ajusta hasta sentir la tensión en el segmento.",
      "CONTACTO ANTERIOR: Tu pecho o antebrazo contacta los brazos del paciente. Tu peso corporal es la fuerza.",
      "THRUST: Pide: 'Exhala completamente'. En el momento de máxima espiración, aplica el thrust hacia abajo con tu peso corporal. Rápido, corto (1–2 cm).",
    ],
    tip: "Pide al paciente que exhale antes del thrust — relaja los paravertebrales y maximiza la seguridad.",
    contraindications: "Osteoporosis, fracturas vertebrales, mielopatía torácica.",
    youtubeSearch: "thoracic thrust manipulation osteopathy HVLA thoracic spine",
  },
  {
    id: "counterstrain",
    name: "Counterstrain",
    nameLocal: "Counterstrain — Tensión y Contratensión",
    region: "Cualquier región",
    difficulty: "beginner",
    category: "structural",
    mechanism: "Posiciona el tejido en máximo confort para inhibir el reflejo propioceptivo doloroso.",
    musclesWorked: ["Husos musculares", "Receptores propioceptivos", "Tejido conectivo"],
    keyPoint: "La posición de confort es la que reduce el dolor del tender point en un 70%.",
    steps: [
      "EVALUACIÓN: Localiza el tender point con palpación — punto hipersensible (VAS ≥7/10). Marca mentalmente su ubicación.",
      "BASELINE: Con el pulgar sobre el tender point, cuantifica el dolor del 0 al 10. Mantén el contacto durante toda la técnica.",
      "POSICIÓN DE CONFORT: Mueve lentamente al paciente hacia la posición de menor dolor. Regla: el dolor debe bajar al menos 70% (de 7/10 a ≤2/10).",
      "MANTENIMIENTO: Mantén esa posición exacta durante 90 segundos COMPLETOS. No hables. No te muevas. El silencio es parte de la técnica.",
      "RETORNO: Regresa MUY lentamente a posición neutra (3–5 segundos). Un retorno brusco puede reactivar el tender point.",
      "RETEST: Vuelve a palpar el tender point. El dolor debe haber disminuido significativamente o desaparecido.",
    ],
    tip: "Si el dolor no baja al 70%, la posición no es la correcta. Ajusta 1–2 mm y reevalúa.",
    youtubeSearch: "counterstrain osteopathy positional release technique tender point",
  },
  {
    id: "met-cervical",
    name: "MET Cervical",
    nameLocal: "MET Cervical — Muscle Energy",
    region: "Cervical C1–C7",
    difficulty: "intermediate",
    category: "structural",
    mechanism: "Contracciones isométricas para corregir disfunciones de movimiento cervical.",
    musclesWorked: ["Esternocleidomastoideo", "Escalenos", "Suboccipitales", "Músculos profundos cervicales"],
    keyPoint: "Localiza la barrera antes de pedir la contracción — la MET actúa EN la barrera.",
    steps: [
      "POSICIÓN PACIENTE: Supino sin almohada (o sentado si es C1–C3). Cuello en posición neutra.",
      "POSICIÓN TERAPEUTA: A la cabecera (supino) o detrás del paciente (sentado). Manos envolviendo suavemente el occipital/cervical.",
      "EVALUACIÓN: Evalúa la rotación, flexión lateral y flexión/extensión. Identifica la dirección restringida y la barrera (donde empieza la resistencia, NO el dolor).",
      "PALANCA: Lleva la cabeza hasta la barrera de movimiento. Mantén ahí — no pases la barrera.",
      "MET: Instrucción clara: 'Gira suavemente la cabeza hacia mi mano (o hacia la derecha/izquierda), 20% de fuerza, 5 segundos'. Resiste isométricamente — sin movimiento.",
      "CICLO: Tras 5 seg: 'Relaja'. Espera 2–3 seg. Avanza a la nueva barrera (mayor rango). Repite 3–5 veces.",
    ],
    tip: "Tras cada ciclo el rango debe aumentar. Si no, revisa la localización de la barrera o el diagnóstico.",
    contraindications: "Insuficiencia vertebrobasilar, fractura cervical, mielopatía cervical.",
    youtubeSearch: "muscle energy technique cervical spine osteopathy MET neck",
  },
];

const CATEGORIES = [
  { key: "all",        label: "Todas",      count: ALL_TECHNIQUES.length },
  { key: "visceral",   label: "Visceral",   count: ALL_TECHNIQUES.filter(t => t.category === "visceral").length },
  { key: "craneal",    label: "Craneal",    count: ALL_TECHNIQUES.filter(t => t.category === "craneal").length },
  { key: "structural", label: "Estructural",count: ALL_TECHNIQUES.filter(t => t.category === "structural").length },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "bg-clinical-500/10 text-clinical-700 border-clinical-500/20",
  intermediate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  advanced:     "bg-orange-500/10 text-orange-700 border-orange-500/20",
  expert:       "bg-red-500/10 text-red-700 border-red-500/20",
};
const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Básico", intermediate: "Intermedio", advanced: "Avanzado", expert: "Experto"
};

const CATEGORY_COLORS: Record<string, string> = {
  visceral:   "bg-rose-500/10 text-rose-700 border border-rose-500/20",
  craneal:    "bg-purple-500/10 text-purple-700 border border-purple-500/20",
  structural: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
};

const CATEGORY_GRADIENT: Record<string, string> = {
  visceral:   "from-rose-900 via-rose-800 to-pink-900",
  craneal:    "from-purple-900 via-violet-800 to-indigo-900",
  structural: "from-blue-900 via-sky-800 to-cyan-900",
};

const CATEGORY_EMOJI: Record<string, string> = {
  visceral:   "🫀",
  craneal:    "🧠",
  structural: "🦴",
};

// ─── Tarjeta de técnica ───────────────────────────────────────────────────────
function TechniqueCard({
  technique,
  onPlay,
}: {
  technique: typeof ALL_TECHNIQUES[0];
  onPlay: () => void;
}) {
  const hasVideo = !!(technique.youtubeId || technique.youtubeSearch);
  return (
    <Card className="group overflow-hidden hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 border border-surface-200 bg-white cursor-pointer" onClick={onPlay}>
      {/* Thumbnail con gradiente */}
      <div className={cn("relative overflow-hidden bg-gradient-to-br", CATEGORY_GRADIENT[technique.category])} style={{ aspectRatio: "16/10" }}>
        {/* Emoji de fondo */}
        <span className="absolute inset-0 flex items-center justify-center text-7xl opacity-[0.15] select-none pointer-events-none">
          {CATEGORY_EMOJI[technique.category]}
        </span>

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 bg-white/20 backdrop-blur-sm border border-white/60 rounded-full w-12 h-12 flex items-center justify-center shadow-xl">
            <Play className="h-5 w-5 text-white fill-white ms-0.5" />
          </div>
        </div>

        {/* Badge categoría */}
        <div className="absolute top-2 start-2 z-10">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", CATEGORY_COLORS[technique.category])}>
            {technique.category.charAt(0).toUpperCase() + technique.category.slice(1)}
          </span>
        </div>

        {/* Badge dificultad */}
        <div className="absolute top-2 end-2 z-10">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", DIFFICULTY_COLORS[technique.difficulty])}>
            {DIFFICULTY_LABEL[technique.difficulty]}
          </span>
        </div>

        {/* Badge video */}
        {hasVideo && (
          <div className="absolute bottom-2 end-2 z-10">
            <span className="flex items-center gap-1 text-[10px] font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Play className="h-2.5 w-2.5 fill-white" />
              Video
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-3.5">
        <h3 className="text-sm font-semibold text-surface-900 leading-tight mb-0.5 group-hover:text-brand-600 transition-colors">
          {technique.nameLocal || technique.name}
        </h3>
        <p className="text-[11px] text-surface-400 mb-2">{technique.region}</p>
        <p className="text-[11px] text-surface-500 leading-snug line-clamp-2 mb-3">
          {technique.mechanism}
        </p>
        <button className="w-full h-8 text-xs font-medium border border-surface-200 rounded-lg hover:bg-surface-50 text-surface-600 hover:text-surface-900 transition-colors flex items-center justify-center gap-1.5">
          <BookOpen className="h-3 w-3" />
          Ver técnica completa
        </button>
      </CardContent>
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function OsteopathyPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [playerTechnique, setPlayerTechnique] = useState<ExerciseData | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);

  const filtered = ALL_TECHNIQUES.filter((t) => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.nameLocal?.toLowerCase().includes(search.toLowerCase())) ||
      t.region.toLowerCase().includes(search.toLowerCase()) ||
      t.mechanism.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  function openPlayer(index: number) {
    setPlayerIndex(index);
    setPlayerTechnique(filtered[index]);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Biblioteca de Osteopatía" />
        <main className="flex-1 overflow-y-auto">

          {/* Toolbar */}
          <div className="sticky top-0 z-10 border-b border-surface-200 bg-white px-6 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar técnicas, regiones..."
                  className="ps-9"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                      activeCategory === cat.key
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                    )}
                  >
                    {cat.label}
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      activeCategory === cat.key ? "bg-white/20 text-white" : "bg-surface-200 text-surface-500"
                    )}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="p-6 max-w-7xl mx-auto">
            <p className="text-sm text-surface-500 mb-4">
              <span className="font-semibold text-surface-900">{filtered.length}</span> técnicas encontradas
            </p>
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((t, i) => (
                  <TechniqueCard
                    key={t.id}
                    technique={t}
                    onPlay={() => openPlayer(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-surface-400 mb-2">No se encontraron técnicas</p>
                <button onClick={() => { setSearch(""); setActiveCategory("all"); }}
                  className="text-sm text-brand-600 hover:underline">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Player Modal */}
      {playerTechnique && (
        <ExercisePlayer
          exercise={playerTechnique}
          isOpen={!!playerTechnique}
          onClose={() => setPlayerTechnique(null)}
          onPrev={() => openPlayer(Math.max(0, playerIndex - 1))}
          onNext={() => openPlayer(Math.min(filtered.length - 1, playerIndex + 1))}
          hasPrev={playerIndex > 0}
          hasNext={playerIndex < filtered.length - 1}
        />
      )}
    </div>
  );
}
