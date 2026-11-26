// Diagnóstico → regiones de la biblioteca a trabajar: la lesionada primero y después las de su cadena
// (las estructuras ligadas que también hay que fortalecer o movilizar, no solo la lastimada).
// Claves de región = REGION_GROUPS de videoLibrary.ts.

type Rule = { re: RegExp; regions: string[] };

const n = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const RULES: Rule[] = [
  // rodilla: cadera controla el valgo, tobillo la carga
  { re: /\b(lca|lcp|acl|pcl)\b|cruzad|menisc|rodill|rotul|patelo|patelar|condromalac|gonartros|colateral|cintilla|iliotibial|osgood|plica|knee|patell/, regions: ["rodilla", "cadera", "tobillo"] },
  // tobillo y pie
  { re: /tobill|aquil|achil|fasci.{0,4}plantar|plantar|\bpie\b|juanete|hallux|metatars|periostit|tibial post|shin|ankle|\bfoot\b|calcane|espolon/, regions: ["tobillo", "rodilla", "cadera"] },
  // isquiotibiales / muslo
  { re: /isquio|hamstring|cuadricep|quadricep|muslo|thigh/, regions: ["cadera", "rodilla", "lumbar"] },
  // cadera y pelvis
  { re: /cadera|coxartros|trocant|glute|piriform|pubalg|aductor|ingle|inguinal|\bhip\b|groin|femoroacetab|labrum/, regions: ["cadera", "lumbar", "rodilla"] },
  // lumbar
  { re: /lumb|ciatic|sciatic|sacro|lumbo|low back|lower back|\bl[1-5]\b|facetar/, regions: ["lumbar", "toracica", "cadera"] },
  // torácica / dorsal
  { re: /dorsal|torac|thorac|escolios|cifosis|kyphos|scolios|costal|costill|\bt[1-9]\b|\bt1[0-2]\b|upper back/, regions: ["toracica", "cervical", "lumbar", "hombro"] },
  // hombro y escápula
  { re: /manguito|rotador|supraespin|infraespin|subescapul|redondo|hombro|glenohum|subacromi|pinzamiento|impingement|bicipit|capsulit|congelad|acromio|clavicul|escapul|discinesi|bankart|slap|shoulder|rotator|cuff/, regions: ["hombro", "toracica", "cervical"] },
  // cervical
  { re: /cervic|cuello|latigazo|whiplash|torticol|cefalea|migra|neck|\bc[1-7]\b|braquialg/, regions: ["cervical", "toracica", "hombro"] },
  // ATM
  { re: /\batm\b|temporomandib|bruxism|mandib|\btmj\b|jaw/, regions: ["atm", "cervical"] },
  // codo
  { re: /epicond|codo|tenista|golfista|epitrocle|elbow|tennis|olecran/, regions: ["codo", "muneca", "hombro"] },
  // muñeca y mano
  { re: /muneca|carpian|carpal|quervain|gatillo|rizartros|\bmano\b|dedo|falang|radio distal|wrist|\bhand\b|finger|trigger/, regions: ["muneca", "codo"] },
];

// términos de columna sin nivel (hernia, disco, estenosis…): si no se dice cuál, se asume lumbar
const SPINE_GENERIC: Rule = { re: /hernia|discal|disco|protrus|espondil|estenosis|radiculop|columna|spine|disc/, regions: ["lumbar", "toracica", "cadera"] };

/** Regiones sugeridas para un diagnóstico (vacío si no se reconoce). La primera es la principal:
 *  la de la región que se menciona primero en el texto. */
export function regionsForDiagnosis(dx: string | null | undefined): string[] {
  if (!dx) return [];
  const t = n(dx);
  const hits = RULES.map((r) => ({ r, i: t.search(r.re) })).filter((h) => h.i >= 0).sort((a, b) => a.i - b.i);
  if (!hits.length && SPINE_GENERIC.re.test(t)) hits.push({ r: SPINE_GENERIC, i: 0 });
  const out: string[] = [];
  for (const { r } of hits) for (const g of r.regions) if (!out.includes(g)) out.push(g);
  return out;
}

