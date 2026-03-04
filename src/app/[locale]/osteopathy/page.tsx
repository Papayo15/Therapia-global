"use client";

import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExercisePlayer, type ExerciseData } from "@/components/exercises/ExercisePlayer";
import {
  AnimHepaticPump,
  AnimMesentericRelease,
  AnimKidneyMobilization,
  AnimColonRelease,
  AnimCV4,
  AnimSBS,
  AnimFrontalLift,
  AnimHVLALumbarRoll,
  AnimMuscleEnergySacrum,
  AnimThoracicThrust,
  AnimCounterstrain,
  AnimMETCervical,
} from "@/components/exercises/OsteopathyAnimations";

// ─── Técnicas de osteopatía con instrucciones completas ──────────────────────
const ALL_TECHNIQUES: (ExerciseData & { category: string; mechanism: string; contraindications_brief?: string })[] = [
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
      "Paciente en supino, terapeuta a su derecha.",
      "Coloca ambas manos sobre el hipocondrio derecho, solapadas.",
      "Aplica una compresión suave y rítmica hacia el diafragma (2 por segundo).",
      "Mantén 30–60 segundos. La presión debe ser tolerable — nunca dolorosa.",
      "Busca el 'punto de quietud' hepática y mantén hasta sentir la relajación.",
    ],
    tip: "Si el paciente restringe la respiración, pídele que exhale profundo. La respiración amplifica el efecto.",
    contraindications: "Hepatitis aguda, cirrosis avanzada, carcinoma hepático activo.",
    AnimComponent: AnimHepaticPump,
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
      "Paciente en supino, piernas ligeramente flexionadas.",
      "Palpa la raíz del mesenterio: desde el ombligo hacia la fosa ilíaca derecha.",
      "Con ambas manos, eleva suavemente los tejidos hacia el esternón.",
      "Sigue la dirección de menor resistencia (sigue el tejido, no lo fuerzas).",
      "Mantén 30–90 segundos hasta sentir la liberación (sensación de 'soltar').",
    ],
    tip: "Pide al paciente que flexione las rodillas — relaja los psoas y facilita el acceso al mesenterio.",
    contraindications: "Obstrucción intestinal aguda, post-cirugía abdominal reciente (<6 semanas).",
    AnimComponent: AnimMesentericRelease,
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
      "Paciente en decúbito lateral, riñón a tratar hacia arriba.",
      "Mano posterior bajo el flanco, mano anterior en la zona lumbar anterior.",
      "Pinza bimanual suave: acerca ambas manos sin presión excesiva.",
      "Sigue el movimiento renal en la respiración: baja con la inspiración.",
      "En la expiración, guía ligeramente el riñón en la dirección restringida.",
    ],
    tip: "La palpación renal directa requiere práctica. Si no encuentras el riñón, busca la tensión perirrenal.",
    contraindications: "Litiasis renal aguda, pielonefritis activa, trauma renal reciente.",
    AnimComponent: AnimKidneyMobilization,
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
    keyPoint: "Sigue el marco cólico: derecha → transverso → izquierda.",
    steps: [
      "Paciente en supino, piernas relajadas.",
      "Inicia en el colon ascendente (fosa ilíaca derecha): presión suave hacia la izquierda.",
      "Desliza ambas manos siguiendo el colon transverso de derecha a izquierda.",
      "Termina en el colon descendente, guiando hacia la fosa ilíaca izquierda.",
      "Cada segmento: 15–30 segundos con presión suave y continua.",
    ],
    tip: "Si hay resistencia, NO fuerces. Espera a que el tejido ceda (puede tardar 20–30 segundos).",
    contraindications: "Cólico agudo activo, sospecha de vólvulo, colitis ulcerosa en brote.",
    AnimComponent: AnimColonRelease,
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
      "Paciente en supino, cabeza del terapeuta a sus pies o a su cabecera.",
      "Coloca los tenar de ambas manos bajo el occipital (protuberancias occipitales laterales).",
      "NO apliques fuerza — solo mantén el contacto y siente el ritmo craneal.",
      "En la fase de flexión del MRP, añade una resistencia mínima para no dejar que se expanda.",
      "Espera el still point (2–10 segundos de pausa). Mantén hasta sentir la reanudación ampliada.",
    ],
    tip: "Tus manos reciben información más que aplican fuerza. La presión debe ser de 5–10 gramos.",
    contraindications: "Hipertensión intracraneal, trauma craneal agudo, hemorragia subaracnoidea.",
    AnimComponent: AnimCV4,
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
    keyPoint: "Las 6 patrones de la SBS (flexión, extensión, torsión, inclinación lateral, compresión, rotación) tienen tratamientos distintos.",
    steps: [
      "Paciente en supino, terapeuta sentado a la cabecera.",
      "Mano derecha sobre el esfenoides (alas mayores), mano izquierda sobre el occipital.",
      "Siente el MRP: la fase de flexión eleva el esfenoides y el occipital se aplana.",
      "Identifica el patrón de disfunción (dirección restringida).",
      "Sigue la dirección de facilidad hasta el still point. Espera la corrección.",
    ],
    tip: "Este es el examen más sutil de la osteopatía craneal. Requiere 200+ horas de práctica para ser fiable.",
    contraindications: "Trauma craneal agudo, fractura de base de cráneo, tumor craneal.",
    AnimComponent: AnimSBS,
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
      "Paciente en supino, terapeuta sentado a la cabecera.",
      "Coloca los pulgares sobre el hueso frontal, paralelos a la línea de pelo.",
      "Siente el movimiento del frontal en el MRP: avanza en flexión, retrocede en extensión.",
      "En la fase de extensión, aplica un leve lift anterior (0.5–1 mm).",
      "Mantén hasta el still point y la posterior ampliación del movimiento.",
    ],
    tip: "Si el paciente tiene dolor de cabeza, este contacto puede ser muy sensible. Comienza con presión mínima.",
    AnimComponent: AnimFrontalLift,
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
    keyPoint: "La barrera se alcanza SIN fuerza — el thrust es pequeño y rápido sobre la barrera.",
    steps: [
      "Paciente en decúbito lateral, segmento a tratar hacia arriba.",
      "Flexiona la cadera superior y la rodilla a 90°. Estabiliza el hombro superior.",
      "Localiza el segmento a tratar palpando los procesos espinosos.",
      "Crea la tensión de palanca: rodilla hacia abajo, hombro hacia atrás.",
      "Thrust corto y rápido sobre la pelvis en el momento de máxima tensión.",
    ],
    tip: "Si escuchas cavitación (clic), es normal pero no necesario. La técnica es efectiva sin sonido.",
    contraindications: "Osteoporosis grave, hernia discal con neurológico activo, fractura vertebral.",
    AnimComponent: AnimHVLALumbarRoll,
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
    keyPoint: "Contracción del 20% de la fuerza máxima — suficiente para activar el mecanismo muscular.",
    steps: [
      "Paciente en decúbito prono, terapeuta al lado del sacro a tratar.",
      "Flexiona la rodilla ipsilateral a 90°. Palpa el sacro con la mano homolateral.",
      "Lleva el pie hacia el exterior (rotación interna de cadera) hasta la barrera.",
      "Pide al paciente: 'Lleva el pie hacia dentro contra mi resistencia, 5 segundos'.",
      "Tras la contracción, avanza la palanca al nuevo rango. Repite 3 veces.",
    ],
    tip: "Tras las 3 contracciones, el rango de movimiento debe haber aumentado notablemente.",
    AnimComponent: AnimMuscleEnergySacrum,
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
    keyPoint: "La posición del paciente (brazos cruzados) determina el nivel de palanca.",
    steps: [
      "Paciente en supino, brazos cruzados sobre el pecho.",
      "Terapeuta de pie, inclínate sobre el paciente para localizar el segmento.",
      "Coloca tu mano hipotenar directamente sobre el proceso espinoso a tratar.",
      "El pecho del terapeuta contacta los brazos del paciente.",
      "Thrust rápido hacia abajo en la espiración del paciente.",
    ],
    tip: "Pide al paciente que exhale antes del thrust — relaja los músculos paravertebrales.",
    contraindications: "Osteoporosis, fracturas vertebrales, mielopatía torácica.",
    AnimComponent: AnimThoracicThrust,
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
      "Localiza el tender point: punto doloroso a la palpación (VAS ≥7/10).",
      "Califica el dolor del 0 al 10 mientras lo palpas.",
      "Mueve al paciente hasta que el dolor baje a ≤3/10 o desaparezca.",
      "Mantén esa posición 90 segundos SIN moverte ni hablar.",
      "Retorna lentamente a posición neutra (3–5 segundos). Reclasifica el tender point.",
    ],
    tip: "Si el dolor no baja al 70%, la posición no es correcta. Ajusta 1–2 mm y reevalúa.",
    AnimComponent: AnimCounterstrain,
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
      "Paciente sentado o supino, terapeuta detrás o al lado.",
      "Lleva la cabeza hasta la barrera de movimiento (donde empieza la resistencia).",
      "Pide: 'Gira la cabeza hacia mi mano (contracción del 20%), 5 segundos'.",
      "Mantén la resistencia sin moverte. Tras 5 segundos: 'Relaja'.",
      "Avanza a la nueva barrera. Repite 3–5 veces.",
    ],
    tip: "Tras cada ciclo el rango debe aumentar. Si no, revisa la localización de la barrera.",
    contraindications: "Insuficiencia vertebrobasilar, fractura cervical, mielopatía cervical.",
    AnimComponent: AnimMETCervical,
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

// ─── Tarjeta de técnica ───────────────────────────────────────────────────────
function TechniqueCard({
  technique,
  onPlay,
}: {
  technique: typeof ALL_TECHNIQUES[0];
  onPlay: () => void;
}) {
  const AnimComp = technique.AnimComponent;
  return (
    <Card className="group overflow-hidden hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 border border-surface-200 bg-white cursor-pointer" onClick={onPlay}>
      {/* Animación */}
      <div className="relative overflow-hidden bg-surface-900" style={{ aspectRatio: "16/10" }}>
        {AnimComp ? (
          <div className="w-full h-full p-3 flex items-center justify-center pointer-events-none">
            <AnimComp />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
            <span className="text-4xl opacity-40">🩺</span>
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl">
            <span className="text-brand-600 text-xl font-bold">▶</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 start-2 z-10">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", CATEGORY_COLORS[technique.category])}>
            {technique.category.charAt(0).toUpperCase() + technique.category.slice(1)}
          </span>
        </div>
        <div className="absolute top-2 end-2 z-10">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", DIFFICULTY_COLORS[technique.difficulty])}>
            {DIFFICULTY_LABEL[technique.difficulty]}
          </span>
        </div>
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
