/**
 * Shared anatomy data for exercises and osteopathy pages.
 * 5 clinical knowledge layers per body region.
 */

export type AnatomyLayer = "anatomy" | "physiology" | "dysfunctions" | "effects" | "connections";

export interface RegionAnatomyData {
  anatomy:      string[];
  physiology:   string[];
  dysfunctions: string[];
  effects:      string[];
  connections:  string[];
}

// Maps exercise region filter names → anatomy data key
export const REGION_TO_ANATOMY_KEY: Record<string, string> = {
  "Hombro":         "shoulder",
  "Cervical":       "cervical",
  "Torácica":       "thoracic",
  "Lumbar":         "lumbar",
  "Lumbar / Core":  "lumbar",
  "Core":           "lumbar",
  "Cadera":         "hip",
  "Glúteo":         "hip",
  "Rodilla":        "knee",
  "Tobillo":        "ankle",
  "Codo":           "elbow",
  "Muñeca/Mano":    "wrist",
  "Espalda media":  "thoracic",
};

export const ANATOMY_LAYERS = [
  { key: "anatomy",      label: "Anatomía",            icon: "🔬", color: "bg-blue-50 text-blue-800 border-blue-200" },
  { key: "physiology",   label: "Fisiología",          icon: "⚡", color: "bg-green-50 text-green-800 border-green-200" },
  { key: "dysfunctions", label: "Disfunciones",        icon: "⚠️", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { key: "effects",      label: "Efectos terapéuticos", icon: "✨", color: "bg-purple-50 text-purple-800 border-purple-200" },
  { key: "connections",  label: "Conexiones clínicas",  icon: "🔗", color: "bg-rose-50 text-rose-800 border-rose-200" },
] as const;

export const REGION_CONTENT: Record<string, RegionAnatomyData> = {
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
      "Lesión del labrum: dolor inguinal profundo con click articular",
      "Coxartrosis: desgaste del cartílago articular con limitación progresiva del ROM",
      "Bursitis del trocánter mayor: inflamación del tendón glúteo medio/menor",
      "Síndrome del piriforme: dolor glúteo profundo con compresión del ciático",
    ],
    effects: [
      "Articulatoria de cadera: restaura el glide articular y la rotación interna",
      "MET del piriforme: estira el piriforme y libera la compresión del nervio ciático",
      "Liberación del psoas: reduce la tensión lumbar y mejora la extensión de cadera",
      "Movilización del labrum: técnica de tracción + rotación para liberar el atrapamiento",
    ],
    connections: [
      "Restricción de cadera → compensación lumbar → lumbalgia secundaria crónica",
      "Debilidad del glúteo medio → varo de rodilla → condromalacia patelar",
      "Psoas acortado → anteversión pélvica → hiperlordosis lumbar",
      "Disfunción de la SI → inhibición refleja del glúteo mayor → inestabilidad de cadera",
    ],
  },
  knee: {
    anatomy: [
      "Articulación tibiofemoral: compartimentos medial y lateral con meniscos medial y lateral",
      "Ligamentos cruzados anterior (LCA) y posterior (LCP): estabilidad anteroposterior",
      "Ligamentos colaterales medial (LCM) y lateral (LCL): estabilidad frontal",
      "Rótula: el hueso sesamoideo más grande, aumenta la palanca del cuádriceps",
      "Tendón patelar y cuadricipital, bursa prerrotuliana y suprarrotuliana",
    ],
    physiology: [
      "El LCA se tensa en extensión y protege contra la traslación tibial anterior",
      "Los meniscos distribuyen la carga articular y amortiguan el impacto",
      "El cuádriceps genera 3–4× el peso corporal sobre la rótula al bajar escaleras",
      "El ángulo Q (cadera–rótula–tibia) determina el riesgo de lesión patelar: >20° es anormal",
      "La rodilla rota internamente en los últimos 10–15° de extensión (mecanismo de cierre)",
    ],
    dysfunctions: [
      "Lesión de LCA: pivote + valgo + rotación externa; déficit de estabilidad funcional",
      "Condromalacia patelar: degeneración del cartílago patelar por malalineamiento",
      "Síndrome de banda iliotibial: fricción de la IT band sobre el cóndilo lateral femoral",
      "Rotura meniscal: dolor en interlínea articular, bloqueo, McMurray positivo",
      "Tendinopatía patelar (rodilla del saltador): dolor anterior en el tendón patelar",
    ],
    effects: [
      "Fortalecimiento de cuádriceps: aumenta la estabilidad en cadena cinética cerrada",
      "Movilización patelar: restaura el deslizamiento lateral y medial de la rótula",
      "MET de isquiotibiales: reduce la tensión posterior y mejora la extensión terminal",
      "Propiocepción en plataforma inestable: reprograma los mecanoreceptores articulares",
    ],
    connections: [
      "Debilidad del glúteo medio → valgo dinámico de rodilla → sobrecarga patelar",
      "Restricción de tobillo → compensación en rodilla → síndrome de banda iliotibial",
      "Acortamiento de gemelos/sóleo → hiperextensión de rodilla en apoyo",
      "Restricción de cadera → rotación compensatoria tibiofemoral → sobrecarga meniscal",
    ],
  },
  ankle: {
    anatomy: [
      "Articulación tibioastragalina: mortaja tibioperonea + domo del astrágalo",
      "Articulación subastragalina: permite la inversión/eversión (0–30°/0–20°)",
      "Ligamento peroneoastragalino anterior (LPAA): el más lesionado en esguinces",
      "Ligamento deltoideo (medial): complejo de 4 fascículos, lesión menos frecuente",
      "Tendón de Aquiles: inserta el gastrocnemio y sóleo en el calcáneo",
    ],
    physiology: [
      "La dorsiflexión normal es ≥10° (mínimo para subir escaleras y ponerse en cuclillas)",
      "El astrágalo se desplaza anteriormente en flexión plantar: factor de estabilidad dinámica",
      "La cadena cinética del pie: pronación subtalar → rotación interna tibia → flexión rodilla",
      "El gastrocnemio actúa a través de la rodilla (extensor) y el tobillo (flexor plantar)",
      "El tobillo soporta 1.5× el peso corporal en marcha y 3–5× en carrera",
    ],
    dysfunctions: [
      "Esguince lateral de tobillo: lesión de LPAA (grado I–III) por mecanismo de inversión",
      "Tendinopatía de Aquiles: degeneración del tendón por sobrecarga repetitiva",
      "Síndrome del tibial posterior: dolor medial, pronación excesiva y pie plano adquirido",
      "Rigidez articular posterior de tobillo: restricción de dorsiflexión por retracción capsular",
      "Fascitis plantar: tensión en la fascia plantar, dolor en talón matutino",
    ],
    effects: [
      "Movilización tibioastragalina posterior: restaura la dorsiflexión limitada",
      "Ejercicios de propiocepción: reentrenan el control neuromuscular post-esguince",
      "Fortalecimiento excéntrico de sóleo: primera línea en tendinopatía de Aquiles",
      "Movilización subastragalina: mejora la inversión/eversión limitada",
    ],
    connections: [
      "Rigidez de tobillo → compensación en rodilla → síndrome femoropatelar",
      "Pronación excesiva → rotación interna tibial → valgo de rodilla → sobrecarga lumbar",
      "Restricción subastragalina → disfunción del patrón de marcha → cadena ascendente",
      "Tensinopatía de Aquiles → alteración del ciclo estiramiento-acortamiento → tobillo rígido",
    ],
  },
  thoracic: {
    anatomy: [
      "12 vértebras T1–T12 con articulaciones costovertebrales (cabeza + tubérculo costal)",
      "La columna torácica articula con 12 pares de costillas formando la caja torácica",
      "Articulaciones facetarias: orientación frontal (60°) → permiten rotación, limitan F/E",
      "Disco intervertebral: núcleo pulposo altamente hidratado, anillo fibroso multilamelar",
      "Cadena simpática paravertebral: T1–L2 controla la función visceral",
    ],
    physiology: [
      "La rotación torácica total es 35–45° (mayor que lumbar por orientación facetaria)",
      "El movimiento respiratorio mueve cada costilla 2–5 cm en inspiración profunda",
      "La unión cervicotorácica (C7–T1) es una zona de cambio biomecánico frecuentemente disfuncional",
      "El diafragma se inserta en T10–L2: su disfunción altera la mecánica torácica",
      "La extensión torácica normal es 25–30°: reducción es factor de riesgo cervical",
    ],
    dysfunctions: [
      "Hipomobilidad torácica: la más común, contribuye a disfunción cervical y lumbar",
      "Disfunción costal: restricción en articulación costovertebral → dolor intercostal",
      "Disfunción simpática visceral: tensión T5–T9 correlaciona con disfunción gástrica",
      "Hipercifosis: pérdida de extensión → síndrome cruzado superior → hombros adelantados",
      "Síndrome de Scheuermann: cifosis estructural por acuñamiento vertebral en adolescentes",
    ],
    effects: [
      "HVLA torácico: libera la restricción facetaria con efecto analgésico inmediato",
      "Rib raising: estimula el simpático toraco-lumbar T1–L2 y mejora la función visceral",
      "Articulatoria torácica: mejora la rotación y extensión, prepara para técnicas específicas",
      "Bomba linfática torácica: drena el ducto torácico, útil en infecciones respiratorias",
    ],
    connections: [
      "Hipomobilidad T1–T4 → transmisión del estrés mecánico a columna cervical",
      "Disfunción T5–T9 → influencia neurovegetativa sobre el estómago y vesícula biliar",
      "Hipercifosis torácica → anteriorización de cabeza → sobrecarga suboccipital",
      "Restricción torácica → reducción del espacio subacromial → síndrome de hombro",
    ],
  },
  elbow: {
    anatomy: [
      "Articulación humeroulnar: bisagra, flexoextensión 0–145°",
      "Articulación humerorradial: permite prono-supinación (0–90° cada lado)",
      "Articulación radioulnar proximal: forma el mecanismo de prono-supinación",
      "Epicóndilo lateral: inserción de extensores de muñeca (extensor carpi radialis)",
      "Epicóndilo medial: inserción de flexores de muñeca y pronador redondo",
    ],
    physiology: [
      "El eje de prono-supinación va de cabeza del radio a estiloides cubital",
      "El bíceps es el supinador más potente (especialmente con codo a 90°)",
      "El nervio cubital pasa por el surco epitroclear: vulnerable a compresión en flexión",
      "El nervio radial se divide en el codo: nervio interóseo posterior (motor) y sensitivo",
      "Carga normal en el codo: compresión en el compartimento lateral (55%) y medial (45%)",
    ],
    dysfunctions: [
      "Epicondilitis lateral (codo de tenista): tendinopatía del extensor carpi radialis brevis",
      "Epicondilitis medial (codo de golfista): tendinopatía de flexores y pronador",
      "Compresión del nervio cubital: hormigueo en 4º y 5º dedo, debilidad intrínseca",
      "Bursitis olecraneana: inflamación de la bolsa posterior del codo por presión crónica",
      "Síndrome del túnel radial: compresión del nervio interóseo posterior",
    ],
    effects: [
      "MET de extensores: reduce el espasmo y mejora la flexión de muñeca",
      "Movilización lateral del codo: restaura el glide humerorradial",
      "Liberación del nervio cubital: movilización neural con técnica de deslizamiento",
      "Técnica de Mills: HVLA para epicondilitis lateral refractaria",
    ],
    connections: [
      "Disfunción cervical C5–C7 → dolor referido al codo + debilidad muscular distal",
      "Restricción del hombro → compensación en el codo → sobreuso del extensor radial",
      "Tensión del pronador redondo → compresión del nervio mediano → túnel del carpo",
      "Disfunción torácica T1–T2 → influencia sobre el plexo braquial inferior",
    ],
  },
  wrist: {
    anatomy: [
      "8 huesos del carpo: 2 filas (escafoides, semilunar, piramidal, pisiforme / trapezoide, trapecio, grande, ganchoso)",
      "Articulación radiocarpiana: flexoextensión 80°/70°, desviación radial/cubital 20°/30°",
      "Complejo fibrocartilaginoso triangular (CFCT): estabilizador clave de la radioulnar distal",
      "Túnel del carpo: 9 tendones flexores + nervio mediano bajo el retináculo flexor",
      "Canal de Guyon: nervio y arteria cubital entre pisiforme y ganchoso",
    ],
    physiology: [
      "La cadena cinemática del carpo: filiera proximal (adaptación) + distal (transmisión)",
      "La muñeca posiciona la mano para la función: extensión de muñeca = agarre más fuerte",
      "El nervio mediano inerva la eminencia tenar: su compresión → debilidad de oposición del pulgar",
      "La desviación cubital es el movimiento más potente de la muñeca (martilleo, golpe)",
      "La extensión de muñeca está acoplada con la supinación del antebrazo",
    ],
    dysfunctions: [
      "Síndrome del túnel del carpo: compresión del nervio mediano, hormigueo nocturno",
      "Tendinitis de De Quervain: tenosinovitis de abductor largo y extensor corto del pulgar",
      "Lesión del CFCT: inestabilidad radioulnar distal con dolor en clunk cubital",
      "Síndrome del canal de Guyon: compresión del nervio cubital a nivel de la muñeca",
      "Ganglión del carpo: quiste sinovial frecuente en dorso de la muñeca",
    ],
    effects: [
      "Movilización del carpo: restaura el glide intercarpal para mejorar la flexoextensión",
      "Liberación neural del mediano: técnica de deslizamiento del nervio por el túnel",
      "MET de pronadores/supinadores: equilibra la tensión muscular del antebrazo",
      "Inhibición del retináculo: reduce la presión sobre el nervio mediano",
    ],
    connections: [
      "Compresión en el túnel del carpo → puede origen en C6 o codo (diagnóstico diferencial)",
      "Disfunción de la radioulnar distal → dolor proximal en el codo (cadena ascendente)",
      "Acortamiento de flexores del antebrazo → epicondilitis medial → disfunción de codo",
      "Tensión cervical C6–C7 → parestesias en mano → simulación de túnel del carpo",
    ],
  },
};
