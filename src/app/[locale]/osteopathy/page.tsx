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
import { REGION_CONTENT, ANATOMY_LAYERS } from "@/lib/anatomyData";
import { OSTEOPATHY_REGISTRY } from "@/lib/osteopathyRegistry";
import { useTranslations } from "next-intl";
import exerciseRegistry from "@registry/exercises.json";

// Maps osteopathy body region keys → anatomy content keys
const OSTEO_REGION_TO_ANATOMY: Record<string, string> = {
  cervical: "cervical",
  toracica: "thoracic",
  lumbar:   "lumbar",
  cadera:   "hip",
  hombro:   "shoulder",
  rodilla:  "knee",
  tobillo:  "ankle",
  codo:     "elbow",
  munieca:  "wrist",
};

function OsteoAnatomyPanel({ bodyRegion }: { bodyRegion: string }) {
  const [activeLayer, setActiveLayer] = useState<string>("anatomy");
  const key = OSTEO_REGION_TO_ANATOMY[bodyRegion];
  const content = REGION_CONTENT[key];
  if (!content) return null;
  const layer = ANATOMY_LAYERS.find((l) => l.key === activeLayer);
  const items = content[activeLayer as keyof typeof content];
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔬</span>
        <div>
          <h3 className="font-semibold text-blue-900 text-sm">Anatomía aplicada</h3>
          <p className="text-xs text-blue-600">Contexto clínico para las técnicas de esta región</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {ANATOMY_LAYERS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLayer(l.key)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all",
              activeLayer === l.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-700 border-blue-200 hover:border-blue-400"
            )}
          >
            {l.icon} {l.label}
          </button>
        ))}
      </div>
      <div className={cn("rounded-xl border p-4 space-y-2", layer?.color ?? "bg-white border-blue-100")}>
        <ul className="space-y-1.5">
          {(items as string[]).map((item: string, i: number) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="mt-0.5 shrink-0 text-blue-400 font-bold">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type TechniqueEntry = ExerciseData & {
  category: string;
  mechanism: string;
  bodyRegion?: string;
  isChiropracticDerived?: boolean;
};

const BASE_TECHNIQUES: TechniqueEntry[] = [
  // ── VISCERAL ──────────────────────────────────────────────────────────────
  { id: "hepatic-pump", name: "Hepatic Pump", nameLocal: "Bomba Hepática", region: "Hígado · Hipocondrio derecho", difficulty: "intermediate", category: "visceral", mechanism: "Mejora el drenaje linfático y la circulación hepática mediante compresión rítmica.", musclesWorked: ["Cápsula de Glisson","Ligamentos hepatoduodenales","Sistema porta"], keyPoint: "El ritmo es la clave: 2 Hz. Demasiado rápido pierde efectividad linfática.", steps: ["POSICIÓN PACIENTE: Decúbito supino, brazos relajados a los lados.","POSICIÓN TERAPEUTA: De pie a la derecha del paciente, a la altura del tórax.","CONTACTO: Ambas manos superpuestas sobre el hipocondrio derecho, talón de mano sobre el reborde costal.","TÉCNICA: Aplicar compresión rítmica suave hacia el diafragma a 2 Hz (2 compresiones/segundo).","DURACIÓN: Mantener 30–60 segundos. Buscar el punto de quietud y mantener hasta sentir la relajación tisular.","RETEST: Palpar el hipocondrio y evaluar cambio en la tensión hepática."], tip: "Si el paciente restringe la respiración, pídele que exhale profundo. La respiración amplifica el efecto.", contraindications: "Hepatitis aguda, cirrosis avanzada, carcinoma hepático activo.", youtubeSearch: "hepatic pump osteopathy visceral technique" },
  { id: "mesenteric-release", name: "Mesenteric Release", nameLocal: "Liberación Mesentérica", region: "Intestino delgado · Raíz del mesenterio", difficulty: "intermediate", category: "visceral", mechanism: "Reduce adherencias viscerales y mejora la motilidad intestinal por liberación fascial.", musclesWorked: ["Raíz del mesenterio","Fascia peritoneal","Arteria mesentérica superior"], keyPoint: "El mesenterio va de L2 a la fosa ilíaca derecha — sigue ese vector.", steps: ["POSICIÓN PACIENTE: Supino con rodillas flexionadas a 45° para relajar los psoas.","POSICIÓN TERAPEUTA: De pie a la derecha, a la altura del abdomen.","CONTACTO: Yemas de los dedos de ambas manos en la zona umbilical, profundizando hacia la raíz del mesenterio.","EVALUACIÓN: Palpa la dirección de mayor restricción tisular.","TÉCNICA: Eleva suavemente los tejidos hacia el esternón, siguiendo la dirección de menor resistencia.","MANTENER: 30–90 segundos hasta sentir la liberación."], tip: "Rodillas flexionadas relajan los psoas y facilitan el acceso al mesenterio.", contraindications: "Obstrucción intestinal aguda, post-cirugía abdominal reciente (<6 semanas).", youtubeSearch: "mesenteric release osteopathy visceral manipulation technique" },
  { id: "kidney-mobilization", name: "Kidney Mobilization", nameLocal: "Movilización Renal Bimanual", region: "Riñón · Espacio retroperitoneal", difficulty: "advanced", category: "visceral", mechanism: "Restaura la movilidad renal para mejorar el drenaje venoso y linfático perirrenal.", musclesWorked: ["Fascia renal (Gerota)","Cápsula renal","Pedículo renal"], keyPoint: "El riñón se mueve 3–5 cm en respiración normal — eso es lo que buscamos liberar.", steps: ["POSICIÓN PACIENTE: Decúbito lateral (riñón a tratar hacia arriba), pierna superior flexionada.","POSICIÓN TERAPEUTA: De frente al paciente, a la altura del flanco.","CONTACTO POSTERIOR: Mano caudal bajo el flanco, dedos apuntando hacia la columna.","CONTACTO ANTERIOR: Mano craneal en la zona lumbar anterior, dedos hacia el riñón.","TÉCNICA — PINZA BIMANUAL: Acercar ambas manos hasta contactar el polo inferior renal.","MOVILIZACIÓN: En la espiración, guiar el riñón en la dirección restringida. Mantener 3–5 ciclos respiratorios."], tip: "La palpación renal directa requiere práctica. Si no encuentras el riñón, busca la tensión perirrenal.", contraindications: "Litiasis renal aguda, pielonefritis activa, trauma renal reciente.", youtubeSearch: "kidney mobilization osteopathy visceral technique" },
  { id: "colon-release", name: "Colon Release", nameLocal: "Liberación del Colon", region: "Colon ascendente · Transverso · Descendente", difficulty: "intermediate", category: "visceral", mechanism: "Restaura la movilidad del marco cólico y mejora el tránsito intestinal.", musclesWorked: ["Fascia parietal del colon","Haustras del colon","Bandas de Toldt"], keyPoint: "Sigue el marco cólico: ascendente → transverso → descendente.", steps: ["POSICIÓN PACIENTE: Supino, piernas relajadas, abdomen descubierto.","POSICIÓN TERAPEUTA: De pie a la derecha del paciente.","SEGMENTO 1 — COLON ASCENDENTE: Yemas de los dedos en la fosa ilíaca derecha. Presión suave hacia la izquierda y cefálicamente. 15–30 seg.","SEGMENTO 2 — COLON TRANSVERSO: Ambas manos bajo el reborde costal, deslizar de derecha a izquierda. 15–30 seg.","SEGMENTO 3 — COLON DESCENDENTE: Dedos en hipocondrio izquierdo, guiar hacia la fosa ilíaca izquierda. 15–30 seg.","RETEST: Palpar cada segmento y evaluar cambio en la tensión y movilidad."], tip: "Si hay resistencia, NO fuerces. Espera a que el tejido ceda — puede tardar 20–30 segundos.", contraindications: "Cólico agudo activo, sospecha de vólvulo, colitis ulcerosa en brote.", youtubeSearch: "colon release osteopathy visceral manipulation large intestine" },
  { id: "gastric-mobilization", name: "Gastric Mobilization", nameLocal: "Movilización Gástrica", region: "Estómago · Hipocondrio izquierdo", difficulty: "intermediate", category: "visceral", mechanism: "Restaura la movilidad del estómago y alivia el espasmo del cardias y el píloro.", musclesWorked: ["Ligamento gastroesplénico","Epiplón menor","Cardias","Píloro"], keyPoint: "El estómago rota levemente con la respiración — sigue ese movimiento.", steps: ["POSICIÓN PACIENTE: Supino con rodillas flexionadas 30°. Abdomen descubierto.","PALPACIÓN: Dedos bajo el reborde costal izquierdo, profundizando hasta contactar el cuerpo gástrico.","ESCUCHA: Siente el movimiento gástrico con la respiración y el ritmo visceral (4–8 ciclos/min).","MOVILIZACIÓN CARDIAS: Mano izquierda en hipocondrio izquierdo, suave tracción caudal.","MOVILIZACIÓN PÍLORO: Mano derecha en epigastrio medio-derecho, tracción suave medial y cefálica.","MANTENER: 30–60 seg hasta sentir la relajación."], tip: "Indicado en reflujo gastroesofágico, gastroparesia funcional y dolor epigástrico.", contraindications: "Úlcera péptica activa, hemorragia digestiva alta.", youtubeSearch: "gastric mobilization osteopathy visceral stomach technique" },
  { id: "splenic-pump", name: "Splenic Pump", nameLocal: "Bomba Esplénica", region: "Bazo · Hipocondrio izquierdo", difficulty: "intermediate", category: "visceral", mechanism: "Estimula la liberación de células inmunes del bazo mediante compresión rítmica.", musclesWorked: ["Cápsula esplénica","Ligamento esplenofrémico","Ligamento gastroesplénico"], keyPoint: "Especialmente útil en infecciones agudas — potencia la respuesta inmune.", steps: ["POSICIÓN PACIENTE: Supino, brazo izquierdo relajado.","CONTACTO: Mano izquierda bajo el hipocondrio izquierdo (posterior), mano derecha anterior. Contacto bimanual.","TÉCNICA — BOMBA: Compresión anterior-posterior suave y rítmica a 2 Hz durante 30 segundos.","TÉCNICA — ESTIRAMIENTO: En inspiración profunda, tracciona suavemente el bazo caudalmente. Mantén 5 segundos.","REPETIR: 3–5 ciclos de bomba + estiramiento.","RETEST: Revalúa la tensión esplénica al finalizar."], tip: "Contraindicado en esplenomegalia severa — palpa primero.", contraindications: "Esplenomegalia severa, mononucleosis infecciosa activa, trombocitopenia.", youtubeSearch: "splenic pump osteopathy visceral technique immune lymphatic" },
  { id: "bladder-release", name: "Bladder Release", nameLocal: "Liberación de Vejiga", region: "Vejiga · Pelvis anterior", difficulty: "intermediate", category: "visceral", mechanism: "Libera las tensiones del peritoneo vesical para mejorar la función urinaria.", musclesWorked: ["Peritoneo vesical","Ligamentos vesicouterinos","Fascia pubovesical","Músculo detrusor"], keyPoint: "El paciente debe haber vaciado la vejiga antes de la técnica.", steps: ["POSICIÓN PACIENTE: Supino, rodillas flexionadas. Vejiga vacía (fundamental).","CONTACTO: Superposición de manos sobre el pubis y el hipogastrio.","ESCUCHA: Palpa el movimiento vesical en el ritmo visceral.","TÉCNICA INDUCCIÓN: Sigue la dirección de mayor facilidad de movimiento.","LIBERACIÓN: Mantén el tejido en la posición de facilidad hasta sentir el release (30–90 seg).","RETEST: El calor local y disminución de tensión son señales positivas."], tip: "Útil en disfunción urinaria funcional, cistitis intersticial y disfunción del suelo pélvico.", contraindications: "Infección urinaria activa, tumor vesical.", youtubeSearch: "bladder release osteopathy visceral pelvic technique" },
  // ── CRANEAL ───────────────────────────────────────────────────────────────
  { id: "cv4", name: "CV4 Compression", nameLocal: "Compresión del 4° Ventrículo", region: "Occipital · 4° ventrículo", difficulty: "advanced", category: "craneal", mechanism: "Actúa sobre el mecanismo respiratorio primario comprimiendo el 4° ventrículo.", musclesWorked: ["Occipital","Líquido cefalorraquídeo","Dura madre craneal"], keyPoint: "El still point (pausa del MRP) es el momento terapéutico — no interrumpas.", steps: ["POSICIÓN PACIENTE: Supino, sin almohada, cabeza centrada.","CONTACTO: Coloca los tenar de ambas manos bajo el occipital, contactando las protuberancias occipitales laterales.","ESCUCHA: Siente el MRP sin aplicar fuerza. Frecuencia normal: 8–12 ciclos/min.","TÉCNICA: En la fase de FLEXIÓN del MRP, añade una resistencia mínima. Presión: 5–10 gramos.","STILL POINT: Mantén hasta que el MRP se detenga (2–30 segundos).","FINALIZAR: Espera hasta que el ritmo se reanude con mayor amplitud y suavidad."], tip: "Tus manos reciben información más que aplican fuerza. Si no sientes el MRP, relaja más tus manos.", contraindications: "Hipertensión intracraneal, trauma craneal agudo, hemorragia subaracnoidea.", youtubeSearch: "CV4 compression fourth ventricle osteopathy cranial technique" },
  { id: "sbs", name: "Sphenobasilar Synchondrosis", nameLocal: "Evaluación de la SBS", region: "Esfenoides · Occipital", difficulty: "expert", category: "craneal", mechanism: "Evalúa y corrige las tensiones del mecanismo respiratorio primario en la SBS.", musclesWorked: ["Esfenoides","Occipital","Huesos temporales","Sacro (por reciprocidad)"], keyPoint: "6 patrones de la SBS: flexión/extensión, torsión D/I, inclinación lateral, compresión.", steps: ["POSICIÓN PACIENTE: Supino sin almohada. Cabeza centrada y relajada.","CONTACTO ESFENOIDES: Pulgares sobre las alas mayores del esfenoides (lateral a las órbitas).","CONTACTO OCCIPITAL: Tenar bajo las escamas occipitales.","ESCUCHA MRP: Siente la flexión y extensión. Identifica el patrón de disfunción.","CORRECCIÓN: Sigue la dirección de facilidad hasta el still point.","ESPERAR: La corrección espontánea ocurre al reanudarse el MRP."], tip: "Este es el examen más sutil de la osteopatía craneal. Requiere 200+ horas de práctica.", contraindications: "Trauma craneal agudo, fractura de base de cráneo, tumor craneal.", youtubeSearch: "sphenobasilar synchondrosis SBS osteopathy cranial sacral technique" },
  { id: "frontal-lift", name: "Frontal Lift", nameLocal: "Elevación del Frontal", region: "Hueso frontal", difficulty: "intermediate", category: "craneal", mechanism: "Libera la sutura coronal y mejora el drenaje del seno frontal.", musclesWorked: ["Hueso frontal","Sutura coronal","Seno frontal","Fascia epicraneal"], keyPoint: "Muy efectivo en migraña frontal y sinusitis crónica.", steps: ["POSICIÓN PACIENTE: Supino sin almohada.","CONTACTO: Pulgares sobre el hueso frontal paralelos a la línea de pelo (1–2 cm del nacimiento del cabello).","ESCUCHA: Siente el movimiento del frontal en el MRP.","TÉCNICA: En la fase de EXTENSIÓN, aplica un leve lift anterior de 0.5–1 mm.","MANTENER: Espera el still point.","FINALIZAR: El seno frontal puede drenar — el paciente puede sentir presión que se libera."], tip: "Si el paciente tiene cefalea, este contacto puede ser muy sensible. Comienza con presión mínima.", youtubeSearch: "frontal lift craniosacral osteopathy frontal bone technique" },
  { id: "temporal-rocking", name: "Temporal Rocking", nameLocal: "Balanceo de Temporales", region: "Huesos temporales · Oídos", difficulty: "intermediate", category: "craneal", mechanism: "Normaliza el movimiento de los temporales para mejorar el drenaje del oído medio.", musclesWorked: ["Hueso temporal","ATM","Oído medio","Nervio auricular"], keyPoint: "El temporal rota en torno a un eje oblicuo — rotación interna/externa.", steps: ["POSICIÓN PACIENTE: Supino sin almohada, mandíbula relajada.","CONTACTO: Pulgares sobre el proceso mastoideo. Dedos 3-4 en los arcos cigomáticos.","ESCUCHA MRP: Siente la rotación externa e interna del temporal.","EVALUACIÓN: Determina si hay asimetría en la rotación.","CORRECCIÓN: Sigue el temporal en la dirección de facilidad hasta el still point.","ESPERAR: La normalización del ritmo es la señal de éxito."], tip: "Indicado en tinnitus, vértigo posicional, otitis media recurrente y ATM.", contraindications: "Colesteatoma, cirugía de oído reciente, fractura de peñasco.", youtubeSearch: "temporal rocking craniosacral osteopathy temporal bone technique" },
  { id: "parietal-lift", name: "Parietal Lift", nameLocal: "Elevación de Parietales", region: "Huesos parietales · Sutura sagital", difficulty: "intermediate", category: "craneal", mechanism: "Libera la sutura sagital y mejora el drenaje venoso del seno longitudinal superior.", musclesWorked: ["Huesos parietales","Sutura sagital","Seno longitudinal superior","Hoz del cerebro"], keyPoint: "Muy efectivo en cefaleas tensionales crónicas y migraña con aura.", steps: ["POSICIÓN PACIENTE: Supino sin almohada.","CONTACTO: Palmas de ambas manos cubriendo los parietales desde la sutura coronal hasta la lambdoidea.","ESCUCHA: Siente la expansión lateral de los parietales en flexión craneal del MRP.","TÉCNICA: Aplica un leve lift superior de 1–2 mm en la fase de flexión. Fuerza: 5–15 gramos.","MANTENER: Espera el still point.","FINALIZAR: El seno longitudinal puede drenar — el paciente puede sentir calor en el vertex."], tip: "Pulsaciones en la cabeza durante la técnica son señal de activación del seno venoso — normal.", contraindications: "Hipertensión intracraneal, craneotomía previa.", youtubeSearch: "parietal lift craniosacral osteopathy parietal bone sagittal suture" },
  // ── ESTRUCTURAL — CERVICAL ────────────────────────────────────────────────
  { id: "met-cervical", name: "MET Cervical", nameLocal: "MET Cervical — Muscle Energy", region: "Cervical C1–C7", difficulty: "intermediate", category: "structural", bodyRegion: "cervical", mechanism: "Contracciones isométricas para corregir disfunciones de movimiento cervical.", musclesWorked: ["Esternocleidomastoideo","Escalenos","Suboccipitales","Músculos profundos cervicales"], keyPoint: "Localiza la barrera antes de pedir la contracción — la MET actúa EN la barrera.", steps: ["POSICIÓN PACIENTE: Supino sin almohada (o sentado si es C1–C3).","EVALUACIÓN: Evalúa rotación, flexión lateral y flexión/extensión. Identifica la barrera.","PALANCA: Lleva la cabeza hasta la barrera de movimiento. No pases la barrera.","MET: 'Gira suavemente la cabeza hacia mi mano, 20% de fuerza, 5 segundos'. Resiste isométricamente.","CICLO: Tras 5 seg: Relaja. Espera 2–3 seg. Avanza a la nueva barrera.","REPETIR: 3–5 veces. Compara el rango inicial con el final."], tip: "Tras cada ciclo el rango debe aumentar. Si no, revisa la localización de la barrera.", contraindications: "Insuficiencia vertebrobasilar, fractura cervical, mielopatía cervical.", youtubeSearch: "muscle energy technique cervical spine osteopathy MET neck" },
  { id: "oa-decompression", name: "OA Decompression", nameLocal: "Descompresión Occipitoatlantal", region: "Articulación occipitoatlantal C0–C1", difficulty: "intermediate", category: "structural", bodyRegion: "cervical", mechanism: "Descomprime la articulación occipitoatlantal para liberar la base del cráneo y los nervios suboccipitales.", musclesWorked: ["Suboccipitales","Recto posterior mayor y menor","Oblicuo inferior y superior","Ligamento atlanto-occipital"], keyPoint: "La tracción es de gramos, no kilogramos — es una energía, no una fuerza.", steps: ["POSICIÓN PACIENTE: Supino sin almohada, cabeza centrada.","CONTACTO: Yemas de los dedos (2–5) bilateralmente bajo las apófisis mastoides, contactando el arco posterior del atlas.","ESCUCHA: Siente el ritmo craniosacro y la tensión del tejido suboccipital.","TÉCNICA: Aplica una tracción axial suavísima (50–100 g) hacia cefálico y ligeramente posterior.","MANTENER: 30–90 segundos hasta sentir la descompresión (el tejido 'cede' entre tus dedos).","RETEST: El rango de extensión cervical debe aumentar y el dolor suboccipital disminuir."], tip: "Indicado en cefalea occipital, vértigo cervicogénico y restricción post-traumática C0–C1.", contraindications: "Inestabilidad atlantoaxial (Down, AR, trauma), fractura de odontoides.", youtubeSearch: "occipitoatlantal decompression OA osteopathy suboccipital release" },
  { id: "cervical-articulatory", name: "Cervical Articulatory", nameLocal: "Articulatoria Cervical", region: "Cervical C1–C7", difficulty: "beginner", category: "structural", bodyRegion: "cervical", mechanism: "Mejora el rango articular cervical mediante movilización pasiva rítmica en todos los planos.", musclesWorked: ["Articulaciones cigapofisarias C1–C7","Músculos paravertebrales cervicales","Ligamentos interespinosos cervicales"], keyPoint: "La articulatoria es la técnica de entrada — prepara el tejido para técnicas más específicas.", steps: ["POSICIÓN PACIENTE: Supino sin almohada.","POSICIÓN TERAPEUTA: A la cabecera, manos envolviendo occipital y cervicales.","FASE 1 — FLEXIÓN/EXTENSIÓN: Movimiento pasivo suave en F/E. 10 repeticiones.","FASE 2 — INCLINACIÓN LATERAL: 10 repeticiones cada lado. Pausa en la barrera.","FASE 3 — ROTACIÓN: 10 repeticiones cada lado.","FASE 4 — TRACCIÓN AXIAL: 3 tracciones de 5 segundos con pausa."], tip: "Ritmo lento y controlado. El paciente debe estar completamente relajado — si hay tensión, para y redirige.", contraindications: "Inestabilidad cervical, fractura aguda, mielopatía.", youtubeSearch: "cervical articulatory technique osteopathy cervical spine mobility" },
  { id: "suboccipital-inhibition", name: "Suboccipital Inhibition", nameLocal: "Inhibición Suboccipital", region: "Suboccipital · Base del cráneo", difficulty: "beginner", category: "structural", bodyRegion: "cervical", mechanism: "Inhibe el hipertono de los músculos suboccipitales mediante presión sostenida sobre los puntos de inserción.", musclesWorked: ["Recto posterior mayor y menor","Oblicuo superior e inferior","Fascia nucal","Nervio occipital mayor"], keyPoint: "La inhibición es la técnica más segura de la osteopatía — indicada en prácticamente todo.", steps: ["POSICIÓN PACIENTE: Supino sin almohada, cabeza ligeramente flexionada.","CONTACTO: Yemas de los dedos (2–4) bilateralmente en la línea nucal inferior, medial a las apófisis mastoides.","PRESIÓN: Aplica una presión firme pero no dolorosa (5–7 en escala de 10 es ideal).","SOSTENER: Mantén la presión constante. El tejido ceddrá en 60–90 segundos.","SEÑAL: El paciente referirá calor, hormigueo o una sensación de 'soltarse' en los hombros.","FINALIZAR: Libera gradualmente. El ROM de extensión cervical mejorará inmediatamente."], tip: "Muy efectivo en cefalea tensional, migraña cervicogénica y síndrome cruzado superior.", youtubeSearch: "suboccipital inhibition osteopathy cranial base technique" },
  { id: "atlas-rotation-met", name: "Atlas Rotation MET", nameLocal: "MET Rotación del Atlas (C1)", region: "Atlas · C1", difficulty: "advanced", category: "structural", bodyRegion: "cervical", mechanism: "Corrige la rotación fija del atlas respecto al axis mediante la contracción isométrica del oblicuo inferior.", musclesWorked: ["Oblicuo inferior de la cabeza","Recto posterior mayor","Ligamento transverso del atlas"], keyPoint: "El atlas rota bilateralmente hasta 45° — identifica cuál lado está restringido.", steps: ["POSICIÓN PACIENTE: Supino sin almohada.","EVALUACIÓN: Flexiona el cuello a 45° (bloquea C2–C7). Evalúa la rotación — el lado restringido es el atlas bloqueado.","PALANCA: Con cuello en 45° de flexión, rota la cabeza hasta la barrera del atlas restringido.","CONTACTO DE MONITOREO: Pulgar sobre el proceso transverso del atlas (entre mastoideo y mandíbula).","MET: 'Gira la cabeza suavemente hacia el lado contrario, 20% fuerza, 5 seg'. Resiste.","CICLO: 3–5 repeticiones. Revalúa la rotación al finalizar."], tip: "La flexión de 45° es ESENCIAL — sin ella no estás trabajando el atlas, trabajas toda la columna.", contraindications: "Inestabilidad atlantoaxial, fractura de odontoides, síndrome de Down.", youtubeSearch: "atlas C1 MET muscle energy technique osteopathy atlantoaxial rotation" },
  { id: "cervical-fpr", name: "Cervical FPR", nameLocal: "FPR Cervical — Liberación Posicional Facilitada", region: "Cervical C2–C7", difficulty: "intermediate", category: "structural", bodyRegion: "cervical", mechanism: "Reduce el espasmo reflejo mediante la posición de máximo confort con adición de fuerza facilitadora.", musclesWorked: ["Paravertebrales cervicales","Escalenos","Esternocleidomastoideo","Articulaciones facetarias"], keyPoint: "FPR = Counterstrain + fuerza facilitadora. La posición es la misma pero añades una compresión axial.", steps: ["EVALUACIÓN: Localiza el punto de disfunción con palpación.","POSICIÓN DE CONFORT: Mueve al paciente hacia la posición de menor sensibilidad (igual que Counterstrain).","FUERZA FACILITADORA: Una vez en la posición de confort, añade una ligera compresión axial (100–200 g) hacia el segmento disfuncional.","MANTENER: Solo 3–5 segundos (mucho menos que Counterstrain). El cambio es más rápido.","RETORNO: Regresa lentamente a posición neutra.","RETEST: El tender point debe haber desaparecido o reducido >70%."], tip: "La FPR es más rápida que el Counterstrain (5 seg vs 90 seg). Útil cuando tienes múltiples puntos que tratar.", youtubeSearch: "facilitated positional release FPR cervical spine osteopathy" },
  // ── ESTRUCTURAL — TORÁCICA ─────────────────────────────────────────────────
  { id: "met-thoracic", name: "MET Thoracic", nameLocal: "MET Torácica", region: "Columna torácica T1–T12", difficulty: "intermediate", category: "structural", bodyRegion: "toracica", mechanism: "Contracciones isométricas para corregir rotaciones y disfunciones de tipo I y II en la columna torácica.", musclesWorked: ["Erector spinae torácico","Rotadores torácicos","Multífidos","Articulaciones facetarias"], keyPoint: "Identifica si es disfunción tipo I (grupo neutro) o tipo II (no-neutro) — la palanca cambia.", steps: ["POSICIÓN PACIENTE: Sentado a horcajadas, manos entrelazadas detrás de la nuca.","POSICIÓN TERAPEUTA: Detrás del paciente. Pasa los brazos por debajo de las axilas.","EVALUACIÓN: Introduce rotación torácica hasta localizar el nivel disfuncional.","PALANCA: Lleva al paciente hasta la BARRERA de movimiento.","MET: 'Empuja suavemente hacia mí, 20% de fuerza, 5 segundos'. Resiste isométricamente.","CICLO: Libera, espera 2 seg, avanza. Repite 3–5 veces."], tip: "Para T1–T4 inclina ligeramente al paciente hacia adelante. Para T9–T12 requiere menos flexión.", contraindications: "Fracturas vertebrales, osteoporosis severa, compresión medular.", youtubeSearch: "muscle energy technique thoracic spine osteopathy MET thorax" },
  { id: "rib-raising", name: "Rib Raising", nameLocal: "Elevación Costal", region: "Caja torácica · Costillas 1–12", difficulty: "beginner", category: "structural", bodyRegion: "toracica", mechanism: "Estimula la cadena simpática paravertebral al movilizar las costillas.", musclesWorked: ["Articulaciones costovertebrales","Músculos intercostales","Cadena simpática T1–L2","Fascia endotorácica"], keyPoint: "El efecto es tanto estructural como neurovegetativo — estimula el simpático thoracolumbar.", steps: ["POSICIÓN PACIENTE: Supino, brazos relajados.","CONTACTO: Yemas de los dedos bilateralmente bajo las cabezas costales, a nivel de los ángulos costales.","TÉCNICA: En la ESPIRACIÓN del paciente, aplica una presión anterior y lateral — eleva las costillas.","PROGRESIÓN: Comienza en costillas 10–12 y avanza hacia costillas 1–3.","RITMO: Sincroniza con la respiración. 3–5 ciclos por nivel costal.","RETEST: La expansión torácica debe mejorar tras la técnica."], tip: "Indicado en atelectasia, asma y disfunción simpática visceral.", contraindications: "Fractura costal, osteoporosis severa, metástasis costales.", youtubeSearch: "rib raising osteopathy thoracic sympathetic technique" },
  { id: "first-rib-met", name: "First Rib MET", nameLocal: "MET Primera Costilla", region: "Primera costilla · C7–T1", difficulty: "intermediate", category: "structural", bodyRegion: "toracica", mechanism: "Libera la restricción de la primera costilla que puede comprometer el plexo braquial y la arteria subclavia.", musclesWorked: ["Escaleno anterior y medio","Escaleno posterior","Esternocleidomastoideo","Articulación costotransversa T1"], keyPoint: "La 1ª costilla alta es causa frecuente de parestesias en el brazo — siempre palparla.", steps: ["EVALUACIÓN: Palpa la primera costilla (entre el trapecio superior y la clavícula). Compara altura bilateral.","POSICIÓN PACIENTE: Sentado, cabeza inclinada 45° hacia el lado afecto.","CONTACTO: Pulgar o yema del dedo índice sobre el ángulo posterior de la 1ª costilla.","PALANCA: Inclina la cabeza hacia el lado contrario hasta notar tensión en la 1ª costilla.","MET: 'Inclina la cabeza hacia tu hombro derecho contra mi resistencia, 20% fuerza, 5 seg'.","CICLO: 3 repeticiones. La costilla debe descender palpablemente."], tip: "Si el paciente tiene parestesias en el 4º y 5º dedo, la 1ª costilla es el primer lugar a evaluar.", contraindications: "Tumor de Pancoast, fractura de clavícula, trombosis de la subclavia.", youtubeSearch: "first rib MET muscle energy osteopathy thoracic outlet" },
  { id: "thoracic-articulatory", name: "Thoracic Articulatory", nameLocal: "Articulatoria Torácica", region: "Columna torácica T1–T12", difficulty: "beginner", category: "structural", bodyRegion: "toracica", mechanism: "Mejora la movilidad torácica global mediante movilización pasiva rítmica en todos los planos.", musclesWorked: ["Articulaciones facetarias torácicas","Articulaciones costovertebrales","Ligamentos longitudinales","Músculos paravertebrales"], keyPoint: "La columna torácica necesita rotación y extensión — a menudo ambas están restringidas.", steps: ["POSICIÓN PACIENTE: Sentado con brazos cruzados sobre el pecho (o manos detrás de la nuca).","POSICIÓN TERAPEUTA: Detrás. Un brazo pasa por delante del paciente, mano sobre el hombro contralateral.","FASE 1 — ROTACIÓN: Rota el tronco pasivamente izquierda/derecha 10 veces cada lado.","FASE 2 — EXTENSIÓN: Mano libre en el segmento a movilizar. Extiende sobre tu mano. 5 veces.","FASE 3 — INCLINACIÓN: Inclinación lateral suave 10 veces cada lado.","GLOBALIZAR: Combina rotación + extensión para máximo efecto."], tip: "Excelente como técnica inicial antes de MET o BLT. Reduce la tensión y facilita el diagnóstico.", youtubeSearch: "thoracic articulatory technique osteopathy thoracic spine mobility" },
  { id: "thoracic-pump", name: "Thoracic Lymphatic Pump", nameLocal: "Bomba Linfática Torácica", region: "Caja torácica · Sistema linfático", difficulty: "beginner", category: "structural", bodyRegion: "toracica", mechanism: "Mejora el drenaje linfático torácico y pulmonar mediante presiones rítmicas sobre la caja torácica.", musclesWorked: ["Ducto torácico","Ganglios mediastínicos","Pulmones","Fascia endotorácica"], keyPoint: "Técnica de elección en infecciones respiratorias y congestión pulmonar.", steps: ["POSICIÓN PACIENTE: Supino, brazos relajados.","CONTACTO: Palmas de ambas manos sobre la pared anterior del tórax (esternal y parasternal).","TÉCNICA FASE 1: Compresión anterior suave sincronizada con la espiración. 10 ciclos.","TÉCNICA FASE 2: Mantén la compresión al final de la espiración 5 segundos, luego libera bruscamente para facilitar la inspiración.","TÉCNICA FASE 3: Vibración manual durante la espiración para movilizar secreciones.","FINALIZAR: 5 minutos de técnica continua. El paciente puede toser al final — es normal y positivo."], tip: "Combinar con rib raising y elevación del diafragma para máximo efecto en infecciones respiratorias.", contraindications: "Neumotórax, costillas fracturadas, pericarditis aguda.", youtubeSearch: "thoracic lymphatic pump osteopathy respiratory technique" },
  { id: "diaphragm-release", name: "Diaphragm Release", nameLocal: "Liberación del Diafragma", region: "Diafragma · T10–L2", difficulty: "intermediate", category: "structural", bodyRegion: "toracica", mechanism: "Libera las cúpulas diafragmáticas y los pilares para mejorar la mecánica respiratoria y la función visceral.", musclesWorked: ["Cúpulas diafragmáticas","Pilares del diafragma","Centro frénico","Hiato esofágico"], keyPoint: "El diafragma es el músculo más importante del cuerpo — cualquier restricción afecta todo.", steps: ["POSICIÓN PACIENTE: Supino, rodillas flexionadas.","CONTACTO: Yemas de los dedos bajo el reborde costal bilateral, justo debajo del xifoides.","FASE 1: Pide al paciente respiración profunda. En la INSPIRACIÓN, profundiza los dedos siguiendo el diafragma.","FASE 2: En la ESPIRACIÓN, aplica una ligera tracción anterior y cefálica.","MANTENER: 3–5 ciclos respiratorios hasta sentir la relajación del diafragma.","RETEST: La expansión torácica y abdominal debe ser simétrica y más amplia."], tip: "Indicado en EPOC, asma, reflujo y cualquier disfunción visceral abdominal.", contraindications: "Hernia de hiato grande, embarazo avanzado.", youtubeSearch: "diaphragm release osteopathy respiratory visceral technique" },
  // ── ESTRUCTURAL — LUMBAR ──────────────────────────────────────────────────
  { id: "met-sacrum", name: "MET Sacrum", nameLocal: "MET — Muscle Energy para Sacro", region: "Sacro · Ilion", difficulty: "intermediate", category: "structural", bodyRegion: "lumbar", mechanism: "Usa contracciones isométricas del paciente para corregir la torsión sacra.", musclesWorked: ["Piriforme","Glúteo mayor","Ligamentos sacroilíacos","Isquiotibiales"], keyPoint: "Contracción del 20% — suficiente para activar el mecanismo reflejo muscular.", steps: ["POSICIÓN PACIENTE: Decúbito prono, cara hacia abajo.","EVALUACIÓN: Palpa los surcos sacros para identificar el sacro posterior.","SETUP: Flexiona la rodilla ipsilateral a 90°. Mano sobre el sacro para monitorear.","PALANCA: Lleva el pie hacia el exterior (rotación interna de cadera) hasta la barrera sacra.","MET: 'Lleva el pie hacia dentro contra mi mano, 20% fuerza, 5 segundos'. Resiste.","CICLO: 3–5 repeticiones. El rango debe aumentar notablemente."], tip: "Tras las 3 contracciones el rango debe aumentar notablemente. Si no, revisa la identificación del sacro posterior.", youtubeSearch: "muscle energy technique sacrum osteopathy MET sacroiliac" },
  { id: "psoas-met", name: "Psoas MET", nameLocal: "MET Psoas — Músculo Iliopsoas", region: "Psoas · Lumbar · Cadera", difficulty: "intermediate", category: "structural", bodyRegion: "lumbar", mechanism: "Inhibe el espasmo del psoas y restaura la extensión lumbar mediante contracción isométrica.", musclesWorked: ["Psoas mayor","Psoas menor","Ilíaco","Articulaciones lumbares L1–L5"], keyPoint: "Un psoas corto mantiene L1–L4 en flexión permanente — es causa raíz de lumbalgia crónica.", steps: ["POSICIÓN PACIENTE: Decúbito supino en el borde de la camilla (prueba de Thomas modificada).","SETUP: El lado a tratar cuelga fuera de la camilla. El otro muslo flexionado y abrazado por el paciente.","EVALUACIÓN: Mide el ángulo de caída del muslo colgante — indica el grado de acortamiento del psoas.","PALANCA: Sostén la pierna colgante y lleva hasta la barrera de extensión de cadera.","MET: 'Eleva el muslo hacia el techo, 20% fuerza, 5 segundos'. Resiste isométricamente.","CICLO: 3–5 veces. La posición del muslo debe descender más tras cada contracción."], tip: "Combinar con estiramiento de psoas post-MET y ejercicios de control motor lumbar.", youtubeSearch: "psoas MET muscle energy technique osteopathy hip flexor lumbar" },
  { id: "lumbosacral-decompression", name: "Lumbosacral Decompression", nameLocal: "Descompresión Lumbosacra", region: "Unión lumbosacra L5–S1", difficulty: "beginner", category: "structural", bodyRegion: "lumbar", mechanism: "Descomprime la unión lumbosacra y el disco L5–S1 mediante tracción axial suave.", musclesWorked: ["Disco intervertebral L5–S1","Articulaciones facetarias L5–S1","Ligamento iliolumbar","Duramadre lumbosacra"], keyPoint: "La descompresión es segura y efectiva en hernia discal L5–S1 — no requiere manipulación.", steps: ["POSICIÓN PACIENTE: Supino, caderas y rodillas a 90° apoyadas en una almohada.","POSICIÓN TERAPEUTA: Al pie de la camilla.","CONTACTO: Manos envolviendo los tobillos del paciente.","TÉCNICA: Tracción axial suave y progresiva (1–3 kg) hacia caudal durante 30 segundos.","MANTENER: 3 repeticiones de 30 segundos con 10 segundos de pausa.","RETEST: El dolor lumbar irradiado debe disminuir durante la tracción."], tip: "Si el dolor irradiado aumenta durante la tracción, para inmediatamente y reevalúa.", contraindications: "Tumor de la cauda equina, fractura inestable L5–S1, embarazo avanzado.", youtubeSearch: "lumbosacral decompression osteopathy L5 S1 traction technique" },
  { id: "lumbar-articulatory", name: "Lumbar Articulatory", nameLocal: "Articulatoria Lumbar", region: "Columna lumbar L1–L5", difficulty: "beginner", category: "structural", bodyRegion: "lumbar", mechanism: "Mejora el rango de movimiento lumbar mediante movilización pasiva segmentaria en todos los planos.", musclesWorked: ["Articulaciones facetarias lumbares","Multífidos lumbares","Cuadrado lumbar","Ligamentos intersegmentarios"], keyPoint: "Técnica de elección en lumbalgia aguda — no requiere manipulación y es siempre segura.", steps: ["POSICIÓN PACIENTE: Decúbito lateral, caderas y rodillas flexionadas 90°.","POSICIÓN TERAPEUTA: De frente al paciente.","FASE 1 — ROTACIÓN: Mano superior en hombro, mano inferior en pelvis. Rota en dirección opuesta. 10 reps.","FASE 2 — SEPARACIÓN: Separa la pelvis del tórax axialmente (distracción lateral). 5 reps.","FASE 3 — COMPRESIÓN: Comprime pelvis hacia el tórax para activar las articulaciones. 5 reps.","RETEST: Evalúa el ROM en flexión, extensión y rotación."], tip: "En lumbalgia aguda, la articulatoria lateral es la técnica más bien tolerada.", youtubeSearch: "lumbar articulatory technique osteopathy lateral recumbent lumbar roll" },
  { id: "counterstrain-lumbar", name: "Counterstrain Lumbar", nameLocal: "Counterstrain Lumbar", region: "Lumbar L1–L5 · Puntos anteriores y posteriores", difficulty: "beginner", category: "structural", bodyRegion: "lumbar", mechanism: "Posiciona el tejido en máximo confort para inhibir el reflejo propioceptivo doloroso lumbar.", musclesWorked: ["Husos musculares lumbares","Multífidos","Iliocostal lumbar","Cuadrado lumbar"], keyPoint: "La posición de confort es la que reduce el dolor del tender point en un 70%.", steps: ["EVALUACIÓN: Localiza el tender point lumbar con palpación. Los puntos posteriores están en las apófisis espinosas; los anteriores en el recto abdominal.","BASELINE: Cuantifica el dolor del 0 al 10 con presión constante.","POSICIÓN DE CONFORT: Para puntos POSTERIORES, flexiona las caderas. Para ANTERIORES, extiende.","MANTENER: 90 segundos completos sin movimiento.","RETORNO: Regresa MUY lentamente a posición neutra (3–5 segundos).","RETEST: El dolor debe haber disminuido al menos 70%."], tip: "Si el dolor no baja al 70%, la posición no es la correcta. Ajusta 1–2 mm y reevalúa.", youtubeSearch: "counterstrain lumbar osteopathy positional release tender point" },
  { id: "lumbar-blt", name: "Lumbar BLT", nameLocal: "BLT Lumbar — Tensión Ligamentosa Balanceada", region: "Lumbar L1–L5 · Ligamentos vertebrales", difficulty: "advanced", category: "structural", bodyRegion: "lumbar", mechanism: "Busca el punto de equilibrio ligamentoso para permitir la autocorrección vertebral lumbar.", musclesWorked: ["Ligamentos amarillos","Ligamentos interespinosos","Ligamentos longitudinales anterior y posterior","Cápsulas facetarias"], keyPoint: "BLT ≠ thrust. La fuerza usada es de gramos — la corrección surge del equilibrio, no de la fuerza.", steps: ["EVALUACIÓN: Palpa el segmento lumbar disfuncional con el paciente en decúbito lateral.","PUNTO DE EQUILIBRIO: Mueve el segmento en 3 planos (rotación, inclinación, F/E) buscando donde las tensiones se igualan.","EXAGERACIÓN MÍNIMA: Aumenta 1–2 mm hacia la barrera.","RESPIRACIÓN: Pide inspiración profunda y apnea post-inspiratoria.","ESPERAR: El release ocurre espontáneamente (2–20 seg).","RETEST: El segmento debe moverse más libremente en la dirección restringida."], tip: "Ideal para pacientes que no toleran manipulación directa (elderly, osteoporosis moderada).", contraindications: "Espondilolistesis severa, fractura lumbar, compresión medular aguda.", youtubeSearch: "lumbar BLT balanced ligamentous tension osteopathy vertebral" },
  // ── ESTRUCTURAL — CADERA / PELVIS ─────────────────────────────────────────
  { id: "blt-sacroiliac", name: "BLT Sacroiliac", nameLocal: "BLT — Tensión Ligamentosa Sacroilíaca", region: "Sacroilíaca · Pelvis", difficulty: "advanced", category: "structural", bodyRegion: "cadera", mechanism: "Busca el punto de equilibrio ligamentoso para permitir la autocorrección sacroilíaca.", musclesWorked: ["Ligamento sacroilíaco posterior largo","Ligamento sacroespinoso","Ligamento sacrotuberoso","Cápsula sacroilíaca"], keyPoint: "BLT ≠ strain-counterstrain. Buscas el equilibrio dinámico, no el confort máximo.", steps: ["EVALUACIÓN: Palpa la articulación sacroilíaca con ambas manos.","PUNTO DE EQUILIBRIO: Mueve el sacro en 3 planos buscando donde las tensiones se igualan.","EXAGERACIÓN: Aumenta mínimamente la posición hacia la barrera (1–2 mm).","RESPIRACIÓN: Pide inspiración profunda. En la apnea las tensiones se liberan.","ESPERAR: Mantén sin forzar hasta sentir el release (2–20 seg).","RETEST: La SI debe moverse más libremente."], tip: "La BLT requiere sensibilidad palpática avanzada.", contraindications: "Espondiloartritis en brote, fractura sacra, embarazo tercer trimestre.", youtubeSearch: "balanced ligamentous tension BLT osteopathy sacroiliac pelvis" },
  { id: "ilium-anterior-met", name: "Ilium Anterior MET", nameLocal: "MET Ilion Anterior", region: "Ilion anterior · ASIS", difficulty: "intermediate", category: "structural", bodyRegion: "cadera", mechanism: "Corrige la rotación anterior del ilion mediante contracción de los extensores de cadera.", musclesWorked: ["Glúteo mayor","Isquiotibiales","Ligamento sacroilíaco anterior","Fascia toracolumbar"], keyPoint: "El ilion anterior es la disfunción sacroilíaca más frecuente en atletas.", steps: ["POSICIÓN PACIENTE: Decúbito prono.","EVALUACIÓN: ASIS ipsilateral más bajo que el contralateral → ilion anterior.","SETUP: Flexiona la rodilla ipsilateral a 90°. Mano sobre el ASIS para monitorear.","PALANCA: Extiende la cadera hasta la barrera (eleva el muslo de la camilla).","MET: 'Empuja el muslo hacia la camilla contra mi mano, 20% fuerza, 5 segundos'.","CICLO: 3–5 veces. El ASIS debe subir palpablemente."], tip: "Combinar con estiramiento de psoas post-MET para evitar recaída.", youtubeSearch: "anterior ilium MET muscle energy technique osteopathy innominate" },
  { id: "pubic-shear-met", name: "Pubic Symphysis MET", nameLocal: "MET Sínfisis del Pubis", region: "Sínfisis del pubis · Pelvis anterior", difficulty: "intermediate", category: "structural", bodyRegion: "cadera", mechanism: "Corrige el cizallamiento de la sínfisis pubiana mediante contracciones isométricas de los adductores.", musclesWorked: ["Adductores largo y corto","Grácil","Pectíneo","Sínfisis del pubis"], keyPoint: "El pubis asimétrico causa dolor inguinal, lumbar y alteraciones de la marcha.", steps: ["POSICIÓN PACIENTE: Supino, caderas flexionadas 90°, rodillas juntas.","EVALUACIÓN: Palpa ambos pubis simultáneamente. Asimetría superior/inferior o anterior/posterior.","SETUP: Coloca el puño entre las rodillas del paciente.","MET 1 — ADDUCCIÓN: 'Aprieta las rodillas contra mi puño, 20% fuerza, 5 seg'. 3 repeticiones.","MET 2 — ABDUCCIÓN: Con las manos en cara externa de ambas rodillas. 'Abre las rodillas, 20% fuerza, 5 seg'. 3 repeticiones.","RETEST: Palpa la sínfisis — debe estar alineada simétricamente."], tip: "Muy efectivo en osteítis del pubis y dolor inguinal en atletas.", contraindications: "Fractura de pelvis, pubis inflamado activo, embarazo.", youtubeSearch: "pubic symphysis MET muscle energy osteopathy pelvis innominate" },
  { id: "hip-articulatory", name: "Hip Articulatory", nameLocal: "Articulatoria de Cadera", region: "Articulación coxofemoral", difficulty: "beginner", category: "structural", bodyRegion: "cadera", mechanism: "Mejora el rango articular de la cadera mediante movilización pasiva en todos los planos.", musclesWorked: ["Cápsula coxofemoral","Ligamento iliofemoral","Isquiofemoral","Pubofemoral"], keyPoint: "La cadera necesita rotación interna — es la dirección más frecuentemente restringida.", steps: ["POSICIÓN PACIENTE: Supino, pierna a tratar extendida.","POSICIÓN TERAPEUTA: Al pie de la camilla.","FASE 1 — TRACCIÓN AXIAL: Tracciona suavemente el miembro 30 seg. 3 veces.","FASE 2 — CIRCUNDUCCIÓN: Círculos amplios de la cadera, creciendo en tamaño. 10 reps.","FASE 3 — ROTACIÓN INTERNA: Rotar internamente hasta barrera, mantener 5 seg. 5 reps.","FASE 4 — ROTACIÓN EXTERNA: Idem rotación externa."], tip: "Prescríbela antes de cualquier técnica específica de cadera. Lleva solo 3 minutos y facilita enormemente el trabajo.", youtubeSearch: "hip articulatory technique osteopathy coxofemoral mobilization" },
  { id: "piriformis-met", name: "Piriformis MET", nameLocal: "MET Piriforme", region: "Piriforme · Cadera profunda", difficulty: "intermediate", category: "structural", bodyRegion: "cadera", mechanism: "Estira el piriforme contraído y libera la compresión del nervio ciático.", musclesWorked: ["Piriforme","Obturador interno","Géminos","Nervio ciático"], keyPoint: "90% de las ciáticas son de origen discal, 10% por piriforme. Evalúa siempre ambos.", steps: ["POSICIÓN PACIENTE: Decúbito supino, cadera y rodilla ipsilateral flexionadas.","SETUP: Cruza el tobillo del lado afecto sobre la rodilla del lado sano (figura de 4).","PALANCA: Empuja suavemente la rodilla ipsilateral hacia la camilla (rotación interna de cadera) hasta la barrera.","MET: 'Empuja la rodilla hacia el techo contra mi mano, 20% fuerza, 5 seg'.","CICLO: 3–5 veces. La rodilla debe acercarse más a la camilla tras cada ciclo.","RETEST: El test de FADIR debe mejorar en rango y dolor."], tip: "Combinar con liberación miofascial del glúteo y movilización de la SI para mejores resultados.", youtubeSearch: "piriformis MET muscle energy technique osteopathy sciatic nerve" },
  { id: "hip-flexor-inhibition", name: "Hip Flexor Inhibition", nameLocal: "Inhibición de Flexores de Cadera", region: "Flexores de cadera · Región anterior", difficulty: "beginner", category: "structural", bodyRegion: "cadera", mechanism: "Reduce el hipertono de los flexores de cadera mediante presión inhibitoria sobre los puntos de inserción.", musclesWorked: ["Psoas iliaco","Recto femoral","Tensor fasciae latae","Sartorio"], keyPoint: "Los flexores de cadera acortados antevertan la pelvis y mantienen la lumbalgia activa.", steps: ["POSICIÓN PACIENTE: Supino, cadera flexionada 20–30° con almohada bajo las rodillas.","CONTACTO: Yemas de los dedos bilaterales en la inserción femoral del psoas (trocánter menor, cara medial).","PRESIÓN: Presión firme y sostenida. Espera 60–90 segundos.","PROGRESIÓN: Desplaza el contacto al punto de máxima tensión del psoas (pared abdominal lateral profunda).","MANTENER: Otro minuto de presión inhibitoria.","RETEST: El test de Thomas debe mostrar mejora del ángulo."], tip: "Muy bien tolerado en pacientes con lumbalgia crónica que no pueden hacer estiramientos activos.", youtubeSearch: "hip flexor inhibition osteopathy psoas iliacus technique" },
  // ── ESTRUCTURAL — HOMBRO ──────────────────────────────────────────────────
  { id: "spencer-shoulder", name: "Spencer Technique", nameLocal: "Técnica de Spencer — Hombro", region: "Hombro · Glenohumeral", difficulty: "intermediate", category: "structural", bodyRegion: "hombro", mechanism: "Serie de 7 movimientos pasivos para restaurar la movilidad glenohumeral y reducir el espasmo capsular.", musclesWorked: ["Cápsula articular glenohumeral","Manguito rotador","Bíceps (porción larga)","Deltoides"], keyPoint: "7 pasos en secuencia — no omitas ninguno. La secuencia es la técnica.", steps: ["POSICIÓN: Paciente en decúbito lateral, hombro afecto arriba.","PASO 1 — FLEXIÓN: Lleva el brazo en flexión anterior hasta la barrera. Circunducciones × 10.","PASO 2 — EXTENSIÓN: Hasta la barrera. Circunducciones × 10.","PASO 3 — CIRCUNDUCCIÓN CON COMPRESIÓN: Comprime la cabeza humeral al acetábulo. Circunducciones lentas × 10.","PASO 4 — CIRCUNDUCCIÓN CON TRACCIÓN: Tracción axial leve + circunducciones × 10.","PASOS 5–7 — ROTACIÓN INTERNA, EXTERNA Y ABDUCCIÓN: Cada una hasta barrera × 5."], tip: "Ideal para capsulitis adhesiva. Los primeros 3 días puede aumentar la inflamación — es normal.", contraindications: "Fractura de húmero reciente, luxación aguda, cirugía <8 semanas.", youtubeSearch: "Spencer technique shoulder osteopathy glenohumeral seven steps" },
  { id: "ac-joint-blt", name: "AC Joint BLT", nameLocal: "BLT Articulación Acromioclavicular", region: "Articulación acromioclavicular", difficulty: "intermediate", category: "structural", bodyRegion: "hombro", mechanism: "Libera las restricciones de la AC mediante equilibrio ligamentoso balanceado.", musclesWorked: ["Ligamento acromioclavicular","Ligamento coracoclavicular","Cápsula AC","Trapecio superior"], keyPoint: "La AC disfuncional causa impingement secundario del manguito — evalúa siempre antes de tratar el manguito.", steps: ["POSICIÓN PACIENTE: Sentado.","CONTACTO: Pulgar anterior en la clavícula distal, pulgar posterior en el acromion.","EVALUACIÓN: Mueve la clavícula en 3 planos (AP, SI, rotación) para sentir la restricción.","PUNTO DE EQUILIBRIO: Busca donde las tensiones ligamentosas se igualan.","MANTENER: En el punto de equilibrio 30–60 seg hasta sentir el release.","RETEST: El click o dolor en la AC debe disminuir."], tip: "Muy indicado en separación AC grado I–II y post-traumática crónica.", contraindications: "Separación AC grado III o superior (requiere cirugía), fractura de clavícula reciente.", youtubeSearch: "acromioclavicular joint BLT osteopathy shoulder AC joint technique" },
  { id: "subscapularis-counterstrain", name: "Subscapularis Counterstrain", nameLocal: "Counterstrain Subescapular", region: "Subescapular · Cara anterior del hombro", difficulty: "intermediate", category: "structural", bodyRegion: "hombro", mechanism: "Inhibe el espasmo del subescapular para restaurar la rotación externa y el rango de elevación.", musclesWorked: ["Subescapular","Redondo mayor","Cápsula anterior glenohumeral","Axila"], keyPoint: "El subescapular rígido es la causa número uno de pérdida de rotación externa del hombro.", steps: ["PALPACIÓN: Localiza el tender point en la fosa subescapular (cara anterior de la escápula, accesible desde la axila).","BASELINE: Cuantifica el dolor 0–10 con presión constante.","POSICIÓN DE CONFORT: Abduce el brazo 45–90°, rotación interna leve, codo flexionado.","AJUSTE FINO: La rotación interna o externa de pocos grados puede bajar el dolor.","MANTENER: 90 segundos inmóvil.","RETORNO Y RETEST: La rotación externa debe mejorar notablemente."], tip: "Combinar con movilización glenohumeral articulatoria post-counterstrain para mantener el rango ganado.", youtubeSearch: "subscapularis counterstrain osteopathy shoulder rotation" },
  { id: "scj-met", name: "SCJ MET", nameLocal: "MET Esternoclavicular", region: "Articulación esternoclavicular", difficulty: "intermediate", category: "structural", bodyRegion: "hombro", mechanism: "Libera la restricción de la SCJ que limita la elevación del miembro superior.", musclesWorked: ["Ligamento esternoclavicular","Ligamento costoclavicular","Disco articular SC","Esternocleidomastoideo"], keyPoint: "La SCJ tiene 3 grados de libertad — la restricción en uno limita todo el movimiento del hombro.", steps: ["EVALUACIÓN: Palpa la articulación SC con el pulgar. Evalúa el movimiento de la clavícula al elevar el brazo.","POSICIÓN PACIENTE: Sentado.","PALANCA: Lleva el brazo del paciente hasta la barrera de elevación.","CONTACTO STABILIZADOR: Mano sobre la clavícula medial/esternón.","MET: 'Baja el brazo contra mi resistencia, 20% fuerza, 5 seg'.","CICLO: 3–5 veces. La elevación debe aumentar tras cada ciclo."], tip: "Indicado en post-fractura de clavícula, trabajo de computadora prolongado y cervicalgia crónica.", youtubeSearch: "sternoclavicular joint MET osteopathy SCJ shoulder technique" },
  { id: "bicipital-counterstrain", name: "Bicipital Tendon Counterstrain", nameLocal: "Counterstrain Tendón Bicipital", region: "Corredera bicipital · Hombro anterior", difficulty: "beginner", category: "structural", bodyRegion: "hombro", mechanism: "Inhibe el tender point del tendón bicipital para reducir el dolor anterior del hombro.", musclesWorked: ["Tendón bíceps (porción larga)","Corredera bicipital","Ligamento transverso","Bursa bicipital"], keyPoint: "El dolor anterior del hombro es bicipital hasta que se demuestre lo contrario.", steps: ["PALPACIÓN: Tender point en la corredera bicipital (anterior-lateral del hombro).","BASELINE: Dolor 0–10.","POSICIÓN DE CONFORT: Eleva el brazo 60–90° en el plano de la escápula (scaption), ligera rotación externa.","AJUSTE: Pequeños movimientos de rotación interna/externa para alcanzar el mínimo dolor.","MANTENER: 90 segundos.","RETEST: El dolor a la palpación debe haber bajado >70%."], tip: "Combinar con técnica de Spencer y ejercicios de fortalecimiento del manguito rotador.", youtubeSearch: "bicipital tendon counterstrain osteopathy shoulder anterior pain" },
  { id: "posterior-capsule-met", name: "Posterior Capsule MET", nameLocal: "MET Cápsula Posterior del Hombro", region: "Cápsula posterior glenohumeral", difficulty: "intermediate", category: "structural", bodyRegion: "hombro", mechanism: "Estira la cápsula posterior glenohumeral contraída para restaurar la rotación interna.", musclesWorked: ["Cápsula posterior glenohumeral","Infraespinoso","Redondo menor","Deltoide posterior"], keyPoint: "La cápsula posterior rígida es la causa del GIRD (déficit de rotación interna) en atletas de lanzamiento.", steps: ["POSICIÓN PACIENTE: Decúbito lateral, hombro afecto abajo.","SETUP: Hombro a 90° de flexión, codo a 90°. Terapeuta estabiliza la escápula con la mano craneal.","PALANCA: Lleva el antebrazo hacia la camilla (rotación interna) hasta la barrera.","MET: 'Eleva el antebrazo hacia el techo, 20% fuerza, 5 seg'. Resiste isométricamente.","CICLO: 3–5 veces. La rotación interna debe aumentar tras cada ciclo.","RETEST: Mide la rotación interna bilateral — debe haberse igualado."], tip: "En beisbolistas y nadadores, 10° de diferencia en RI entre hombros indica GIRD y riesgo de lesión.", contraindications: "Luxación glenohumeral posterior reciente, inestabilidad posterior.", youtubeSearch: "posterior capsule stretch MET osteopathy shoulder GIRD internal rotation" },
  // ── ESTRUCTURAL — RODILLA ─────────────────────────────────────────────────
  { id: "fibular-head-correction", name: "Fibular Head Correction", nameLocal: "Corrección de Cabeza del Peroné", region: "Articulación tibioperonea proximal", difficulty: "intermediate", category: "structural", bodyRegion: "rodilla", mechanism: "Corrige el desplazamiento anterior o posterior de la cabeza del peroné que causa disfunción del nervio fibular.", musclesWorked: ["Articulación tibioperonea proximal","Ligamento colateral peroneo","Bíceps femoral","Nervio peroneo común"], keyPoint: "La cabeza del peroné posterior es causa de parestesias en el dorso del pie — siempre palparla.", steps: ["POSICIÓN PACIENTE: Supino, rodilla flexionada 90°.","EVALUACIÓN: Palpa la cabeza del peroné y muévela AP. La dirección de restricción indica la disfunción.","SETUP ANTERIOR: Si la cabeza está bloqueada en anterior, coloca el pulgar anterior a ella.","TÉCNICA DIRECTA: Aplica un thrust suave (o articulatoria) en la dirección de corrección.","ALTERNATIVA MET: 'Flexiona la rodilla contra mi mano, 20% fuerza'. Usa el bíceps femoral para corregir.","RETEST: La cabeza debe deslizarse libremente en ambas direcciones."], tip: "La parestesia en el dorso del pie que mejora con la corrección confirma el diagnóstico.", contraindications: "Fractura de peroné, síndrome compartimental, neuropatía diabética severa.", youtubeSearch: "fibular head correction osteopathy knee proximal tibiofibular joint" },
  { id: "patellar-mobilization", name: "Patellar Mobilization", nameLocal: "Movilización Patelar", region: "Rótula · Articulación femoropatelar", difficulty: "beginner", category: "structural", bodyRegion: "rodilla", mechanism: "Restaura el deslizamiento patelar en todos los planos para reducir el síndrome femoropatelar.", musclesWorked: ["Retináculo patelar medial y lateral","Cuádriceps","Aleta patelar","Articulación femoropatelar"], keyPoint: "La rótula necesita deslizar en 6 direcciones — evalúa todas antes de tratar.", steps: ["POSICIÓN PACIENTE: Supino, rodilla extendida y cuádriceps relajado.","EVALUACIÓN: Desliza la rótula en 6 direcciones (superior, inferior, medial, lateral, rotación horaria, antihoraria). Identifica restricciones.","FASE 1 — DESLIZAMIENTO: Para cada restricción, desliza suavemente en la dirección limitada × 10.","FASE 2 — TRACCIÓN: Tracciona la rótula anteriormente (alejándola del fémur) × 5 de 10 seg.","FASE 3 — TILT: Inclina el polo inferior hacia el fémur si hay restricción en extensión.","RETEST: La subida/bajada de escaleras debe mejorar inmediatamente."], tip: "Excelente en síndrome femoropatelar, condromalacia y post-cirugía de LCA.", youtubeSearch: "patellar mobilization osteopathy knee patella femoropatellar technique" },
  { id: "mcl-counterstrain", name: "MCL Counterstrain", nameLocal: "Counterstrain Ligamento Colateral Medial", region: "LCM · Cara medial de la rodilla", difficulty: "beginner", category: "structural", bodyRegion: "rodilla", mechanism: "Reduce el dolor e hipertono en el ligamento colateral medial mediante posición de confort.", musclesWorked: ["Ligamento colateral medial (LCM)","Semimembranoso","Semitendinoso","Cápsula medial"], keyPoint: "El LCM tiene 3 puntos principales: proximal, medio y distal — palpa los tres.", steps: ["PALPACIÓN: Localiza el tender point en el LCM (generalmente en el tercio proximal).","BASELINE: Dolor 0–10.","POSICIÓN DE CONFORT: Flexión de rodilla 30–60°, ligera rotación externa de tibia, valgo suave.","AJUSTE FINO: Pequeños cambios de flexión ±5° hasta mínimo dolor.","MANTENER: 90 segundos.","RETEST: El dolor palpatorio debe haber bajado >70%."], tip: "Indicado en entorsis de LCM grado I–II crónicas y en rodilla post-inmovilización.", youtubeSearch: "MCL medial collateral ligament counterstrain osteopathy knee" },
  { id: "popliteus-counterstrain", name: "Popliteus Counterstrain", nameLocal: "Counterstrain Poplíteo", region: "Poplíteo · Cara posterior de la rodilla", difficulty: "intermediate", category: "structural", bodyRegion: "rodilla", mechanism: "Inhibe el espasmo del poplíteo que bloquea la rotación interna de tibia al inicio de la marcha.", musclesWorked: ["Poplíteo","Cápsula posterior","Complejo arcuato","LCP"], keyPoint: "El poplíteo abre la rodilla en la fase de apoyo — su espasmo causa bloqueo funcional.", steps: ["PALPACIÓN: Tender point en la fosa poplítea medial o en la inserción tibial del poplíteo.","BASELINE: Dolor 0–10.","POSICIÓN DE CONFORT: Flexión de rodilla 90–120°, rotación interna de tibia leve.","AJUSTE: Pequeños cambios de rotación para alcanzar el mínimo dolor.","MANTENER: 90 segundos.","RETEST: La extensión de rodilla al inicio de la marcha debe ser más fluida."], tip: "Muy frecuente en lesiones de LCA y post-meniscectomía.", youtubeSearch: "popliteus counterstrain osteopathy posterior knee" },
  { id: "itb-release", name: "IT Band Myofascial Release", nameLocal: "Liberación Miofascial de la Banda IT", region: "Banda iliotibial · Cara lateral del muslo y rodilla", difficulty: "beginner", category: "structural", bodyRegion: "rodilla", mechanism: "Libera la tensión miofascial de la banda IT para reducir el síndrome de la banda iliotibial.", musclesWorked: ["Banda iliotibial","Tensor de la fascia lata","Glúteo mayor","Tracto iliotibial distal"], keyPoint: "La liberación debe ir desde la cresta ilíaca hasta la tuberosidad de Gerdy — toda la longitud.", steps: ["POSICIÓN PACIENTE: Decúbito lateral, lado a tratar arriba.","CONTACTO: Antebrazo del terapeuta sobre la cara lateral del muslo.","TÉCNICA: Deslizamiento lento y profundo (1 cm/seg) desde la cresta ilíaca hasta Gerdy.","PUNTOS DE TENSIÓN: Al encontrar un nódulo, aplica presión sostenida hasta que el tejido ceda.","TRACCIÓN TRANSVERSAL: Alterna el deslizamiento longitudinal con fricciones transversales.","RETEST: El dolor al correr o bajar escaleras debe disminuir."], tip: "Combinar con estiramiento de TFL, fortalecimiento de glúteo medio y corrección biomecánica de la carrera.", youtubeSearch: "IT band iliotibial myofascial release osteopathy knee lateral" },
  { id: "knee-blt", name: "Knee BLT", nameLocal: "BLT Articulación de la Rodilla", region: "Rodilla · Tibiofemoral", difficulty: "advanced", category: "structural", bodyRegion: "rodilla", mechanism: "Equilibra las tensiones ligamentosas de la rodilla para facilitar la autocorrección articular.", musclesWorked: ["LCA","LCP","LCM","LCL","Cápsula articular"], keyPoint: "La rodilla tiene 5 ligamentos principales — el BLT equilibra todos simultáneamente.", steps: ["POSICIÓN PACIENTE: Supino, rodilla flexionada 20–30°.","CONTACTO: Manos envolviendo la articulación (pulgares en línea articular lateral y medial).","EVALUACIÓN: Mueve la tibia en 3 planos (AP, rotación, varo/valgo) sintiendo las tensiones ligamentosas.","PUNTO DE EQUILIBRIO: Encuentra la posición donde todas las tensiones se igualan.","MANTENER: Sin forzar, 30–90 seg hasta el release.","RETEST: La movilidad y el dolor deben mejorar."], tip: "Excelente post-cirugía de rodilla (LCA, menisco) para acelerar la rehabilitación.", contraindications: "Rotura completa de LCA o LCP aguda, fractura periarticular.", youtubeSearch: "knee BLT balanced ligamentous tension osteopathy tibiofemoral" },
  // ── ESTRUCTURAL — TOBILLO / PIE ───────────────────────────────────────────
  { id: "talus-mobilization", name: "Talus Mobilization", nameLocal: "Movilización del Astrágalo", region: "Astrágalo · Articulación tibiotalar", difficulty: "intermediate", category: "structural", bodyRegion: "tobillo", mechanism: "Restaura el deslizamiento posterior del astrágalo para recuperar la dorsiflexión del tobillo.", musclesWorked: ["Articulación tibioastragalina","Ligamento deltoide","Ligamentos laterales (ATFL, CFL, PTFL)","Cápsula tibiotalar"], keyPoint: "Sin dorsiflexión adecuada (>10°), la rodilla y la cadera compensan — causa lesiones en cadena.", steps: ["EVALUACIÓN: Mide la dorsiflexión en carga (lunge test). <10 cm = restricción.","POSICIÓN PACIENTE: Supino, tobillo en 0°.","CONTACTO: Manos envolviendo el astrágalo — pulgares en cara anterior, dedos en talón.","TÉCNICA: Tracciona el astrágalo posteriorly mientras el paciente realiza dorsiflexión activa.","RITMO: 10–15 repeticiones con tracción sostenida durante toda la dorsiflexión.","RETEST: El lunge test debe mejorar 1–3 cm inmediatamente."], tip: "La movilización del astrágalo es la técnica más efectiva para recuperar dorsiflexión post-esguince.", contraindications: "Fractura de astrágalo, necrosis avascular del astrágalo.", youtubeSearch: "talus mobilization osteopathy ankle dorsiflexion technique" },
  { id: "subtalar-blt", name: "Subtalar BLT", nameLocal: "BLT Articulación Subastragalina", region: "Articulación subastragalina · Calcáneo", difficulty: "advanced", category: "structural", bodyRegion: "tobillo", mechanism: "Equilibra las tensiones ligamentosas de la subastragalina para normalizar la pronación/supinación del pie.", musclesWorked: ["Ligamento interóseo astragalocalcáneo","Ligamento en banda de la subastragalina","Fascia plantar","Seno del tarso"], keyPoint: "La subastragalina controla el 75% de la pronación/supinación del pie.", steps: ["POSICIÓN PACIENTE: Supino.","CONTACTO: Mano proximal envuelve el astrágalo, mano distal envuelve el calcáneo.","EVALUACIÓN: Mueve el calcáneo en inversión/eversión y rotación respecto al astrágalo.","PUNTO DE EQUILIBRIO: Posición donde las tensiones interóseas se igualan.","MANTENER: 30–90 seg hasta el release.","RETEST: La pronación/supinación debe ser más simétrica y libre."], tip: "Indicado en fascitis plantar, síndrome del seno del tarso y pie plano funcional.", youtubeSearch: "subtalar BLT balanced ligamentous tension osteopathy calcaneus" },
  { id: "fibula-ankle-met", name: "Distal Fibula MET", nameLocal: "MET Peroné Distal", region: "Articulación tibioperonea distal · Maléolo", difficulty: "intermediate", category: "structural", bodyRegion: "tobillo", mechanism: "Corrige el desplazamiento del peroné distal para restaurar la amplitud de la mortaja del tobillo.", musclesWorked: ["Ligamento tibioperóneo anteroinferior","Ligamento tibioperóneo posteroinferior","Membrana interósea","Peroneo largo y corto"], keyPoint: "La mortaja del tobillo debe expandirse en dorsiflexión — si el peroné no se mueve, hay restricción.", steps: ["EVALUACIÓN: Palpa el maléolo peroneal y compara con el contralateral. Evalúa su posición AP.","TÉCNICA ANTERIOR: Si el peroné está bloqueado anteriormente, posiciona el tobillo en dorsiflexión máxima.","MET: 'Lleva el pie hacia adentro (inversión) contra mi mano, 20% fuerza, 5 seg'. Usa los peroneos para corregir.","TÉCNICA POSTERIOR: Si está bloqueado posteriormente, inversión + plantiflexión.","CICLO: 3 repeticiones.","RETEST: La dorsiflexión debe aumentar y el chasquido anterior del tobillo disminuir."], tip: "Indicado en esguince de tobillo crónico y síndrome de impingement anterior.", youtubeSearch: "distal fibula MET muscle energy technique osteopathy ankle mortise" },
  { id: "plantar-fascia-release", name: "Plantar Fascia Release", nameLocal: "Liberación de la Fascia Plantar", region: "Fascia plantar · Calcáneo", difficulty: "beginner", category: "structural", bodyRegion: "tobillo", mechanism: "Libera la tensión de la fascia plantar y la inserción calcánea mediante técnica directa e indirecta.", musclesWorked: ["Fascia plantar","Músculo abductor del hallux","Flexor corto de los dedos","Inserción calcánea"], keyPoint: "El 90% de fascitis plantares responden a tratamiento conservador — la cirugía raramente es necesaria.", steps: ["TÉCNICA INDIRECTA: Sostén el talón con una mano, extiende pasivamente el 1er dedo (dorsiflexión) con la otra. El windlass stretch tensiona la fascia. Mantén 30 seg × 3.","TÉCNICA DIRECTA: Pulgar en la inserción calcánea de la fascia. Presión sostenida perpendicular. 60–90 seg.","ESTIRAMIENTO LONGITUDINAL: Desliza el pulgar desde la inserción calcánea hacia los dedos. 5 veces.","PUNTOS GATILLO: Busca nódulos a lo largo de la fascia y aplica presión sostenida.","TRABAJO DE LOS INTRÍNSECOS: Moviliza cada metatarsiano en flexión/extensión. 5 reps cada uno.","RETEST: El dolor matutino en los primeros pasos debe disminuir en las próximas 24 h."], tip: "Prescribir estiramiento nocturno de la fascia plantar como ejercicio domiciliario.", youtubeSearch: "plantar fascia release osteopathy calcaneal spur fascitis plantar" },
  { id: "navicular-correction", name: "Navicular Correction", nameLocal: "Corrección del Escafoides Tarsiano", region: "Escafoides tarsiano · Mediopié", difficulty: "intermediate", category: "structural", bodyRegion: "tobillo", mechanism: "Corrige el descenso del escafoides tarsiano que causa la hiperpronación funcional.", musclesWorked: ["Articulación talonavicular","Ligamento calcaneonavicular plantar (spring ligament)","Tibial posterior","Ligamentos del mediopié"], keyPoint: "El escafoides descendido es el hallazgo clave en el pie plano funcional.", steps: ["EVALUACIÓN: Navicular drop test. >10 mm de descenso = hiperpronación patológica.","POSICIÓN PACIENTE: Sentado con el pie en carga.","CONTACTO: Pulgar bajo el escafoides (mediopié plantar), dedo índice sobre la cara dorsal.","TÉCNICA DIRECTA: Eleva el escafoides hacia dorsal mientras el paciente transfiere el peso al retropié.","MET: 'Supina el pie contra mi resistencia, 20% fuerza, 5 seg'. Activa el tibial posterior.","CICLO: 3 veces. Revalúa el navicular drop test."], tip: "Combinar con fortalecimiento del tibial posterior y ortesis si el navicular drop es >15 mm.", youtubeSearch: "navicular correction osteopathy foot talonavicular spring ligament" },
  { id: "achilles-counterstrain", name: "Achilles Counterstrain", nameLocal: "Counterstrain Tendón de Aquiles", region: "Tendón de Aquiles · Calcáneo", difficulty: "beginner", category: "structural", bodyRegion: "tobillo", mechanism: "Inhibe el tender point del tendón de Aquiles para reducir la tendinopatía insercional y media.", musclesWorked: ["Tendón de Aquiles","Inserción calcánea","Bursa retrocalcánea","Tríceps sural"], keyPoint: "Existen 3 tender points en el Aquiles: insercional, medio y unión musculotendinosa.", steps: ["PALPACIÓN: Localiza el tender point más doloroso (0–10).","POSICIÓN DE CONFORT: Plantiflexión del tobillo 30–40°. La inserción calcánea se relaja.","AJUSTE: Inversión o eversión leve puede mejorar el confort.","MANTENER: 90 segundos.","RETORNO LENTO: 5 segundos de retorno a posición neutra.","RETEST: El dolor a la palpación y al caminar debe haber disminuido."], tip: "En tendinopatía insercional: plantiflexión máxima. En tendinopatía media: plantiflexión 20–30°.", youtubeSearch: "Achilles tendon counterstrain osteopathy calcaneal tendinopathy" },
  // ── ESTRUCTURAL — CODO / MUÑECA ───────────────────────────────────────────
  { id: "radial-head-correction", name: "Radial Head Correction", nameLocal: "Corrección de la Cabeza del Radio", region: "Articulación radiocubital proximal · Codo", difficulty: "intermediate", category: "structural", bodyRegion: "codo", mechanism: "Corrige el desplazamiento anterior o posterior de la cabeza del radio para restaurar la pronosupinación.", musclesWorked: ["Articulación radiocubital proximal","Ligamento anular del radio","Supinador corto","Bíceps braquial"], keyPoint: "La cabeza radial posterior es la restricción más frecuente — causa pérdida de supinación.", steps: ["POSICIÓN PACIENTE: Sentado o supino, codo a 90° de flexión.","EVALUACIÓN: Palpa la cabeza del radio (lateral al olécranon). Mueve en pronación/supinación — siente la restricción.","TÉCNICA ARTICULATORIA: Para cabeza posterior, lleva a supinación + extensión de codo. 10 oscilaciones.","MET SUPINADOR: 'Supina el antebrazo contra mi resistencia, 20% fuerza, 5 seg'. 3 repeticiones.","TÉCNICA DIRECTA: Pulgar sobre la cara posterior de la cabeza radial, thrust suave en anterior mientras supinas el antebrazo.","RETEST: La supinación debe haber mejorado el ROM."], tip: "Indicado en epicondilalgia lateral (codo de tenista) — siempre evalúa la cabeza radial.", contraindications: "Fractura del radio proximal, luxación aguda, osteocondritis disecante del codo.", youtubeSearch: "radial head correction osteopathy elbow proximal radioulnar joint" },
  { id: "lateral-epicondyle-counterstrain", name: "Lateral Epicondyle Counterstrain", nameLocal: "Counterstrain Epicóndilo Lateral", region: "Epicóndilo lateral · Codo de tenista", difficulty: "beginner", category: "structural", bodyRegion: "codo", mechanism: "Inhibe el tender point del epicóndilo lateral para reducir la epicondilalgia lateral.", musclesWorked: ["Extensor carpi radialis brevis","Extensor digitorum","Supinador","Cápsula radiohumeral"], keyPoint: "El punto de máximo dolor es el ECRB en su origen — siempre sobre el epicóndilo, no distal.", steps: ["PALPACIÓN: Tender point sobre el epicóndilo lateral (origen ECRB). Baseline 0–10.","POSICIÓN DE CONFORT: Codo flexionado 90°, antebrazo en pronación, muñeca en flexión leve.","AJUSTE: Ligera desviación cubital de la muñeca puede mejorar el confort.","MANTENER: 90 segundos.","RETORNO LENTO.","RETEST: El dolor a la palpación y con la extensión de muñeca resistida debe haber disminuido."], tip: "Combinar con técnica de Mulligan (mobilization with movement) para resultados más rápidos.", youtubeSearch: "lateral epicondyle counterstrain osteopathy tennis elbow" },
  { id: "medial-epicondyle-counterstrain", name: "Medial Epicondyle Counterstrain", nameLocal: "Counterstrain Epicóndilo Medial", region: "Epicóndilo medial · Codo de golfista", difficulty: "beginner", category: "structural", bodyRegion: "codo", mechanism: "Inhibe el tender point del epicóndilo medial para reducir la epicondilalgia medial.", musclesWorked: ["Pronador redondo","Flexor carpi radialis","Flexor carpi ulnaris","Palmaris longus"], keyPoint: "El codo de golfista afecta a no-golfistas más que a golfistas — cualquier pronador fuerte lo desarrolla.", steps: ["PALPACIÓN: Tender point sobre el epicóndilo medial. Baseline 0–10.","POSICIÓN DE CONFORT: Codo extendido, antebrazo en supinación, muñeca en extensión leve.","AJUSTE: La supinación completa + extensión de muñeca es la posición habitual.","MANTENER: 90 segundos.","RETORNO LENTO.","RETEST: El dolor con la flexión de muñeca resistida debe haber disminuido."], tip: "Evalúa siempre el nervio cubital (sulco cubital) — la compresión nerviosa puede mimetizar el codo de golfista.", youtubeSearch: "medial epicondyle counterstrain osteopathy golfer elbow technique" },
  { id: "supinator-met", name: "Supinator MET", nameLocal: "MET Supinador", region: "Supinador · Codo lateral", difficulty: "intermediate", category: "structural", bodyRegion: "codo", mechanism: "Inhibe el espasmo del supinador que comprime el nervio interóseo posterior.", musclesWorked: ["Supinador","Nervio interóseo posterior (rama del radial)","Extensor carpi radialis brevis","Cabeza radial"], keyPoint: "La compresión del nervio interóseo posterior por el supinador causa debilidad de extensores de dedos.", steps: ["POSICIÓN PACIENTE: Sentado, codo a 90°.","PALPACIÓN: Identifica el vientre del supinador (lateral-posterior al codo, debajo del extensor).","PALANCA: Lleva el antebrazo a pronación máxima (barrera del supinador).","MET: 'Supina el antebrazo contra mi mano, 20% fuerza, 5 seg'. El supinador se contrae isométricamente.","CICLO: 3–5 repeticiones.","RETEST: La pronación debe haber aumentado."], tip: "Si hay debilidad de extensores de dedos (caída de muñeca leve), el supinador comprime el NIP — prioritario.", youtubeSearch: "supinator MET muscle energy technique osteopathy posterior interosseous nerve" },
  { id: "radiocarpal-mobilization", name: "Radiocarpal Mobilization", nameLocal: "Movilización Radiocarpiana", region: "Muñeca · Articulación radiocarpiana", difficulty: "intermediate", category: "structural", bodyRegion: "munieca", mechanism: "Restaura los deslizamientos carpianos para mejorar la flexión/extensión de muñeca.", musclesWorked: ["Articulación radiocarpiana","Ligamentos radiocarpianos","Semilunar","Escafoides"], keyPoint: "Para ganar flexión: deslizamiento dorsal del carpo. Para ganar extensión: deslizamiento volar.", steps: ["POSICIÓN PACIENTE: Sentado, antebrazo apoyado en la camilla.","CONTACTO: Una mano estabiliza el radio distal, la otra envuelve la fila proximal del carpo.","EVALUACIÓN: Desliza el carpo dorsalmente, volarmente y en distracción. Identifica restricciones.","TÉCNICA — DISTRACCIÓN: Tracción axial de la muñeca 30 seg × 3.","TÉCNICA — DESLIZAMIENTO: Aplica el deslizamiento en la dirección restringida × 10.","RETEST: Mide el ROM en grados antes y después."], tip: "Indicado en síndrome del túnel carpiano, quiste ganglionar y post-fractura de Colles.", youtubeSearch: "radiocarpal mobilization osteopathy wrist carpal bones technique" },
  { id: "carpal-tunnel-release", name: "Carpal Tunnel Release", nameLocal: "Liberación del Túnel Carpiano", region: "Túnel carpiano · Muñeca", difficulty: "intermediate", category: "structural", bodyRegion: "munieca", mechanism: "Aumenta el espacio del túnel carpiano y moviliza el nervio mediano para reducir la compresión.", musclesWorked: ["Ligamento transverso del carpo","Nervio mediano","Tendones flexores","Huesos del carpo"], keyPoint: "El nervio mediano necesita 14 mm de espacio — cualquier restricción carpiana lo reduce.", steps: ["TÉCNICA 1 — EXTENSIÓN CARPIANA: Con ambos pulgares en cara palmar y dedos en dorsal, aplica distracción + extensión de muñeca. 30 seg × 3.","TÉCNICA 2 — SPREADING CARPAL: Pulgares en el centro del carpo (pisiforme y trapezoide). Aplica un spread bilateral lento. 30 seg.","TÉCNICA 3 — NEURAL MOBILIZATION: Extensión de muñeca + extensión de codo + inclinación contralateral de cuello. Movimiento oscilatorio suave.","TÉCNICA 4 — THENAR MOBILIZATION: Moviliza la eminencia tenar en todos los planos. 30 seg.","TÉCNICA 5 — PISIFORME MOBILIZATION: El pisiforme es el hueso más móvil del carpo — movilízalo en todos los planos.","RETEST: Los síntomas nocturnos deben disminuir en los días siguientes."], tip: "La movilización neural del mediano es tan efectiva como la cirugía en STC leve-moderado.", contraindications: "STC severo con atrofia tenar (requiere cirugía), fractura de carpo aguda.", youtubeSearch: "carpal tunnel osteopathy neural mobilization wrist median nerve" },
];

// Technique type → category mapping for OSTEOPATHY_REGISTRY merge
const _typeToCategory: Record<string, string> = {
  "joint-mobilization": "structural",
  "hvla": "structural",
  "muscle-energy": "structural",
  "myofascial-release": "structural",
  "visceral": "visceral",
  "cranial": "craneal",
};

// Merge registry entries not already covered by BASE_TECHNIQUES
const _registryTechniques: TechniqueEntry[] = OSTEOPATHY_REGISTRY
  .filter(t => !BASE_TECHNIQUES.find(b => b.id === t.id))
  .map(t => ({
    id: t.id,
    name: t.isChiropracticDerived ? `${t.name} ★` : t.name,
    nameLocal: t.name,
    region: t.region,
    difficulty: "intermediate" as const,
    musclesWorked: [],
    keyPoint: t.description,
    steps: [`Paciente: ${t.patientPosition}`, `Terapeuta: ${t.therapistPosition}`, t.description],
    tip: t.tip,
    isChiropracticDerived: t.isChiropracticDerived ?? false,
    videoSrc: t.videoSrc,
    category: _typeToCategory[t.techniqueType] ?? "structural",
    mechanism: t.description,
    bodyRegion: t.region.toLowerCase(),
    youtubeSearch: `${t.name} osteopathy technique`,
  }));

const ALL_TECHNIQUES: TechniqueEntry[] = [...BASE_TECHNIQUES, ..._registryTechniques];

const CATEGORIES = [
  { key: "all",        label: "Todas",       count: ALL_TECHNIQUES.length },
  { key: "visceral",   label: "Visceral",    count: ALL_TECHNIQUES.filter(t => t.category === "visceral").length },
  { key: "craneal",    label: "Craneal",     count: ALL_TECHNIQUES.filter(t => t.category === "craneal").length },
  { key: "structural", label: "Estructural", count: ALL_TECHNIQUES.filter(t => t.category === "structural").length },
];

const BODY_REGIONS: { key: string; label: string }[] = [
  { key: "all",      label: "Todas las regiones" },
  { key: "cervical", label: "Cervical" },
  { key: "toracica", label: "Torácica" },
  { key: "lumbar",   label: "Lumbar" },
  { key: "cadera",   label: "Cadera / Pelvis" },
  { key: "hombro",   label: "Hombro" },
  { key: "rodilla",  label: "Rodilla" },
  { key: "tobillo",  label: "Tobillo / Pie" },
  { key: "codo",     label: "Codo" },
  { key: "munieca",  label: "Muñeca / Mano" },
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

const BODY_REGION_GRADIENT: Record<string, string> = {
  cervical: "from-teal-900 via-teal-800 to-cyan-900",
  toracica: "from-sky-900 via-sky-800 to-blue-900",
  lumbar:   "from-blue-900 via-indigo-800 to-violet-900",
  cadera:   "from-violet-900 via-purple-800 to-pink-900",
  hombro:   "from-cyan-900 via-sky-800 to-blue-900",
  rodilla:  "from-indigo-900 via-blue-800 to-sky-900",
  tobillo:  "from-emerald-900 via-teal-800 to-cyan-900",
  codo:     "from-amber-900 via-orange-800 to-red-900",
};

const CATEGORY_EMOJI: Record<string, string> = {
  visceral:   "🫀",
  craneal:    "🧠",
  structural: "🦴",
};

const BODY_REGION_EMOJI: Record<string, string> = {
  cervical: "🦒",
  toracica: "🫁",
  lumbar:   "⬛",
  cadera:   "🦵",
  hombro:   "💪",
  rodilla:  "🦿",
  tobillo:  "🦶",
  codo:     "🤜",
};

// ─── Tarjeta de técnica ───────────────────────────────────────────────────────
function TechniqueCard({
  technique,
  onPlay,
}: {
  technique: TechniqueEntry;
  onPlay: () => void;
}) {
  const tOsteo = useTranslations("osteopathy");
  const hasVideo = !!(technique.youtubeId || technique.youtubeSearch);
  const gradient = technique.bodyRegion
    ? BODY_REGION_GRADIENT[technique.bodyRegion] ?? CATEGORY_GRADIENT[technique.category]
    : CATEGORY_GRADIENT[technique.category];
  const emoji = technique.bodyRegion
    ? BODY_REGION_EMOJI[technique.bodyRegion] ?? CATEGORY_EMOJI[technique.category]
    : CATEGORY_EMOJI[technique.category];

  return (
    <Card className="group overflow-hidden hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 border border-surface-200 bg-white cursor-pointer" onClick={onPlay}>
      <div className={cn("relative overflow-hidden bg-gradient-to-br", gradient)} style={{ aspectRatio: "16/10" }}>
        <span className="absolute inset-0 flex items-center justify-center text-7xl opacity-[0.15] select-none pointer-events-none">
          {emoji}
        </span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 bg-white/20 backdrop-blur-sm border border-white/60 rounded-full w-12 h-12 flex items-center justify-center shadow-xl">
            <Play className="h-5 w-5 text-white fill-white ms-0.5" />
          </div>
        </div>
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
        {technique.isChiropracticDerived && (
          <span className="inline-block text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mb-1">
            {tOsteo("chiropracticNote")}
          </span>
        )}
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
  const [activeBodyRegion, setActiveBodyRegion] = useState("all");
  const [playerTechnique, setPlayerTechnique] = useState<TechniqueEntry | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  // Static CDN registry — 467 exercises + osteopathy with Pexels video URLs
  const cdnRegistry = exerciseRegistry as Record<string, { video?: string }>;

  const filtered = ALL_TECHNIQUES.filter((t) => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.nameLocal?.toLowerCase().includes(search.toLowerCase())) ||
      t.region.toLowerCase().includes(search.toLowerCase()) ||
      t.mechanism.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchRegion = activeBodyRegion === "all" || t.bodyRegion === activeBodyRegion;
    return matchSearch && matchCat && matchRegion;
  });

  function openPlayer(index: number) {
    setPlayerIndex(index);
    const t = filtered[index];
    // Priority: 1️⃣ CDN registry (Pexels)  2️⃣ local dev fallback  3️⃣ undefined
    setPlayerTechnique({ ...t, videoSrc: cdnRegistry[t.id]?.video ?? t.videoSrc ?? undefined });
  }

  const showBodyRegions = activeCategory === "structural" || activeCategory === "all";

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Biblioteca de Osteopatía" />
        <main className="flex-1 overflow-y-auto">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 border-b border-surface-200 bg-white px-6 py-3 space-y-2">
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
                    onClick={() => { setActiveCategory(cat.key); setActiveBodyRegion("all"); }}
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
            {/* Body Region sub-filter */}
            {showBodyRegions && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {BODY_REGIONS.map((br) => (
                  <button
                    key={br.key}
                    onClick={() => setActiveBodyRegion(br.key)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                      activeBodyRegion === br.key
                        ? "bg-surface-800 text-white"
                        : "bg-surface-100 text-surface-500 hover:bg-surface-200"
                    )}
                  >
                    {br.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="p-6 max-w-7xl mx-auto">
            <p className="text-sm text-surface-500 mb-4">
              <span className="font-semibold text-surface-900">{filtered.length}</span> técnicas encontradas
            </p>

            {/* Panel de anatomía aplicada — visible cuando hay filtro de región estructural */}
            {activeBodyRegion !== "all" && OSTEO_REGION_TO_ANATOMY[activeBodyRegion] && (
              <OsteoAnatomyPanel bodyRegion={activeBodyRegion} />
            )}
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
                <button onClick={() => { setSearch(""); setActiveCategory("all"); setActiveBodyRegion("all"); }}
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
