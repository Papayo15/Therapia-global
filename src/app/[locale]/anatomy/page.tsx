"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, BookOpen, Dumbbell } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const REGIONS = [
  { id: "shoulder",  label: "Hombro",         emoji: "💪", grad: "from-blue-600 to-indigo-700",   techniques: 24 },
  { id: "cervical",  label: "Cervical",        emoji: "🔍", grad: "from-violet-600 to-purple-700", techniques: 18 },
  { id: "thoracic",  label: "Torácica",        emoji: "🫁", grad: "from-teal-600 to-green-700",    techniques: 15 },
  { id: "lumbar",    label: "Lumbar",          emoji: "🦴", grad: "from-amber-500 to-orange-600",  techniques: 32 },
  { id: "hip",       label: "Cadera",          emoji: "🔵", grad: "from-rose-500 to-pink-600",     techniques: 21 },
  { id: "knee",      label: "Rodilla",         emoji: "🦵", grad: "from-emerald-500 to-teal-600",  techniques: 19 },
  { id: "ankle",     label: "Tobillo / Pie",   emoji: "🦶", grad: "from-sky-500 to-blue-600",      techniques: 12 },
  { id: "elbow",     label: "Codo",            emoji: "💫", grad: "from-yellow-500 to-amber-600",  techniques: 10 },
  { id: "tmj",       label: "ATM / Mandíbula", emoji: "😬", grad: "from-red-500 to-rose-600",      techniques: 8  },
  { id: "visceral",  label: "Vísceras",        emoji: "🫀", grad: "from-purple-500 to-violet-600", techniques: 28 },
];