// Músculos clave por diagnóstico: el plan base prioriza los ejercicios que los trabajan o estiran.
const MUSCLES: { re: RegExp; m: string[] }[] = [
  { re: /manguito|rotador|supraespin|infraespin|subescapul|subacromi|pinzamiento|impingement|rotator|cuff/, m: ["supraspinatus", "infraspinatus", "teres_minor", "subscapularis", "serratus_anterior", "trapezius_lower", "glenohumeral_capsule_posterior"] },
  { re: /capsulit|congelad|frozen/, m: ["glenohumeral_capsule_posterior", "glenohumeral_capsule_anterior", "infraspinatus", "subscapularis", "pectoralis_major"] },
  { re: /escapul|discinesi|hombro|shoulder|acromio/, m: ["serratus_anterior", "trapezius_lower", "trapezius_middle", "rhomboid_major", "infraspinatus", "supraspinatus"] },
  { re: /cervic|cuello|latigazo|whiplash|torticol|cefalea|neck/, m: ["longus_colli", "longus_capitis", "semispinalis_cervicis", "trapezius_lower", "levator_scapulae", "trapezius_upper", "sternocleidomastoid"] },
  { re: /\batm\b|temporomandib|bruxism|mandib|jaw/, m: ["masseter", "temporalis", "lateral_pterygoid", "suprahyoids", "longus_colli"] },
  { re: /epicond|codo de tenista|tenista|tennis/, m: ["extensor_carpi_radialis_brevis", "extensor_carpi_radialis_longus", "extensor_digitorum", "supinator"] },
  { re: /epitrocle|golfista/, m: ["flexor_carpi_radialis", "flexor_carpi_ulnaris", "pronator_teres", "flexor_digitorum_superficialis"] },
  { re: /carpian|carpal|quervain|muneca|wrist|mano|hand/, m: ["flexor_digitorum_superficialis", "abductor_pollicis_longus", "extensor_carpi_ulnaris", "lumbricals_hand", "opponens_pollicis"] },
  { re: /dorsal|torac|thorac|cifosis|kyphos|escolios/, m: ["erector_spinae_thoracic", "trapezius_middle", "rhomboid_major", "pectoralis_minor", "rotatores", "multifidus"] },
  { re: /lumb|ciatic|sciatic|hernia|disc|espondil|estenosis|sacro|low back/, m: ["transversus_abdominis", "multifidus", "gluteus_maximus", "gluteus_medius", "quadratus_lumborum", "iliopsoas", "rectus_abdominis", "internal_oblique"] },
  { re: /cadera|coxartros|trocant|glute|piriform|\bhip\b|labrum|femoroacetab/, m: ["gluteus_medius", "gluteus_maximus", "gluteus_minimus", "iliopsoas", "piriformis", "tensor_fasciae_latae", "adductor_longus"] },
  { re: /pubalg|aductor|ingle|groin/, m: ["adductor_longus", "adductor_magnus", "gracilis", "pectineus", "transversus_abdominis", "gluteus_medius"] },
  { re: /isquio|hamstring/, m: ["biceps_femoris", "semitendinosus", "semimembranosus", "gluteus_maximus"] },
  { re: /\b(lca|acl)\b|cruzad|menisc|rodill|knee/, m: ["vastus_medialis", "rectus_femoris", "vastus_lateralis", "biceps_femoris", "semitendinosus", "gluteus_medius", "gastrocnemius"] },
  { re: /rotul|patelo|patelar|condromalac|patell|cintilla|iliotibial/, m: ["vastus_medialis", "gluteus_medius", "tensor_fasciae_latae", "iliotibial_band", "rectus_femoris"] },
  { re: /tobill|ankle|esguince/, m: ["fibularis_longus", "fibularis_brevis", "tibialis_anterior", "tibialis_posterior", "gastrocnemius", "soleus"] },
  { re: /aquil|achil/, m: ["gastrocnemius", "soleus", "tibialis_posterior"] },
  { re: /plantar|pie|foot|espolon|calcane|hallux|juanete/, m: ["plantar_fascia", "flexor_digitorum_brevis", "lumbricals_foot", "gastrocnemius", "soleus", "tibialis_posterior"] },
];

/** Músculos clave del diagnóstico (vacío si no se reconoce). */
export function musclesForDiagnosis(dx: string | null | undefined): string[] {
  if (!dx) return [];
  const t = n(dx);
  const out: string[] = [];
  for (const r of MUSCLES) if (r.re.test(t)) for (const m of r.m) if (!out.includes(m)) out.push(m);
  return out;
}