const LAYERS = [
  { key: "anatomy",      label: "Anatomía",            icon: "🔬", color: "bg-blue-100 text-blue-800 border-blue-200"     },
  { key: "physiology",   label: "Fisiología",          icon: "⚡", color: "bg-green-100 text-green-800 border-green-200"   },
  { key: "dysfunctions", label: "Disfunciones",        icon: "⚠️", color: "bg-amber-100 text-amber-800 border-amber-200"   },
  { key: "effects",      label: "Efectos de técnicas", icon: "✨", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { key: "connections",  label: "Conexiones",          icon: "🔗", color: "bg-rose-100 text-rose-800 border-rose-200"      },
];

const REGION_CONTENT: Record<string, Record<string, string[]>> = {
  shoulder: {
    anatomy: [
      "Manguito rotador: supraespinoso, infraespinoso, redondo menor y subescapular",
      "Articulación glenohumeral (bola-socket, 3 ejes): mayor ROM del cuerpo",
      "Labrum glenoideo y cápsula articular multilaminar",
      "Articulaciones acromioclavicular (AC) y esternoclavicular (EC)",
      "Bolsa subacromial: separa el supraespinoso del ligamento coracoacromial",
    ],
    physiology: [
      "Rango normal: 180° flexión, 60° extensión, 90° rotación interna y externa",
      "El supraespinoso inicia la abducción (0–15°), el deltoides toma el relevo",
      "Ritmo escapulohumeral: escápula rota 1° por cada 2° de elevación glenohumeral",
      "El manguito comprime la cabeza humeral para estabilizar durante el movimiento",
      "La posición de la escápula determina el espacio subacromial disponible",
    ],
    dysfunctions: [
      "Síndrome subacromial: compresión del supraespinoso bajo el arco coracoacromial",
      "Inestabilidad glenohumeral: fallo del labrum o cápsula por trauma o hiperlaxitud",
      "Tendinopatía del manguito: degeneración por sobrecarga excéntrica repetitiva",
      "Capsulitis adhesiva: fibrosis capsular que limita todos los rangos de movimiento",
      "Discinesia escapular: mala sincronización, factor predisponente del síndrome subacromial",
    ],
    effects: [
      "Movilización glenohumeral: restaura el glide articular posterior y la rotación interna",
      "MET del manguito: reduce el espasmo protector, mejora el ROM activo",
      "Liberación de tejidos blandos: reduce adherencias en bursa y tendón supraespinoso",
      "Liberación de la cápsula posterior: clave para el pinzamiento postero-superior",
      "Tratamiento de cadena cervicotorácica: libera la tensión que perpetúa la disfunción",
    ],
    connections: [
      "Restricción C4–C6 → dolor referido al hombro (nervio frénico / dermatoma cervical)",
      "Restricción torácica T1–T4 → reduce movilidad glenohumeral por cadena fascial",
      "Disfunción 1ª costilla → compresión del plexo braquial → síntomas en miembro superior",
      "Tensión diafragmática → sobrecarga del trapecio → elevación escapular → compresión acromial",
    ],
    exercises: ["Rotación externa de hombro con liga", "Press de hombro con mancuerna", "Elevación lateral", "Band pull-apart"],
  },
  cervical: {
    anatomy: [
      "7 vértebras: C1 (atlas), C2 (axis), C3–C7 con discos muy móviles",
      "Articulación atlantoaxial: proporciona el 50% de la rotación cervical total",
      "Articulación atlantooccipital: flexión/extensión principal de la cabeza (15–20°)",
      "Nervios C1–C8 y origen del plexo braquial (C5–T1): hombro, brazo y mano",
      "Arteria vertebral: atraviesa los forámenes transversos de C6 a C1",
    ],
    physiology: [
      "C1–C2 controlan el 50% de la rotación cervical (≈45° por lado)",
      "Músculos suboccipitales: ajustan la posición de la cabeza en tiempo real",
      "Longus colli: estabilizador profundo cervical, primero en inhibirse con el dolor",
      "Flexión normal: 45–50°. Extensión: 75–85°. Rotación: 60–80° por lado",
      "Ligamento transverso del atlas: estabiliza la odontoides contra C1",
    ],
    dysfunctions: [
      "Síndrome cervicocefálico: cefalea cervicogénica de origen C1–C3",
      "Disfunción C5–C6: parestesias en antebrazo y mano, debilidad en bíceps",
      "Restricción atlantoaxial: limitación de rotación con dolor occipital",
      "Síndrome vertebrobasilar: síntomas con rotación extrema (vértigo, diplopia)",
      "Síndrome del escaleno anterior: compresión neurovascular entre escalenos y 1ª costilla",
    ],
    effects: [
      "MET cervical: estira isométricamente suboccipitales y escalenos sin riesgo",
      "TNM (técnica neuromuscular): libera trigger points del ECOM y trapecio superior",
      "CV4 craneal: actúa sobre el plexo coroideo, regula la presión del LCR",
      "Inhibición suboccipital: modula el tono del SNA vía nervio vago",
      "Movilización suave: activa mecanoreceptores articulares, inhibe la nocicepción",
    ],
    connections: [
      "Disfunción C1–C2 → cefalea frontal (vía trigémino–cervical)",
      "Tensión dural cervical → dolor en el ojo ipsilateral (nervio oftálmico)",
      "Restricción 1ª–2ª costilla → dolor referido cervical posterior",
      "Disfunción sacra → tensión dural → síntomas cervicales (mecanismo craneosacral)",
    ],
    exercises: ["Retracción cervical (chin tuck)", "Rotación cervical asistida", "Estiramiento de escalenos"],
  },
  lumbar: {
    anatomy: [
      "5 vértebras L1–L5 con disco intervertebral (núcleo pulposo + anillo fibroso)",
      "Articulaciones facetarias (orientación sagital): limitan rotación, permiten flexoextensión",
      "Ligamentos iliolumbares, longitudinal anterior y posterior, ligamento amarillo",
      "Multífidos: estabilizadores segmentarios principales, activación anticipatoria 30ms",
      "Raíces L1–S3: plexo lumbosacro (nervio femoral, obturador, ciático)",
    ],
    physiology: [
      "La lordosis lumbar distribuye el peso entre discos (70%) y facetas (30%)",
      "El multífido se activa 30ms antes del movimiento de miembros (anticipación motora)",
      "Los ligamentos iliolumbares anclan L4–L5 al sacro controlando la nutación sacra",
      "La articulación sacroilíaca permite 2–4° de nutación durante la carga",
      "El psoas comprime la columna en extensión: función estabilizadora más que de movimiento",
    ],
    dysfunctions: [
      "Lumbalgia mecánica: disfunción facetaria por carga axial asimétrica o rotación",
      "Hernia discal L4–L5 / L5–S1: compresión de raíces con déficit motor o sensitivo",
      "Estenosis de canal: compresión por hipertrofia facetaria + ligamento amarillo + osteofitos",
      "Síndrome piriforme: compresión del ciático a nivel del músculo piriforme",
      "Disfunción sacroilíaca: dolor en zona glútea con o sin irradiación a muslo posterior",
    ],
    effects: [
      "TLMO lumbar (suave osteopático): libera restricción facetaria con efecto analgésico",
      "MET para sacro/ilion: corrige la disfunción sacroilíaca con contracciones isométricas",
      "Counterstrain lumbar: inhibe el reflejo nociceptivo en los tender points paravertebrales",
      "Liberación miofascial de fascia toracolumbar: reduce la tensión global del complejo lumbar",
    ],
    connections: [
      "Disfunción sacroilíaca → dolor referido a ingle y cara anterior del muslo",
      "Psoas acortado → anteriorización pélvica → hiperlordosis → sobrecarga facetaria",
      "Restricción de cadera → compensación lumbar → lumbalgia mecánica secundaria",
      "Disfunción diafragmática → cambio en presión intraabdominal → desestabilización lumbar",
    ],
    exercises: ["Bird-Dog", "Dead Bug", "Puente de glúteos", "Rotación lumbar", "McKenzie press-up", "Rodillas al pecho"],
  },
  hip: {
    anatomy: [
      "Articulación coxofemoral (enartrosis): cabeza femoral + acetábulo con labrum",
      "Labrum acetabular: aumenta la profundidad articular en un 22%, mejora estabilidad",
      "Ligamento iliofemoral: el más fuerte del cuerpo (resiste la extensión de cadera)",
      "Glúteo mayor (extensión), glúteo medio/menor (estabilización frontal en monopodal)",
      "Psoas-ilíaco: flexor principal de cadera, también rotador externo y estabilizador lumbar",
    ],
    physiology: [
      "La cadera soporta 3× el peso corporal en marcha y 8× en carrera",
      "El glúteo medio actúa en apoyo monopodal: su debilidad causa signo de Trendelenburg",
      "El labrum distribuye la presión articular: sin él, sobrecarga focal del cartílago",
      "La rotación interna normal de cadera es 35–45°; restricción es señal de alarma",
      "El ritmo lumbopélvico acopla movimientos de cadera con la columna lumbar",
    ],
    dysfunctions: [
      "Pinzamiento femoroacetabular (FAI): tipo CAM (morfología femoral) y Pincer (acetabular)",
      "Lesión del labrum: dolor inguinal profundo con click articular, inestabilidad",
      "Bursitis trocantérea: inflamación entre trocánter mayor y glúteo medio/TFL",
      "Coxartrosis: degeneración articular con rigidez matutina, dolor y pérdida de cartílago",
    ],
    effects: [
      "Movilización articular posterior: abre el espacio anterior, alivia el FAI",
      "MET para piriforme: estira el nervio ciático, reduce compresión neural",
      "Liberación del psoas: reduce hiperlordosis y compresión facetaria L3–L5",
      "Tracción de cadera: descomprime articulación, mejora nutrición del cartílago",
    ],
    connections: [
      "Disfunción de cadera → marcha antiálgica → sobrecarga lumbar ipsilateral",
      "Restricción de rotación interna → pronación del pie → rodilla en valgo",
      "Acortamiento de psoas → anteriorización pélvica → tensión en el plexo lumbar",
    ],
    exercises: ["Puente de glúteos", "Abducción de cadera con liga/polaina", "Patada glútea", "Romanian deadlift"],
  },
  knee: {
    anatomy: [
      "Articulación tibiofemoral: cóndilo femoral convexo + platillo tibial cóncavo-convexo",
      "Meniscos medial y lateral: fibrocartílago para amortiguación y estabilidad articular",
      "LCA (traslación anterior/rotación interna), LCP, LCM, LCL",
      "Rótula: sesamoideo en el tendón cuadricipital, aumenta el brazo de palanca un 50%",
    ],
    physiology: [
      "Los meniscos absorben 40–70% de la carga en extensión y 85% en flexión",
      "La rótula aumenta el brazo de palanca del cuádriceps en un 50%",
      "El LCA resiste la traslación anterior de tibia y controla la rotación interna",
      "El poplíteo desbloquea la rodilla iniciando la flexión desde extensión completa",
    ],
    dysfunctions: [
      "Condromalacia rotuliana: degeneración del cartílago por malalineamiento patelar",
      "Síndrome de la banda iliotibial: fricción en el epicóndilo femoral lateral (runners)",
      "Gonartrosis: degeneración articular con pérdida de cartílago y osteofitos",
      "Lesión meniscal: bloqueo articular, derrame, dolor en interlínea con rotación",
    ],
    effects: [
      "Movilización patelar: restaura el glide rotuliano en todas las direcciones",
      "Movilización AP tibiofemoral: libera la restricción articular posterior",
      "MET cuádriceps/isquiotibiales: reduce contractura que aumenta presión intraarticular",
      "Drenaje linfático: reduce derrame, mejora la inhibición artrogénica del cuádriceps",
    ],
    connections: [
      "Pronación del pie → rotación interna de tibia → estrés en LCM y menisco medial",
      "Restricción de cadera → compensación en valgo de rodilla en sentadilla",
      "Disfunción lumbar L3–L4 → dolor referido anterior de muslo y rodilla",
    ],
    exercises: ["Extensión de rodilla con polaina", "Wall sit", "Sentadilla con liga", "Step-up unilateral"],
  },
  ankle: {
    anatomy: [
      "Articulación tibioastragalina: tróclea del astrágalo + mortaja tibioperoné",
      "Articulación subastragalina: astrágalo + calcáneo (pronación/supinación)",
      "Ligamento peroneoastragalino anterior (LPAA): el más lesionado en esguinces",
      "Ligamento deltoideo medial: muy fuerte, raramente lesionado",
      "Complejo aquíleo: gastrocnemios + sóleo + tendón de Aquiles",
    ],
    physiology: [
      "Dorsiflexión necesaria: 10–15° para marcha normal, >15° para correr",
      "El sóleo genera el 50% del impulso en la marcha (propulsor principal)",
      "El tibial posterior controla la pronación dinámica y soporta el arco medial plantar",
      "El peroné distal se desplaza anterolateral en la carga: movilidad necesaria",
    ],
    dysfunctions: [
      "Esguince lateral: lesión del LPAA por inversión forzada (más frecuente del cuerpo)",
      "Restricción de dorsiflexión: rigidez capsular posterior o acortamiento de sóleo",
      "Tendinopatía aquílea: sobrecarga excéntrica del tendón en corredores",
      "Fascitis plantar: inflamación de la fascia por pronación excesiva o acortamiento sóleo",
    ],
    effects: [
      "Movilización AP del astrágalo: restaura la dorsiflexión en restricciones capsulares",
      "MET gastrocnemio/sóleo: mejora la extensibilidad y la dorsiflexión",
      "Manipulación del cuboides: libera la restricción calcuboidea crónica post-esguince",
      "Movilización del peroné distal: corrige el deslizamiento anterior post-esguince",
    ],
    connections: [
      "Restricción de dorsiflexión → compensación en pronación → rodilla en valgo",
      "Esguince de tobillo crónico → disfunción sacroilíaca contralateral por compensación",
      "Restricción subastragalina → fascitis plantar por sobrecarga del mediopié",
    ],
    exercises: ["Bombeo de tobillo (ankle pumps)", "Elevación de talones con liga", "Equilibrio en BOSU", "Sentadilla profunda"],
  },
  thoracic: {
    anatomy: [
      "12 vértebras T1–T12 con articulaciones costovertebrales bilaterales",
      "Articulaciones costoesternales (7 costillas verdaderas) y condrocostales",
      "Caja torácica: 12 pares costales (7 verdaderas, 3 falsas, 2 flotantes)",
      "Músculos intrínsecos: multífidos torácicos, rotadores, semiespinoso",
      "Músculos respiratorios: diafragma, intercostales internos y externos, serrato anterior",
    ],
    physiology: [
      "La rotación torácica aporta el 70–80% de la rotación total de columna",
      "La cifosis torácica fisiológica (20–40°) distribuye cargas de forma eficiente",
      "La movilidad costal es esencial para la ventilación: cada costilla sube y rota en inspiración",
      "Las articulaciones costovertebrales T1–T6 determinan la expansión superior del tórax",
    ],
    dysfunctions: [
      "Hipercifosis torácica: por postura en flexión mantenida y debilidad de extensores",
      "Disfunción costal: restricción en la elevación costal que limita la capacidad respiratoria",
      "Síndrome cruzado superior: pectorales tensos + romboides/trapecio medio inhibidos",
      "Costilla bloqueada: dolor agudo en inspiración por restricción costovertebral",
    ],
    effects: [
      "MET extensión torácica: moviliza facetas y articulaciones costovertebrales",
      "Extensión en foam roller: mejora la cifosis funcional y la postura global",
      "Técnica de costillas: libera la restricción costal, mejora la excursión respiratoria",
    ],
    connections: [
      "Restricción T1–T4 → tensión del plexo braquial → síntomas en miembro superior",
      "Hipercifosis → compensación cervical en extensión → síndrome cervicocefálico",
      "Disfunción T5–T9 → reflejo visceral → dolor epigástrico y gastroesofágico",
    ],
    exercises: ["Extensión torácica en foam roller", "Rotación torácica con pelota terapéutica", "Apertura de pecho con mancuernas"],
  },
  elbow: {
    anatomy: [
      "Articulación humeroulnar (troclear): flexión/extensión 0–145°",
      "Articulación humeroradial: capitulum femoral + cabeza del radio",
      "Articulación radioulnar proximal: pronosupinación junto con la distal",
      "LCM medial: fundamental en lanzadores (resiste el estrés en valgo)",
      "Nervio cubital: atraviesa el canal epitroclear, vulnerable en flexión mantenida",
    ],
    physiology: [
      "La pronosupinación ocurre en las radioulnares proximal y distal simultáneamente",
      "El bíceps es supinador potente además de flexor: inserta en tuberosidad radial",
      "El nervio radial profundo cruza el músculo supinador: puede comprimirse (PIN)",
      "La carga en compresión del codo es de 0.5–1.7× el peso corporal en cotidianeidad",
    ],
    dysfunctions: [
      "Epicondilalgia lateral (codo de tenista): tendinopatía del extensor carpi radialis breve",
      "Epitrocleitis medial (codo de golfista): tendinopatía del flexor-pronador",
      "Bursitis olecraneana: inflamación de la bursa por apoyo repetitivo del codo",
      "Neuropatía cubital: parestesias en 4º y 5º dedo por compresión en el canal epitroclear",
    ],
    effects: [
      "Movilización de la cabeza del radio: corrige la restricción de pronosupinación",
      "MET extensores radiales: estira el ECRB, alivia la tensión en la epicondilitis",
      "Técnica de Mulligan (SNAG codo): movilización con movimiento para el codo de tenista",
    ],
    connections: [
      "Disfunción del codo → tensión nerviosa mediana/radial → síntomas en muñeca y mano",
      "Restricción cervical C5–C6 → dolor referido al codo lateral (radiculopatía)",
      "Disfunción escapular → compensación distal → tendinopatía por sobrecarga",
    ],
    exercises: ["Curl de bíceps con mancuerna", "Extensiones de tríceps con liga", "Pronosupinación con mancuerna ligera"],
  },
  tmj: {
    anatomy: [
      "ATM: cóndilo mandibular + fosa glenoidea del temporal con disco articular interpuesto",
      "Disco articular bicóncavo con zona bilaminar posterior y bandas anterior/posterior",
      "Ligamentos: temporomandibular (principal), esfenomandibular, estilomandibular",
      "Músculos masticadores: masetero, temporal, pterigoideo medial y lateral",
      "Músculos suprahioideos: digástrico, milohioideo (abren la boca contra resistencia)",
    ],
    physiology: [
      "La apertura combina rotación (primeros 25mm) y traslación anterior (25–55mm)",
      "El pterigoideo lateral inferior protrae la mandíbula y controla el disco en apertura",
      "La oclusión dental determina la posición condilar de reposo (relación céntrica)",
      "La ATM es la única articulación que funciona bilateralmente de forma sincrónica",
      "Apertura máxima normal: 40–55mm (3 dedos del paciente entre los incisivos)",
    ],
    dysfunctions: [
      "Desplazamiento anterior del disco con reducción: click en apertura (reposicionamiento)",
      "Desplazamiento anterior sin reducción: apertura <35mm, sin click (bloqueo cerrado)",
      "Osteoartrosis ATM: crepitación, dolor y apertura limitada",
      "Síndrome craneomandibular: cefalea, tinnitus, mareos y dolor cervical asociado",
    ],
    effects: [
      "Movilización intraoral de la ATM: restaura la traslación anterior del cóndilo",
      "Técnica intraoral de pterigoideo: libera la tensión del pterigoideo medial/lateral",
      "Tracción mandibular: descomprime la articulación, alivia el dolor intraarticular",
      "CV4 y técnicas craneales: tratan la base craneal que aloja la ATM",
    ],
    connections: [
      "Disfunción ATM → cefalea temporal y dolor detrás del ojo (nervio auriculotemporal)",
      "Maloclusión → compensación cervical → síndrome cervicocefálico",
      "Disfunción del temporal → vértigo y tinnitus (VIII par craneal / cóclea)",
      "Bruxismo → tensión en masetero → cefalea tensional crónica",
    ],
    exercises: ["Apertura mandibular controlada", "Movilización activa de ATM", "Propiocepción mandibular"],
  },
  visceral: {
    anatomy: [
      "Hígado (hipocondrio derecho) y vesícula biliar bajo la cúpula diafragmática derecha",
      "Estómago, duodeno y páncreas en el epigastrio cruzando la línea media",
      "Intestino delgado (yeyuno-íleon): 6–7 metros suspendidos en el mesenterio",
      "Colon (marco cólico), riñones retroperitoneales (L1–L2), vejiga pélvica",
      "Fascia peritoneal: tejido conectivo que une los órganos entre sí y con la pared",
    ],
    physiology: [
      "El hígado desciende 3–5cm en inspiración profunda (referencia de motilidad normal)",
      "Motilidad intrínseca visceral (osteopática): movimiento lento a 8–12 ciclos/min",
      "Sistema Nervioso Entérico: 100 millones de neuronas, actúa semi-autónomamente",
      "El diafragma es el motor principal de la motilidad visceral abdominopélvica",
      "La presión intraabdominal regula la estabilidad lumbar y la función visceral",
    ],
    dysfunctions: [
      "Ptosis visceral: descenso de órganos por debilitamiento fascial o muscular",
      "Adherencias postquirúrgicas: fibrosis peritoneal que restringe la movilidad visceral",
      "Disfunción de la charnela gastroesofágica: reflujo por hipotonía del esfínter inferior",
      "Colon espástico: hipertonía del marco cólico, estreñimiento funcional",
    ],
    effects: [
      "Bomba hepática: mejora el drenaje linfático y la circulación porta",
      "Liberación del mesenterio: reduce adherencias, mejora la motilidad intestinal",
      "Movilización renal bimanual: restaura la movilidad renal (3–5cm normal en respiración)",
      "Técnica del diafragma: libera las cúpulas, mejora la presión intraabdominal",
    ],
    connections: [
      "Disfunción hepática → tensión del ligamento hepatoduodenal → dolor al hombro derecho",
      "Ptosis gástrica → tensión del ligamento gastrofrénico → limita la respiración diafragmática",
      "Adherencias del colon sigmoide → tensión en el ilion izquierdo → pseudodisfunción SI",
      "Disfunción renal derecha → tensión lumbar ipsilateral L1–L2 → lumbalgia",
    ],
    exercises: ["Respiración diafragmática", "Activación del core profundo (hipopresivos)", "Movilización visceral suave"],
  },
};

export default function AnatomyPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState("anatomy");

  const region = selectedId ? REGIONS.find(r => r.id === selectedId) : null;
  const content = selectedId ? REGION_CONTENT[selectedId] : null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={region ? `Anatomía — ${region.label}` : "Anatomía Aplicada"}
          subtitle={region ? "5 capas de conocimiento clínico" : "Selecciona una región para explorar"}
        />
        <main className="flex-1 overflow-y-auto">

          {region && content ? (
            /* ── Vista detalle de región ───────────────────────────────────── */
            <div className="p-6 max-w-5xl mx-auto space-y-5">

              <button
                onClick={() => { setSelectedId(null); setActiveLayer("anatomy"); }}
                className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a todas las regiones
              </button>

              {/* Hero */}
              <div className={cn("rounded-2xl bg-gradient-to-r p-6 text-white", region.grad)}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{region.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{region.label}</h2>
                    <p className="text-white/70 text-sm mt-1">
                      {region.techniques} técnicas clínicas · 5 capas de conocimiento
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector de capas */}
              <div className="flex flex-wrap gap-2">
                {LAYERS.map(layer => (
                  <button
                    key={layer.key}
                    onClick={() => setActiveLayer(layer.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      activeLayer === layer.key
                        ? layer.color + " shadow-sm"
                        : "bg-white border-surface-200 text-surface-600 hover:border-surface-300"
                    )}
                  >
                    <span>{layer.icon}</span>
                    {layer.label}
                  </button>
                ))}
              </div>

              {/* Contenido de la capa activa */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{LAYERS.find(l => l.key === activeLayer)?.icon}</span>
                    <h3 className="text-base font-bold text-surface-900">
                      {LAYERS.find(l => l.key === activeLayer)?.label} — {region.label}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {(content[activeLayer] ?? []).map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-600/10 text-brand-700 text-[11px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <p className="text-sm text-surface-700 leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Ejercicios relacionados */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="h-4 w-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-surface-900">Ejercicios relacionados</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(content.exercises ?? []).map((ex, i) => (
                      <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full border border-brand-100">
                        {ex}
                      </span>
                    ))}
                  </div>
                  <a
                    href="../exercises"
                    className="mt-4 flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:underline"
                  >
                    <BookOpen className="h-3 w-3" />
                    Ver todos los ejercicios en la biblioteca
                  </a>
                </CardContent>
              </Card>

            </div>

          ) : (

            /* ── Grilla de regiones ─────────────────────────────────────────── */
            <div className="p-6 max-w-6xl mx-auto space-y-6">

              {/* Leyenda capas */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                    5 Capas de conocimiento clínico por región
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LAYERS.map((layer, i) => (
                      <div key={layer.key} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 border text-xs font-semibold", layer.color)}>
                        <span className="opacity-70 text-[10px]">{i + 1}</span>
                        <span>{layer.icon}</span>
                        {layer.label}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Grid de regiones */}
              <div>
                <h2 className="text-sm font-semibold text-surface-700 mb-3">Selecciona una región</h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {REGIONS.map((reg) => (
                    <Card
                      key={reg.id}
                      onClick={() => { setSelectedId(reg.id); setActiveLayer("anatomy"); }}
                      className="group cursor-pointer hover:shadow-card-md hover:-translate-y-0.5 transition-all hover:border-brand-300"
                    >
                      <CardContent className="p-4 text-center">
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center text-2xl",
                          reg.grad
                        )}>
                          {reg.emoji}
                        </div>
                        <p className="text-sm font-semibold text-surface-900">{reg.label}</p>
                        <p className="text-xs text-surface-400 mt-1">{reg.techniques} técnicas</p>
                        <div className="mt-2.5 flex justify-center gap-0.5">
                          {LAYERS.map((layer, i) => (
                            <div key={i} className={cn("h-1.5 w-5 rounded-full", layer.color.split(" ")[0])} />
                          ))}
                        </div>
                        <div className="mt-2.5 flex items-center justify-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
                          Explorar <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
