"use client";

import { useState } from "react";
import { Search, Clock, Repeat2, CheckCircle2, Play } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExercisePlayer, type ExerciseData } from "@/components/exercises/ExercisePlayer";
import { ENGINE_MAP } from "@/components/exercises/ExerciseAnimationEngine";
import { REGION_TO_ANATOMY_KEY, REGION_CONTENT, ANATOMY_LAYERS } from "@/lib/anatomyData";
import { EXERCISE_REGISTRY } from "@/lib/exerciseRegistry";
import exerciseRegistry from "@registry/exercises.json";

// ─── Base de datos de ejercicios con instrucciones completas ─────────────────
const BASE_EXERCISES: ExerciseData[] = [
  {
    id: "shoulder-external-rotation",
    name: "Shoulder External Rotation",
    nameLocal: "Rotación Externa de Hombro",
    region: "Hombro",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Infraespinoso", "Redondo menor", "Manguito rotador"],
    keyPoint: "Activa el manguito rotador sin compensar con el trapecio.",
    steps: [
      "Párate de lado con una banda anclada a la altura del codo.",
      "Dobla el codo a 90° y pega el antebrazo al cuerpo.",
      "Rota el antebrazo hacia afuera hasta 45–60°, manteniendo el codo pegado.",
      "Vuelve lentamente al inicio (3 segundos de retorno).",
      "Repite sin mover el hombro — solo el antebrazo rota.",
    ],
    tip: "Si sientes tensión en el trapecio, baja el hombro antes de cada repetición.",
    contraindications: "Evitar en fase aguda post-operatoria sin autorización médica.",
    youtubeSearch: "shoulder external rotation exercise physical therapy",
  },
  {
    id: "bird-dog",
    name: "Bird Dog",
    nameLocal: "Pájaro-Perro",
    region: "Lumbar / Core",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 30,
    musclesWorked: ["Multífidos", "Erector espinal", "Glúteo mayor", "Deltoides"],
    keyPoint: "El movimiento debe ser de columna neutra — sin rotación de cadera.",
    steps: [
      "Posición de cuatro apoyos: muñecas bajo hombros, rodillas bajo caderas.",
      "Activa el core como si fuera a recibir un golpe suave en el abdomen.",
      "Extiende brazo derecho y pierna izquierda simultáneamente.",
      "Mantén 2–3 segundos sin que la cadera suba ni rote.",
      "Regresa con control y cambia de lado. Alterna.",
    ],
    tip: "Imagina que tienes un vaso de agua en la espalda — no lo derames.",
    youtubeSearch: "bird dog exercise physical therapy tutorial",
  },
  {
    id: "hip-flexor-stretch",
    name: "Hip Flexor Stretch",
    nameLocal: "Estiramiento de Flexores de Cadera",
    region: "Cadera",
    difficulty: "beginner",
    durationSeconds: 30, sets: 2, restSeconds: 15,
    musclesWorked: ["Iliopsoas", "Recto femoral", "Tensor fascia lata"],
    keyPoint: "La retroversión pélvica activa el estiramiento — sin ella no hay efecto.",
    steps: [
      "Posición de zancada: rodilla trasera en el suelo, pie delantero al frente.",
      "Retroversa la pelvis (lleva el pubis hacia arriba, aplana la lumbar).",
      "Con la pelvis bloqueada, avanza ligeramente el tronco hacia delante.",
      "Siente el tirón en la ingle de la pierna trasera. Mantén 30 segundos.",
      "Para intensificar: eleva el brazo del mismo lado hacia arriba.",
    ],
    tip: "Sin retroversión pélvica, el estiramiento es superficial. Ese es el error más común.",
    youtubeSearch: "hip flexor stretch physical therapy tutorial",
  },
  {
    id: "resistance-band-row",
    name: "Resistance Band Row",
    nameLocal: "Remo con Banda Elástica",
    region: "Espalda media",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Romboides", "Trapecio medio", "Deltoides posterior", "Bíceps braquial"],
    keyPoint: "Inicia el movimiento apretando los omóplatos — los brazos son secundarios.",
    steps: [
      "Ancla la banda a la altura del pecho. Agarra un extremo con cada mano.",
      "Párate con brazos extendidos y codos ligeramente flexionados.",
      "Retrae los omóplatos primero (junta escápulas), luego jala los codos hacia atrás.",
      "Lleva las manos a los costados y mantén 1 segundo apretando.",
      "Extiende lentamente hasta posición inicial (3 segundos).",
    ],
    tip: "Si los hombros suben hacia las orejas, reduce el peso. El trapecio superior no debe dominar.",
    youtubeSearch: "resistance band row exercise tutorial",
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    nameLocal: "Elevación Lateral con Mancuerna",
    region: "Hombro",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Deltoides medial", "Supraespinoso", "Trapecio superior"],
    keyPoint: "Para en 90° — más arriba activa el trapecio y pierde efectividad.",
    steps: [
      "Párate con mancuernas a los lados, codos ligeramente flexionados.",
      "Eleva los brazos lateralmente hasta la altura del hombro (90°).",
      "Las palmas miran hacia abajo. Los pulgares apuntan ligeramente hacia abajo.",
      "Mantén 1 segundo arriba, baja lentamente en 3 segundos.",
      "No uses el impulso del cuerpo — movimiento puro del deltoides.",
    ],
    tip: "Si no puedes controlar el descenso, el peso es demasiado alto. Prioriza la excéntrica.",
    youtubeSearch: "dumbbell lateral raise exercise tutorial",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    nameLocal: "Puente de Glúteos",
    region: "Glúteo / Lumbar",
    difficulty: "beginner",
    sets: 4, reps: 12, restSeconds: 30,
    musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Core", "Erector espinal"],
    keyPoint: "El glúteo debe ser el motor — no la espalda baja.",
    steps: [
      "Tumbado boca arriba, rodillas a 90°, pies planos en el suelo (ancho de cadera).",
      "Activa el core presionando suavemente la lumbar al suelo.",
      "Aprieta los glúteos y eleva las caderas formando línea recta hombro-rodilla.",
      "Mantén 2 segundos en la cima apretando fuerte.",
      "Baja lentamente vértebra a vértebra. No te desplomes.",
    ],
    tip: "Si sientes la lumbar, empuja más con los talones y aprieta más los glúteos.",
    youtubeSearch: "glute bridge exercise physical therapy",
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    nameLocal: "Bicho Muerto",
    region: "Core",
    difficulty: "intermediate",
    sets: 3, reps: 8, restSeconds: 45,
    musclesWorked: ["Transverso abdominal", "Multífidos", "Iliopsoas", "Diafragma"],
    keyPoint: "La zona lumbar NUNCA debe separarse del suelo — eso es todo.",
    steps: [
      "Tumbado boca arriba, rodillas a 90° sobre cadera, brazos al techo.",
      "Presiona la zona lumbar activamente contra el suelo — activa el transverso.",
      "Inspira. Al exhalar, extiende brazo derecho + pierna izquierda lentamente.",
      "Mantén la lumbar pegada. Si se despega, no has llegado tan lejos.",
      "Inhala al regresar al centro. Cambia de lado. 8 repeticiones por lado.",
    ],
    tip: "Exhala profundo antes de mover las extremidades. El diafragma es parte del core.",
    contraindications: "Evitar en hernias discales agudas o dolor lumbar irradiado activo.",
    youtubeSearch: "dead bug exercise physical therapy core",
  },
  {
    id: "plank",
    name: "Plank",
    nameLocal: "Plancha Abdominal",
    region: "Core",
    difficulty: "beginner",
    sets: 3, durationSeconds: 30, restSeconds: 45,
    musclesWorked: ["Transverso abdominal", "Recto abdominal", "Glúteo mayor", "Serratos"],
    keyPoint: "Una plancha perfecta de 20s > una mala plancha de 2 minutos.",
    steps: [
      "Apóyate en antebrazos y puntas de pies, cuerpo recto como una tabla.",
      "Activa glúteos, core y presiona el suelo con los antebrazos.",
      "La cabeza en línea con la columna — no la bajes ni la eleves.",
      "Mantén sin que las caderas suban o bajen. Respira.",
      "Si la forma cae, termina la serie. Calidad > cantidad.",
    ],
    tip: "Aprieta los puños y empuja contra el suelo — activa más el core.",
    youtubeSearch: "plank exercise proper form tutorial",
  },
  {
    id: "cervical-retraction",
    name: "Cervical Retraction",
    nameLocal: "Retracción Cervical",
    region: "Cervical",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 20,
    musclesWorked: ["Flexores cervicales profundos", "Longus colli", "Longus capitis"],
    keyPoint: "Hay que notar una doble barbilla — ese es el movimiento correcto.",
    steps: [
      "Siéntate o párate con la espalda recta y hombros relajados.",
      "Sin mover el tronco, desliza la cabeza hacia atrás.",
      "Sientes una suave doble barbilla. Mantén 3–5 segundos.",
      "Vuelve a posición neutra. El movimiento es horizontal, no inclines.",
      "Repite 10 veces. Con ojos en un punto fijo al frente.",
    ],
    tip: "Si tienes dolor de cabeza al hacerlo, el rango es demasiado amplio. Reduce.",
    youtubeSearch: "cervical retraction chin tuck exercise physical therapy",
  },
  {
    id: "ankle-pumps",
    name: "Ankle Pumps",
    nameLocal: "Bombeos de Tobillo",
    region: "Tobillo",
    difficulty: "beginner",
    sets: 2, reps: 20, restSeconds: 15,
    musclesWorked: ["Gastrocnemio", "Sóleo", "Tibial anterior", "Sistema venoso"],
    keyPoint: "Activa la bomba venosa muscular — esencial en postoperatorio.",
    steps: [
      "Tumbado o sentado con las piernas estiradas.",
      "Lleva el pie hacia arriba (flexión dorsal) lo máximo posible.",
      "Mantén 2 segundos y lleva el pie hacia abajo (flexión plantar).",
      "Alterna los dos pies a ritmo lento y controlado.",
      "20 repeticiones por tobillo, dos veces al día si es post-quirúrgico.",
    ],
    tip: "Fundamental en las primeras 24–48h post-cirugía para prevenir TVP.",
    youtubeSearch: "ankle pumps exercise physical therapy post surgery",
  },
  {
    id: "cat-cow",
    name: "Cat-Cow Stretch",
    nameLocal: "Estiramiento Gato-Vaca",
    region: "Lumbar / Torácica",
    difficulty: "beginner",
    sets: 2, reps: 10, restSeconds: 20,
    musclesWorked: ["Erector espinal", "Multífidos", "Recto abdominal", "Serratos"],
    keyPoint: "Moviliza toda la columna — es calentamiento, no ejercicio de fuerza.",
    steps: [
      "Cuatro apoyos: muñecas bajo hombros, rodillas bajo caderas.",
      "VACA: inhala, deja el vientre caer, eleva cabeza y coxis.",
      "GATO: exhala, arquea la espalda hacia el techo, mete el coxis.",
      "Alterna fluidamente desde el coxis hacia la cabeza.",
      "Mantén cada posición 1–2 respiraciones. Fluye sin forzar.",
    ],
    tip: "Más lento = más efectivo. No rebotes. Siente cada vértebra moverse.",
    youtubeSearch: "cat cow stretch exercise tutorial",
  },
  {
    id: "nerve-flossing",
    name: "Sciatic Nerve Flossing",
    nameLocal: "Deslizamiento Neural Ciático",
    region: "Nervio Ciático",
    difficulty: "beginner",
    sets: 2, reps: 15, restSeconds: 20,
    musclesWorked: ["Nervio ciático", "Isquiotibiales", "Gastrocnemio"],
    keyPoint: "Debe sentirse como un tirón tolerable — nunca como dolor agudo.",
    steps: [
      "Siéntate en el borde de una silla con la espalda recta.",
      "Extiende la pierna afectada mientras subes el pie (dorsiflexión).",
      "Simultáneamente inclina ligeramente la cabeza hacia delante.",
      "Dobla la rodilla y relaja el pie. Eso es 1 repetición.",
      "Repite 15 veces rítmicamente. Fluido, no estático.",
    ],
    tip: "No lo hagas en fase aguda de hernia discal con neurológico activo.",
    contraindications: "Hernia discal en fase aguda con irradiación severa.",
    youtubeSearch: "sciatic nerve flossing exercise tutorial",
  },
  {
    id: "pelvic-tilt",
    name: "Pelvic Tilt",
    nameLocal: "Retroversión Pélvica",
    region: "Lumbar / Pelvis",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 20,
    musclesWorked: ["Transverso abdominal", "Glúteo mayor", "Multífidos"],
    keyPoint: "Enseña al paciente a activar el core antes de cualquier movimiento.",
    steps: [
      "Tumbado boca arriba, rodillas flexionadas, pies en el suelo.",
      "Nota el espacio entre tu lumbar y el suelo.",
      "Aprieta abdomen y glúteos para pegar la lumbar al suelo.",
      "Mantén 5 segundos sin aguantar la respiración.",
      "Relaja. La columna debe moverse solo unos centímetros.",
    ],
    tip: "Este es el primer ejercicio que debe dominar cualquier paciente con lumbalgia.",
    youtubeSearch: "pelvic tilt exercise physical therapy",
  },
  {
    id: "lumbar-rotation",
    name: "Lumbar Rotation Stretch",
    nameLocal: "Rotación Lumbar en Supino",
    region: "Lumbar",
    difficulty: "beginner",
    sets: 2, durationSeconds: 30, restSeconds: 15,
    musclesWorked: ["Cuadrado lumbar", "Piriforme", "Oblicuos"],
    keyPoint: "Contrarotación de cabeza amplifica el estiramiento fascial.",
    steps: [
      "Tumbado boca arriba, rodillas juntas a 90°, brazos en T.",
      "Deja caer ambas rodillas hacia un lado lentamente.",
      "Gira la cabeza al lado contrario de las rodillas.",
      "Mantén 30 segundos respirando profundo.",
      "Regresa al centro y cambia de lado.",
    ],
    tip: "Si las rodillas no llegan al suelo, coloca un cojín debajo. No fuerces.",
    youtubeSearch: "lumbar rotation stretch exercise tutorial",
  },
  {
    id: "mckenzie-press",
    name: "McKenzie Press-Up",
    nameLocal: "Extensión Lumbar McKenzie",
    region: "Lumbar",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 30,
    musclesWorked: ["Erector espinal", "Multífidos", "Glúteo mayor"],
    keyPoint: "Indicado para hernias de predominio posterior — NO para estenosis.",
    steps: [
      "Tumbado boca abajo, manos bajo los hombros.",
      "Deja la pelvis y las piernas completamente relajadas en el suelo.",
      "Empuja con los brazos y eleva solo el tronco. Las caderas permanecen abajo.",
      "Llega hasta donde puedas sin dolor. Mantén 1–2 segundos.",
      "Baja lentamente. Si hay centralización del dolor → buena señal.",
    ],
    tip: "La centralización del dolor (de pierna a lumbar) es el objetivo terapéutico.",
    contraindications: "Contraindicado en estenosis de canal, espondilolistesis inestable.",
    youtubeSearch: "McKenzie press up extension exercise physical therapy",
  },
  {
    id: "knee-to-chest",
    name: "Knee to Chest Stretch",
    nameLocal: "Rodilla al Pecho",
    region: "Lumbar / Sacroilíaca",
    difficulty: "beginner",
    sets: 2, durationSeconds: 30, restSeconds: 15,
    musclesWorked: ["Glúteo mayor", "Erector lumbar", "Piriforme"],
    keyPoint: "Descomprime la articulación sacroilíaca ipsilateral.",
    steps: [
      "Tumbado boca arriba. Lleva una rodilla al pecho con ambas manos.",
      "Mantén la otra pierna estirada en el suelo.",
      "Tira suavemente de la rodilla hacia el pecho sin levantar el sacro.",
      "Mantén 30 segundos. Siente la apertura en la nalga y lumbar baja.",
      "Cambia de lado. Luego puedes hacer las dos rodillas juntas.",
    ],
    tip: "No levantes la cabeza. Mantén el cuello relajado.",
    youtubeSearch: "knee to chest stretch exercise tutorial",
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    nameLocal: "Peso Muerto Rumano",
    region: "Isquiotibiales / Lumbar",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 60,
    musclesWorked: ["Isquiotibiales", "Glúteo mayor", "Erector espinal", "Core"],
    keyPoint: "La columna siempre neutra — la flexión viene de la cadera, no de la espalda.",
    steps: [
      "De pie, mancuernas frente a los muslos, pies al ancho de caderas.",
      "Activa el core y saca pecho (columna neutra).",
      "Bisagra desde la cadera: empuja el coxis hacia atrás mientras bajas.",
      "Baja hasta sentir tirón en isquiotibiales (varía según flexibilidad).",
      "Vuelve empujando el suelo con los pies y apretando los glúteos.",
    ],
    tip: "Las mancuernas deben rozar las piernas en todo momento — si se separan, la técnica falla.",
    youtubeSearch: "romanian deadlift proper form tutorial",
  },
  {
    id: "lunge",
    name: "Lunge",
    nameLocal: "Zancada",
    region: "Pierna / Rodilla",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 45,
    musclesWorked: ["Cuádriceps", "Glúteo mayor", "Isquiotibiales", "Gastrocnemio"],
    keyPoint: "La rodilla delantera no debe pasar la punta del pie.",
    steps: [
      "De pie, da un paso largo hacia delante.",
      "Baja la rodilla trasera hacia el suelo (sin tocarlo).",
      "La rodilla delantera permanece sobre el tobillo.",
      "El tronco se mantiene vertical, no te inclines.",
      "Empuja con el talón delantero para volver. Alterna lados.",
    ],
    tip: "Si la rodilla colapsa hacia dentro, trabaja primero la fuerza de glúteo.",
    youtubeSearch: "lunge exercise proper form tutorial",
  },
  {
    id: "band-hip-abduction",
    name: "Band Hip Abduction",
    nameLocal: "Abducción de Cadera con Banda",
    region: "Cadera / Glúteo",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Glúteo medio", "Glúteo menor", "Tensor fascia lata"],
    keyPoint: "Glúteo medio débil = rodilla que colapsa en zancadas y squats.",
    steps: [
      "Coloca la banda sobre los muslos, encima de las rodillas.",
      "Párate con los pies al ancho de hombros, rodillas ligeramente flexionadas.",
      "Empuja las rodillas hacia afuera contra la banda sin mover los pies.",
      "Mantén 2 segundos y vuelve lentamente.",
      "O: tumbado de lado, eleva la pierna superior 45°.",
    ],
    tip: "El glúteo medio es el estabilizador principal de la rodilla.",
    youtubeSearch: "band hip abduction exercise glute med",
  },
  {
    id: "ball-bridge",
    name: "Ball Bridge",
    nameLocal: "Puente con Pelota",
    region: "Glúteo / Core",
    difficulty: "intermediate",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Core", "Gastrocnemio"],
    keyPoint: "La pelota aumenta la demanda propioceptiva — excelente post-rodilla.",
    steps: [
      "Tumbado boca arriba, talones sobre una pelota terapéutica.",
      "Brazos en el suelo a los lados para estabilidad.",
      "Aprieta glúteos y eleva las caderas — la pelota no debe moverse.",
      "Mantén 2 segundos arriba. Controla el descenso.",
      "Progresión: haz el puente con una sola pierna.",
    ],
    tip: "Si la pelota rueda, reduce el rango hasta controlar la estabilidad.",
    youtubeSearch: "exercise ball bridge hamstring curl tutorial",
  },
  {
    id: "wall-sit",
    name: "Wall Sit",
    nameLocal: "Sentadilla en Pared",
    region: "Cuádriceps / Rodilla",
    difficulty: "beginner",
    sets: 3, durationSeconds: 30, restSeconds: 45,
    musclesWorked: ["Cuádriceps", "Glúteo mayor", "Isquiotibiales"],
    keyPoint: "Isométrico puro — ideal cuando la articulación no tolera movimiento.",
    steps: [
      "Apoya la espalda plana contra la pared.",
      "Desliza hacia abajo hasta que las rodillas estén a 90°.",
      "Los pies planos en el suelo, talones bajo las rodillas.",
      "Mantén la posición sin que la espalda se separe de la pared.",
      "30 segundos. Si no llegas, empieza en 15s e incrementa 5s por sesión.",
    ],
    tip: "Rodillas en línea con los pies. Si duelen, sube un poco (ángulo menor de 90°).",
    youtubeSearch: "wall sit exercise physical therapy quadriceps",
  },
  {
    id: "foam-roller-thoracic",
    name: "Thoracic Extension (Foam Roller)",
    nameLocal: "Extensión Torácica con Rodillo",
    region: "Torácica",
    difficulty: "beginner",
    sets: 2, reps: 8, restSeconds: 30,
    musclesWorked: ["Erector espinal torácico", "Romboides", "Intercostales"],
    keyPoint: "La hipercifosis torácica genera compensaciones cervicales y de hombro.",
    steps: [
      "Apoya la zona torácica media en el rodillo de foam.",
      "Brazos cruzados en el pecho o manos detrás de la cabeza.",
      "Deja que la espalda se extienda sobre el rodillo.",
      "Mueve el rodillo 2–3 cm hacia arriba y repite.",
      "Trabaja de T6 a T12. Evita la zona lumbar y cervical.",
    ],
    tip: "Si cruje — es normal y suele ser alivio. Si duele — cambia el ángulo.",
    youtubeSearch: "thoracic extension foam roller exercise tutorial",
  },
  {
    id: "seated-knee-extension",
    name: "Seated Knee Extension",
    nameLocal: "Extensión de Rodilla en Sedestación",
    region: "Rodilla / Cuádriceps",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Cuádriceps", "Vasto medial oblicuo (VMO)"],
    keyPoint: "El VMO es el primer cuádriceps que se atrofia tras lesión de rodilla.",
    steps: [
      "Sentado en una silla firme, espalda recta.",
      "Opcional: peso de tobillo de 0.5–2 kg.",
      "Extiende la rodilla lentamente hasta casi recta.",
      "Mantén 2 segundos apretando el cuádriceps.",
      "Baja en 3 segundos con control total. No dejes caer.",
    ],
    tip: "La velocidad del descenso (excéntrica lenta) es más importante que subir.",
    youtubeSearch: "seated knee extension exercise physical therapy",
  },
  {
    id: "dumbbell-bicep-curl",
    name: "Dumbbell Bicep Curl",
    nameLocal: "Curl de Bíceps con Mancuerna",
    region: "Codo / Bíceps",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Bíceps braquial", "Braquial", "Braquiorradial"],
    keyPoint: "El codo no debe moverse — solo el antebrazo se mueve.",
    steps: [
      "De pie, mancuernas a los lados con palmas mirando al frente.",
      "Fija los codos pegados al cuerpo durante todo el movimiento.",
      "Sube las mancuernas hasta 90° o más sin mover los codos.",
      "Mantén 1 segundo arriba apretando el bíceps.",
      "Baja en 3 segundos con control. Evita el balanceo de tronco.",
    ],
    tip: "Si el tronco se balancea, el peso es demasiado alto.",
    youtubeSearch: "dumbbell bicep curl proper form tutorial",
  },
  {
    id: "prone-hip-extension",
    name: "Prone Hip Extension",
    nameLocal: "Extensión de Cadera en Prono",
    region: "Glúteo / Lumbar",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 25,
    musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Erector espinal"],
    keyPoint: "Prioriza la activación glútea — la lumbar no debe compensar.",
    steps: [
      "Tumbado boca abajo, piernas extendidas. Brazos bajo la frente.",
      "Contrae el glúteo de la pierna que vas a elevar.",
      "Eleva la pierna recta 15–20 cm del suelo. La cadera no rota.",
      "Mantén 2 segundos. La espalda no se arquea.",
      "Baja con control. Cambia de lado.",
    ],
    tip: "Si la lumbar se arquea, la pierna sube demasiado o el glúteo no está activado.",
    youtubeSearch: "prone hip extension exercise glute activation",
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    nameLocal: "Press de Hombro",
    region: "Hombro",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 60,
    musclesWorked: ["Deltoides anterior", "Deltoides medial", "Tríceps", "Trapecio superior"],
    keyPoint: "La columna lumbar debe mantenerse neutra — no te hiperextiendas.",
    steps: [
      "Siéntate o párate con mancuernas a altura de hombros, codos a 90°.",
      "Activa el core antes de subir.",
      "Empuja hacia arriba hasta casi extender los codos. No los bloquees.",
      "En la cima las mancuernas casi se tocan pero no se chocan.",
      "Baja lentamente en 3 segundos. No dejes caer.",
    ],
    tip: "Si arqueas la lumbar para terminar la repetición, el peso es demasiado alto.",
    youtubeSearch: "dumbbell shoulder press proper form tutorial",
  },

  // ═══ HOMBRO — Liga, Mancuerna ═══════════════════════════════════════════════
  {
    id: "band-internal-rotation",
    name: "Band Internal Rotation",
    nameLocal: "Rotación Interna de Hombro con Liga",
    region: "Hombro",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Subescapular", "Pectoral mayor", "Redondo mayor"],
    keyPoint: "Mantén el codo pegado al cuerpo durante todo el movimiento.",
    steps: [
      "Ancla la liga a la altura del codo en una puerta o pared.",
      "Colócate de lado, codo flexionado a 90°, antebrazo paralelo al suelo.",
      "Partiendo de rotación externa, rota el antebrazo hacia el abdomen.",
      "Controla el retorno en 3 segundos — no dejes que la liga te jale.",
      "Repite sin mover el hombro — solo el antebrazo rota.",
    ],
    tip: "Coloca una toalla doblada entre el codo y el costado para fijar el codo.",
    contraindications: "No en fase aguda post-operatoria de hombro sin autorización.",
    youtubeSearch: "shoulder internal rotation resistance band physical therapy",
  },
  {
    id: "band-w-exercise",
    name: "Band W Exercise",
    nameLocal: "Ejercicio W con Liga (Escápula)",
    region: "Hombro / Escápula",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Romboides", "Trapecio medio", "Infraespinoso", "Deltoides posterior"],
    keyPoint: "La letra W se forma con los brazos — codos a 90° en todo momento.",
    steps: [
      "Sujeta la liga con ambas manos, codos a 90°, brazos pegados al cuerpo.",
      "Tira de la liga separando los codos lateralmente (retracción escapular).",
      "Rota los antebrazos hacia arriba formando una W.",
      "Mantén 2 segundos con escápulas juntas y bajas.",
      "Vuelve con control.",
    ],
    tip: "Imagina que quieres juntar y bajar las escápulas al mismo tiempo.",
    youtubeSearch: "band W exercise shoulder blade scapular retraction posture",
  },
  {
    id: "dumbbell-front-raise",
    name: "Dumbbell Front Raise",
    nameLocal: "Elevación Frontal con Mancuerna",
    region: "Hombro",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Deltoides anterior", "Trapecio superior", "Supraespinoso"],
    keyPoint: "No sobrepasar la horizontal — el supraespinoso se comprime por encima de 90°.",
    steps: [
      "De pie, mancuernas en cada mano, palmas hacia abajo.",
      "Activa el core para no arquear la espalda.",
      "Eleva ambos brazos hacia el frente hasta la altura del hombro (90°).",
      "Mantén 1 segundo en la cima. Sin inercia ni balanceo.",
      "Baja en 3 segundos con control.",
    ],
    tip: "Si el hombro sube hacia la oreja al elevar, el peso es demasiado.",
    contraindications: "Síndrome subacromial activo: evitar elevación por encima de 90°.",
    youtubeSearch: "dumbbell front raise deltoid shoulder exercise tutorial",
  },
  {
    id: "prone-y-t-w",
    name: "Prone Y-T-W",
    nameLocal: "Y-T-W en Prono (Trapecio / Escápula)",
    region: "Hombro / Escápula / Torácica",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 45,
    musclesWorked: ["Trapecio inferior", "Trapecio medio", "Romboides", "Serrato anterior"],
    keyPoint: "Pesos muy ligeros o solo con el peso del brazo. Calidad > carga.",
    steps: [
      "Tumbado boca abajo en una camilla o inclinado, brazos colgando.",
      "Y: eleva los brazos en diagonal (como una Y), pulgares arriba.",
      "T: eleva los brazos en cruz horizontal (como una T), pulgares arriba.",
      "W: codos a 90°, eleva retrayendo las escápulas (como una W).",
      "10 repeticiones de cada letra. Descansa entre letras.",
    ],
    tip: "Si el trapecio superior compensa (cuello se tensa), reduce la carga.",
    youtubeSearch: "prone Y T W exercise scapular strengthening physical therapy",
  },
  // ═══ CORE / LUMBAR ══════════════════════════════════════════════════════════
  {
    id: "ball-wall-squat",
    name: "Ball Wall Squat",
    nameLocal: "Sentadilla con Pelota en Pared",
    region: "Lumbar / Rodilla",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 45,
    musclesWorked: ["Cuádriceps", "Glúteo mayor", "Isquiotibiales"],
    keyPoint: "La pelota guía el movimiento manteniendo la columna neutra apoyada en la pared.",
    steps: [
      "Coloca la pelota terapéutica entre tu espalda baja y la pared.",
      "Pies separados al ancho de hombros, ligeramente adelantados.",
      "Desciende doblando las rodillas hasta 90° mientras la pelota rueda hacia arriba.",
      "Las rodillas no pasan los pulgares de los pies.",
      "Empuja con los talones para subir. No bloquees las rodillas al final.",
    ],
    tip: "Ideal para pacientes con lumbalgia que necesitan fortalecer sin carga axial.",
    youtubeSearch: "exercise ball wall squat physical therapy lumbar tutorial",
  },
  {
    id: "pallof-press-band",
    name: "Pallof Press",
    nameLocal: "Press de Pallof con Liga (Anti-Rotación)",
    region: "Core / Lumbar",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 45,
    musclesWorked: ["Transverso abdominal", "Oblicuos", "Multífidos", "Glúteos"],
    keyPoint: "El objetivo es RESISTIR la rotación — el tronco permanece absolutamente estático.",
    steps: [
      "Ancla la liga a la altura del pecho en una pared.",
      "Párate de lado a la pared, pies al ancho de hombros.",
      "Sujeta la liga con ambas manos al pecho.",
      "Extiende los brazos al frente lentamente. El tronco no rota.",
      "Regresa las manos al pecho con control. Cambia de lado.",
    ],
    tip: "Cuanto más lejos de la pared, mayor resistencia. Progresa gradualmente.",
    youtubeSearch: "pallof press core anti rotation resistance band exercise tutorial",
  },
  {
    id: "superman",
    name: "Superman",
    nameLocal: "Superman (Extensión de Espalda)",
    region: "Lumbar / Glúteo",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Erector espinal", "Glúteo mayor", "Isquiotibiales", "Trapecio"],
    keyPoint: "Eleva brazos y piernas simultáneamente. Los ojos miran siempre al suelo.",
    steps: [
      "Tumbado boca abajo, brazos extendidos al frente, piernas rectas.",
      "Simultáneamente eleva brazos y piernas del suelo.",
      "Mantén 2–3 segundos con el cuerpo extendido como una flecha.",
      "Baja con control. Sin rebote.",
      "Variante: eleva solo brazo y pierna opuestos para mayor dificultad.",
    ],
    tip: "No hiperextiendas el cuello — la mirada al suelo evita la compresión cervical.",
    youtubeSearch: "superman exercise back extension core stability tutorial",
  },
  {
    id: "suitcase-carry",
    name: "Suitcase Carry",
    nameLocal: "Caminata de Maleta con Mancuerna",
    region: "Core / Lumbar",
    difficulty: "intermediate",
    sets: 3, reps: 20, restSeconds: 60,
    musclesWorked: ["Cuadrado lumbar", "Oblicuos", "Glúteo medio", "Trapecio"],
    keyPoint: "El torso permanece perfectamente vertical — no te inclines hacia la mancuerna.",
    steps: [
      "Toma una mancuerna en una mano, brazo extendido al lado del cuerpo.",
      "Activa el core y mantén los hombros nivelados.",
      "Camina en línea recta manteniendo la columna neutra.",
      "El brazo con peso no se balancea — permanece estático todo el recorrido.",
      "20 pasos por lado.",
    ],
    tip: "Empieza con un peso que activa el core pero sin compensar la postura.",
    youtubeSearch: "suitcase carry dumbbell core stability lateral flexion exercise",
  },
  // ═══ CADERA / GLÚTEO ════════════════════════════════════════════════════════
  {
    id: "clamshell",
    name: "Clamshell",
    nameLocal: "Almeja (Clamshell) con Polaina",
    region: "Cadera / Glúteo",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 30,
    musclesWorked: ["Glúteo medio", "Glúteo menor", "Piriforme", "Rotadores externos de cadera"],
    keyPoint: "Las caderas no rotan hacia atrás — el movimiento es solo en la cadera.",
    steps: [
      "Acuéstate de lado, caderas apiladas, rodillas flexionadas a 45°.",
      "Ancla una polaina en el tobillo superior.",
      "Abre la rodilla superior como una concha hasta donde puedas sin rotar la pelvis.",
      "Mantén 2 segundos en la cima. Siente el glúteo medio contraído.",
      "Baja con control. Sin rebote en el fondo.",
    ],
    tip: "Coloca una mano en la cadera para verificar que no rota hacia atrás.",
    youtubeSearch: "clamshell exercise glute medius hip abduction physical therapy",
  },
  {
    id: "standing-hip-extension-band",
    name: "Standing Hip Extension",
    nameLocal: "Extensión de Cadera de Pie con Liga",
    region: "Cadera / Glúteo",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Erector espinal (estabilizador)"],
    keyPoint: "El movimiento es de cadera — no de columna lumbar. No te arquees.",
    steps: [
      "Ancla la liga al tobillo. Párate de frente a la pared con manos de apoyo.",
      "Inclínate ligeramente hacia adelante desde la cadera.",
      "Lleva la pierna con liga hacia atrás en extensión, rodilla ligeramente flexionada.",
      "Mantén 2 segundos. Glúteo contraído al máximo.",
      "Baja con control. No arquees la lumbar.",
    ],
    tip: "Inclinarse hacia adelante desde la cadera aisla mejor el glúteo mayor.",
    youtubeSearch: "standing hip extension resistance band glute exercise tutorial",
  },
  {
    id: "lateral-band-walk",
    name: "Lateral Band Walk",
    nameLocal: "Caminata Lateral con Liga",
    region: "Cadera / Glúteo",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 30,
    musclesWorked: ["Glúteo medio", "Glúteo menor", "TFL", "Cuádriceps"],
    keyPoint: "La liga siempre tensa — los pies nunca se juntan del todo.",
    steps: [
      "Coloca una liga circular alrededor de los tobillos o sobre las rodillas.",
      "Flexiona ligeramente las rodillas, posición de squat parcial.",
      "Da pasos laterales manteniendo la tensión en la liga en todo momento.",
      "Tronco erecto, no te inclines hacia el lado que caminas.",
      "10 pasos a la derecha, 10 a la izquierda. Eso es una serie.",
    ],
    tip: "La colocación en los tobillos es más difícil. Empieza en rodillas.",
    youtubeSearch: "lateral band walk exercise glute medius hip abductor tutorial",
  },
  {
    id: "hip-thrust-dumbbell",
    name: "Hip Thrust",
    nameLocal: "Hip Thrust con Mancuerna",
    region: "Cadera / Glúteo",
    difficulty: "intermediate",
    sets: 4, reps: 12, restSeconds: 60,
    musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Aductores"],
    keyPoint: "En la cima: pelvis neutra, no hiperlordosis — glúteo en máxima contracción.",
    steps: [
      "Apoya la parte alta de la espalda en un banco firme.",
      "Pies planos en el suelo, rodillas a 90° en la posición final.",
      "Coloca la mancuerna sobre las caderas con ambas manos.",
      "Empuja las caderas hacia arriba contrayendo el glúteo.",
      "Cima: tronco paralelo al suelo. Mantén 2 segundos.",
    ],
    tip: "Si el cuello se tensa, fija la mirada ligeramente hacia adelante y arriba.",
    youtubeSearch: "hip thrust dumbbell glute exercise tutorial",
  },
  // ═══ RODILLA ════════════════════════════════════════════════════════════════
  {
    id: "terminal-knee-extension",
    name: "Terminal Knee Extension (TKE)",
    nameLocal: "Extensión Terminal de Rodilla con Liga",
    region: "Rodilla",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 30,
    musclesWorked: ["Vasto medial oblicuo (VMO)", "Cuádriceps"],
    keyPoint: "Solo los últimos 20–30° de extensión — activa específicamente el VMO.",
    steps: [
      "Ancla la liga a la altura de la rodilla en una pared.",
      "Coloca la liga detrás de la rodilla, párate con ligera flexión.",
      "Extiende la rodilla completamente contra la resistencia de la liga.",
      "Mantén 2 segundos en extensión completa — VMO contraído.",
      "Flexiona de nuevo con control. El pie no despega del suelo.",
    ],
    tip: "Fundamental en rehabilitación de LCA y condromalacia rotuliana.",
    youtubeSearch: "terminal knee extension TKE resistance band VMO physical therapy",
  },
  {
    id: "bosu-squat",
    name: "BOSU Squat",
    nameLocal: "Sentadilla en BOSU",
    region: "Rodilla / Tobillo",
    difficulty: "intermediate",
    sets: 3, reps: 12, restSeconds: 45,
    musclesWorked: ["Cuádriceps", "Glúteos", "Isquiotibiales", "Tibial anterior", "Propioceptores"],
    keyPoint: "La inestabilidad del BOSU activa los propioceptores — ese es el objetivo.",
    steps: [
      "Súbete al lado plano del BOSU con pies al ancho de hombros.",
      "Mantén los brazos al frente para equilibrio.",
      "Desciende en sentadilla hasta 90° de rodilla, tronco erecto.",
      "Empuja con los talones para subir. Controla el balance.",
      "Si pierdes el equilibrio, pausa y reencuadra antes de continuar.",
    ],
    tip: "Comienza con el BOSU boca abajo (lado curvo abajo) si el lado plano es muy difícil.",
    youtubeSearch: "BOSU ball squat balance proprioception exercise tutorial",
  },
  {
    id: "seated-knee-extension-polaina",
    name: "Seated Knee Extension Ankle Weight",
    nameLocal: "Extensión de Rodilla Sentado con Polaina",
    region: "Rodilla",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Cuádriceps", "VMO"],
    keyPoint: "Completa la extensión final — el VMO trabaja al máximo en los últimos grados.",
    steps: [
      "Siéntate en una silla firme, coloca la polaina en el tobillo.",
      "Extiende la rodilla lentamente hasta quedar completamente recta.",
      "Mantén 3 segundos en extensión completa, cuádriceps contraído.",
      "Baja lentamente en 4 segundos. Sin dejar caer.",
      "Trabaja primero la pierna más débil.",
    ],
    tip: "Coloca una toalla enrollada bajo la rodilla si hay dolor articular.",
    youtubeSearch: "seated knee extension ankle weight physical therapy quadriceps",
  },
  // ═══ TOBILLO / PIE ══════════════════════════════════════════════════════════
  {
    id: "single-leg-balance-bosu",
    name: "Single Leg Balance BOSU",
    nameLocal: "Equilibrio Unipodal en BOSU",
    region: "Tobillo / Pie",
    difficulty: "intermediate",
    sets: 3, reps: 30, restSeconds: 30,
    musclesWorked: ["Tibial anterior/posterior", "Peroneos", "Gastrocnemio", "Propioceptores"],
    keyPoint: "El objetivo es el control neuromuscular, no la estabilidad perfecta.",
    steps: [
      "Súbete al BOSU (cara plana arriba) en un solo pie.",
      "Flexiona ligeramente la rodilla de apoyo — nunca en extensión bloqueada.",
      "Mantén los brazos a los lados para equilibrio.",
      "Aguanta 30 segundos sin tocar el suelo con el otro pie.",
      "Progresión: cierra los ojos 10 segundos para aumentar el reto propioceptivo.",
    ],
    tip: "Fundamental en rehabilitación post-esguince de tobillo.",
    youtubeSearch: "single leg balance BOSU proprioception ankle rehabilitation exercise",
  },
  {
    id: "dorsiflexion-band",
    name: "Dorsiflexion Strengthening",
    nameLocal: "Fortalecimiento de Dorsiflexión con Liga",
    region: "Tobillo / Pie",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 25,
    musclesWorked: ["Tibial anterior", "Extensor largo de los dedos"],
    keyPoint: "Movimiento lento y controlado — el tibial anterior es débil en la mayoría.",
    steps: [
      "Siéntate con la pierna extendida. Ancla la liga al dorso del pie.",
      "El otro extremo anclado frente a ti o sujétalo con las manos.",
      "Desde flexión plantar, realiza dorsiflexión (acerca los dedos a la espinilla).",
      "Mantén 2 segundos en máxima dorsiflexión.",
      "Vuelve con control a la posición inicial.",
    ],
    tip: "Muy útil en rehabilitación de esguince de tobillo y prevención de recidivas.",
    youtubeSearch: "dorsiflexion strengthening resistance band tibialis anterior exercise",
  },
  // ═══ CERVICAL ═══════════════════════════════════════════════════════════════
  {
    id: "deep-neck-flexor",
    name: "Deep Neck Flexor Training",
    nameLocal: "Flexores Profundos Cervicales",
    region: "Cervical",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 30,
    musclesWorked: ["Longus colli", "Longus capitis", "Recto capitis anterior"],
    keyPoint: "Flexión profunda cervical — deslizamiento hacia atrás, no solo bajar la barbilla.",
    steps: [
      "Tumbado boca arriba sin almohada, cuello en posición neutra.",
      "Asiente la cabeza hacia atrás (retracción cervical) — doble mentón.",
      "Levanta la cabeza 1–2 cm del suelo solo con los flexores profundos.",
      "Mantén 10 segundos. La quijada se mantiene retraída todo el tiempo.",
      "Baja con control. Descansa 5 segundos entre repeticiones.",
    ],
    tip: "Si el ECOM se activa (ves el cuello adelantarse), el nivel es demasiado alto.",
    youtubeSearch: "deep neck flexor exercise cervical spine physical therapy tutorial",
  },
  {
    id: "cervical-side-bend-band",
    name: "Cervical Lateral Flexion Band",
    nameLocal: "Flexión Lateral Cervical con Liga",
    region: "Cervical",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Escalenos", "Esternocleidomastoideo", "Esplenio cervical"],
    keyPoint: "Resistencia mínima — la musculatura cervical es pequeña y se lesiona fácil.",
    steps: [
      "Siéntate erguido. Ancla la liga en el suelo bajo tu pie del mismo lado.",
      "Coloca el otro extremo alrededor de la cabeza (sobre la oreja).",
      "Inclina la cabeza hacia el lado de la resistencia contra la liga.",
      "Regresa lentamente al centro. La liga resiste el retorno.",
      "Cambia de lado. Movimiento pequeño y controlado.",
    ],
    tip: "También se puede hacer con la mano como resistencia manual.",
    youtubeSearch: "cervical lateral flexion strengthening exercise neck physical therapy",
  },
  // ═══ TORÁCICA ═══════════════════════════════════════════════════════════════
  {
    id: "thoracic-rotation-seated",
    name: "Seated Thoracic Rotation",
    nameLocal: "Rotación Torácica Sentado con Pelota",
    region: "Torácica",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 30,
    musclesWorked: ["Rotadores torácicos", "Oblicuos", "Multífidos torácicos"],
    keyPoint: "El movimiento es solo torácico — las caderas se quedan quietas.",
    steps: [
      "Siéntate en una silla con los pies planos, rodillas a 90°.",
      "Sujeta una pelota terapéutica frente al pecho.",
      "Rota el tronco hacia un lado lo máximo posible sin mover las caderas.",
      "Las caderas permanecen mirando al frente durante todo el movimiento.",
      "Mantén 2 segundos. Vuelve al centro y repite al otro lado.",
    ],
    tip: "Fijar las rodillas entre las manos ayuda a bloquear la rotación de cadera.",
    youtubeSearch: "seated thoracic rotation exercise spine mobility tutorial",
  },
  {
    id: "open-book-stretch",
    name: "Open Book Stretch",
    nameLocal: "Estiramiento Libro Abierto (Torácica)",
    region: "Torácica / Hombro",
    difficulty: "beginner",
    sets: 3, reps: 8, restSeconds: 30,
    musclesWorked: ["Pectoral mayor", "Rotadores torácicos", "Romboides", "Dorsal ancho"],
    keyPoint: "El brazo de arriba cae por gravedad hacia el suelo — no lo fuerces.",
    steps: [
      "Acuéstate de lado, rodillas apiladas flexionadas a 90°, brazos extendidos juntos al frente.",
      "Mantén la rodilla inferior pegada al suelo durante todo el ejercicio.",
      "Abre el brazo superior hacia atrás como si abrieras un libro, rotando el tronco.",
      "Deja que el brazo caiga por gravedad. La cabeza sigue al brazo.",
      "Mantén 3–5 respiraciones. Vuelve. Cambia de lado.",
    ],
    tip: "Una almohada entre las rodillas ayuda a controlar la rotación de cadera.",
    youtubeSearch: "open book stretch thoracic rotation mobility exercise tutorial",
  },
  // ═══ KETTLEBELL / PELOTA MEDICINAL ══════════════════════════════════════════
  {
    id: "goblet-squat-ball",
    name: "Goblet Squat with Ball",
    nameLocal: "Sentadilla Goblet con Pelota Medicinal",
    region: "Cadera / Rodilla / Core",
    difficulty: "intermediate",
    sets: 4, reps: 10, restSeconds: 60,
    musclesWorked: ["Cuádriceps", "Glúteos", "Isquiotibiales", "Core profundo"],
    keyPoint: "La pelota frente al pecho actúa como contrapeso y mantiene el tronco erecto.",
    steps: [
      "Sostén la pelota medicinal frente al pecho con ambas manos.",
      "Pies al ancho de hombros o más abiertos, puntas ligeramente afuera.",
      "Desciende hasta que los codos pasen entre las rodillas (profundidad máxima).",
      "Rodillas alineadas con el 2º dedo del pie. No colapsen hacia adentro.",
      "Sube empujando el suelo. La pelota al pecho todo el tiempo.",
    ],
    tip: "La pelota de 3–5 kg como contrapeso mejora naturalmente la profundidad.",
    youtubeSearch: "goblet squat medicine ball exercise tutorial proper form",
  },
  {
    id: "kb-turkish-getup",
    name: "Turkish Get-Up",
    nameLocal: "Turkish Get-Up con Kettlebell",
    region: "Core / Global",
    difficulty: "advanced",
    sets: 2, reps: 3, restSeconds: 90,
    musclesWorked: ["Core profundo", "Glúteos", "Hombro", "Cuádriceps", "Movilidad global"],
    keyPoint: "El movimiento más completo del cuerpo. La mirada siempre al kettlebell.",
    steps: [
      "Tumbado, kettlebell en mano derecha extendida hacia el techo. Pierna derecha flexionada.",
      "Apóyate en el codo izquierdo mirando siempre al KB.",
      "Pasa a la mano izquierda extendida. Eleva las caderas (puente).",
      "Pasa la pierna izquierda bajo el cuerpo hasta posición de caballero (lunge).",
      "Levántate completamente. Desanda los pasos en orden inverso para bajar.",
    ],
    tip: "Aprende primero sin kettlebell o con un zapato en la mano para dominar el patrón.",
    contraindications: "No realizar con dolor de hombro activo o sin dominio previo del movimiento.",
    youtubeSearch: "turkish get up kettlebell exercise tutorial step by step",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HOMBRO — más ligas, mancuernas, polainas, bodyweight
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "band-diagonal-reach",
    name: "Band Diagonal Reach",
    nameLocal: "Diagonal con Liga (PNF D2)",
    region: "Hombro",
    difficulty: "intermediate",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Deltoides anterior", "Trapecio", "Supraespinoso", "Pectoral mayor"],
    keyPoint: "Patrón diagonal PNF D2: de abajo-lateral a arriba-medial.",
    steps: [
      "Ancla la liga al pie del mismo lado bajo el pie opuesto.",
      "Empieza con el brazo cruzado frente al cuerpo abajo.",
      "Lleva el brazo en diagonal hacia arriba y afuera como si sacases una espada.",
      "El pulgar apunta hacia arriba en la posición final.",
      "Regresa con control siguiendo la misma diagonal.",
    ],
    tip: "Este patrón diagonal es el más funcional para el manguito rotador.",
    youtubeSearch: "PNF D2 diagonal pattern shoulder band exercise physical therapy",
  },
  {
    id: "dumbbell-rear-delt-fly",
    name: "Rear Delt Fly",
    nameLocal: "Vuelo Posterior con Mancuerna",
    region: "Hombro / Escápula",
    difficulty: "intermediate",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Deltoides posterior", "Romboides", "Trapecio medio", "Infraespinoso"],
    keyPoint: "Codos ligeramente flexionados durante todo el movimiento.",
    steps: [
      "Sentado, inclínate hacia adelante con el tronco casi paralelo al suelo.",
      "Mancuernas colgando bajo el pecho, palmas hacia adentro.",
      "Eleva los brazos hacia los lados manteniendo codos ligeramente flexionados.",
      "Hasta que los brazos estén paralelos al suelo — no más.",
      "Baja con control en 3 segundos.",
    ],
    tip: "Pesos muy ligeros. El deltoides posterior es un músculo pequeño.",
    youtubeSearch: "rear delt fly dumbbell bent over exercise tutorial",
  },
  {
    id: "wall-angel",
    name: "Wall Angel",
    nameLocal: "Ángel de Pared (Postura)",
    region: "Hombro / Torácica",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 30,
    musclesWorked: ["Trapecio inferior", "Romboides", "Serrato anterior", "Rotadores externos"],
    keyPoint: "La espalda baja, media y alta deben pegarse a la pared en todo momento.",
    steps: [
      "De pie contra la pared, pies a 10–15 cm de la base.",
      "Presiona la espalda entera (lumbar, torácica, cuello) contra la pared.",
      "Coloca los brazos en W: codos a 90°, dorso de manos contra la pared.",
      "Desliza los brazos hacia arriba formando una Y completa contra la pared.",
      "Si la espalda se separa de la pared, detente ahí.",
    ],
    tip: "Si la espalda baja se despega inmediatamente, dobla ligeramente las rodillas.",
    youtubeSearch: "wall angel exercise posture shoulder scapula tutorial",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // LUMBAR / CORE — más variedad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "side-plank",
    name: "Side Plank",
    nameLocal: "Plancha Lateral",
    region: "Core / Lumbar",
    difficulty: "intermediate",
    sets: 3, reps: 30, restSeconds: 30,
    musclesWorked: ["Oblicuo externo/interno", "Cuadrado lumbar", "Glúteo medio", "Transverso"],
    keyPoint: "El cuerpo forma una línea recta desde los pies hasta la cabeza.",
    steps: [
      "Acuéstate de lado, codo directamente bajo el hombro.",
      "Eleva la cadera del suelo formando una línea recta.",
      "Activa el glúteo de arriba para evitar que la cadera caiga hacia adelante.",
      "Mantén 30 segundos. La respiración debe fluir sin contener el aire.",
      "Cambia de lado. Progresión: elevar el pie o el brazo superiores.",
    ],
    tip: "Si la cadera baja, coloca el pie de arriba adelante del de abajo para más estabilidad.",
    youtubeSearch: "side plank exercise core oblique tutorial proper form",
  },
  {
    id: "ball-rollout",
    name: "Ball Rollout",
    nameLocal: "Extensión con Pelota (Rollout)",
    region: "Core / Lumbar",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 45,
    musclesWorked: ["Transverso abdominal", "Recto abdominal", "Dorsal ancho", "Core profundo"],
    keyPoint: "La columna permanece neutra durante toda la extensión — nunca arquear.",
    steps: [
      "Arrodillado detrás de la pelota terapéutica, manos sobre ella.",
      "Rueda la pelota hacia adelante extendiendo los brazos.",
      "El cuerpo forma una línea desde rodillas hasta hombros.",
      "Detente cuando sientas que la columna va a ceder (no pases ese punto).",
      "Regresa a la posición inicial contrayendo el abdomen.",
    ],
    tip: "Empieza con poco rango y auméntalo progresivamente durante semanas.",
    youtubeSearch: "exercise ball rollout ab core exercise tutorial",
  },
  {
    id: "band-deadbug",
    name: "Band Dead Bug",
    nameLocal: "Dead Bug con Liga (Avanzado)",
    region: "Core / Lumbar",
    difficulty: "advanced",
    sets: 3, reps: 8, restSeconds: 45,
    musclesWorked: ["Transverso abdominal", "Multífidos", "Flexores de cadera", "Deltoides"],
    keyPoint: "La espalda baja NO despega del suelo en ningún momento.",
    steps: [
      "Tumbado boca arriba. Ancla la liga a ambos pies y sostén el otro extremo con ambas manos.",
      "Brazos al techo, rodillas a 90° suspendidas.",
      "Simultáneamente baja el brazo derecho al suelo y extiende la pierna izquierda.",
      "La liga crea tensión que intensifica la demanda al core.",
      "Regresa y repite con el lado contrario.",
    ],
    tip: "Si la espalda baja se eleva del suelo, reduce el rango o quita la liga.",
    youtubeSearch: "dead bug resistance band advanced core exercise",
  },
  {
    id: "reverse-crunch",
    name: "Reverse Crunch",
    nameLocal: "Crunch Inverso",
    region: "Core / Lumbar",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Recto abdominal (inferior)", "Transverso abdominal", "Hip flexors"],
    keyPoint: "El movimiento es la pelvis hacia el techo — no el cuello hacia adelante.",
    steps: [
      "Tumbado boca arriba, manos bajo los glúteos o al lado del cuerpo.",
      "Rodillas a 90° en el aire, espinillas paralelas al suelo.",
      "Enrolla la pelvis hacia el pecho llevando las rodillas al techo.",
      "Mantén 2 segundos. La espalda baja se despega ligeramente del suelo.",
      "Baja con control sin que los pies toquen el suelo.",
    ],
    tip: "Nunca uses inercia — el movimiento debe ser lento y controlado.",
    youtubeSearch: "reverse crunch exercise lower abs tutorial physical therapy",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // CADERA / GLÚTEO — más variedad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "single-leg-deadlift",
    name: "Single Leg Deadlift",
    nameLocal: "Peso Muerto Unilateral",
    region: "Cadera / Glúteo",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 45,
    musclesWorked: ["Glúteo mayor", "Isquiotibiales", "Erector espinal", "Core profundo"],
    keyPoint: "La columna permanece neutra — la cadera es el eje del movimiento.",
    steps: [
      "De pie, mancuerna en la mano opuesta a la pierna de apoyo.",
      "Flexiona ligeramente la rodilla de apoyo. Inicia la bisagra de cadera.",
      "Lleva el tronco hacia adelante y la pierna libre hacia atrás simultáneamente.",
      "El cuerpo forma una T cuando estás en la posición más baja.",
      "Regresa contrayendo el glúteo de la pierna de apoyo.",
    ],
    tip: "Mantén los hombros y caderas paralelos al suelo — sin rotación.",
    youtubeSearch: "single leg deadlift dumbbell exercise tutorial form",
  },
  {
    id: "fire-hydrant",
    name: "Fire Hydrant",
    nameLocal: "Hidratante (Fire Hydrant) con Polaina",
    region: "Cadera / Glúteo",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 30,
    musclesWorked: ["Glúteo medio", "Piriforme", "Rotadores externos de cadera"],
    keyPoint: "La pelvis no se mueve — solo se abre la cadera como una puerta.",
    steps: [
      "Posición de cuatro apoyos: muñecas bajo hombros, rodillas bajo caderas.",
      "Ancla una polaina en el tobillo a trabajar.",
      "Eleva la rodilla hacia el lado manteniendo la flexión de 90°.",
      "Sube hasta que la rodilla esté a la altura de la cadera.",
      "Baja con control. La pelvis no rota en ningún momento.",
    ],
    tip: "Imagina que tienes un vaso de agua en la espalda — no lo derrames.",
    youtubeSearch: "fire hydrant exercise hip abduction polaina glute tutorial",
  },
  {
    id: "sumo-squat-dumbbell",
    name: "Sumo Squat",
    nameLocal: "Sentadilla Sumo con Mancuerna",
    region: "Cadera / Glúteo / Aductores",
    difficulty: "intermediate",
    sets: 3, reps: 12, restSeconds: 45,
    musclesWorked: ["Glúteos", "Aductores", "Cuádriceps", "Isquiotibiales"],
    keyPoint: "Pies amplios y puntas afuera activan más los aductores y glúteo mayor.",
    steps: [
      "Pies más anchos que los hombros, puntas apuntando a las 10 y 2 del reloj.",
      "Sujeta una mancuerna vertical con ambas manos frente al cuerpo.",
      "Desciende con la espalda recta y las rodillas alineadas con los pies.",
      "Lleva la mancuerna hacia el suelo entre las piernas.",
      "Empuja con los talones para subir apretando los glúteos en la cima.",
    ],
    tip: "Activa los glúteos al final de la extensión para maximizar el trabajo.",
    youtubeSearch: "sumo squat dumbbell exercise tutorial glute inner thigh",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // RODILLA — más variedad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "step-down-eccentric",
    name: "Eccentric Step Down",
    nameLocal: "Descenso Excéntrico de Escalón",
    region: "Rodilla",
    difficulty: "intermediate",
    sets: 3, reps: 10, restSeconds: 45,
    musclesWorked: ["Cuádriceps", "VMO", "Glúteos", "Estabilizadores de rodilla"],
    keyPoint: "El descenso lento (4–5 segundos) es el ejercicio — el ascenso es solo de vuelta.",
    steps: [
      "Párate en un escalón o banco de 15–20 cm en un pie.",
      "Flexiona lentamente la rodilla de apoyo bajando el talón opuesto al suelo.",
      "El descenso debe tomar 4–5 segundos. La rodilla apunta al 2º dedo.",
      "Cuando el talón toca el suelo, empuja con ambas piernas para subir.",
      "Toda la carga excéntrica va en la pierna de apoyo.",
    ],
    tip: "Fundamental en tendinopatía rotuliana y condromalacia.",
    youtubeSearch: "eccentric step down exercise knee tendinopathy physical therapy",
  },
  {
    id: "monster-walk",
    name: "Monster Walk",
    nameLocal: "Caminata Monstruo con Liga",
    region: "Rodilla / Cadera",
    difficulty: "intermediate",
    sets: 3, reps: 20, restSeconds: 30,
    musclesWorked: ["Glúteo medio", "Cuádriceps", "Abductores", "Tibial anterior"],
    keyPoint: "La postura de squat se mantiene durante toda la caminata.",
    steps: [
      "Liga alrededor de los tobillos. Posición de squat parcial.",
      "Da pasos diagonales hacia adelante (derecha-izquierda alternando).",
      "Mantén la tensión en la liga en cada paso.",
      "El tronco permanece erecto — no te inclines.",
      "10 pasos hacia adelante, 10 hacia atrás. Eso es una serie.",
    ],
    tip: "Añade liga también encima de las rodillas para más dificultad.",
    youtubeSearch: "monster walk resistance band exercise hip knee tutorial",
  },
  {
    id: "ball-hamstring-curl",
    name: "Ball Hamstring Curl",
    nameLocal: "Curl de Isquiotibiales con Pelota",
    region: "Rodilla / Isquiotibiales",
    difficulty: "intermediate",
    sets: 3, reps: 12, restSeconds: 45,
    musclesWorked: ["Isquiotibiales", "Glúteo mayor", "Gemelos", "Core"],
    keyPoint: "Mantén las caderas elevadas durante todo el ejercicio.",
    steps: [
      "Tumbado boca arriba, talones sobre la pelota terapéutica.",
      "Eleva las caderas formando un puente con los brazos en el suelo.",
      "Lleva los talones hacia los glúteos rodando la pelota.",
      "Mantén las caderas arriba durante todo el movimiento.",
      "Extiende las piernas de nuevo con control. Sin bajar las caderas.",
    ],
    tip: "Si es muy difícil, dobla los brazos bajo los glúteos para más apoyo.",
    youtubeSearch: "exercise ball hamstring curl bridge tutorial physical therapy",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // TOBILLO / PIE — más variedad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "heel-toe-walk",
    name: "Heel-Toe Walk",
    nameLocal: "Caminata Talón-Punta",
    region: "Tobillo / Pie",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 20,
    musclesWorked: ["Tibial anterior", "Gastrocnemio", "Sóleo", "Peroneo"],
    keyPoint: "Alterna caminar de puntillas y de talones — trabaja agonistas y antagonistas.",
    steps: [
      "Camina 10 pasos de puntillas (activando gastrocnemios y sóleo).",
      "Regresa 10 pasos apoyando solo los talones (activando tibial anterior).",
      "En las puntillas: mantén el equilibrio sin agarrarte si es posible.",
      "En los talones: eleva los dedos del suelo al máximo.",
      "Repite 3 veces en cada dirección.",
    ],
    tip: "Excelente como calentamiento y para el fortalecimiento del pie.",
    youtubeSearch: "heel toe walking exercise ankle strengthening tutorial",
  },
  {
    id: "star-excursion-balance",
    name: "Star Excursion Balance Test",
    nameLocal: "Test de Excursión en Estrella (Equilibrio)",
    region: "Tobillo / Rodilla / Cadera",
    difficulty: "intermediate",
    sets: 3, reps: 6, restSeconds: 45,
    musclesWorked: ["Propioceptores", "Glúteo medio", "Cuádriceps", "Tibial posterior"],
    keyPoint: "Toca lo más lejos posible en cada dirección. El alcance es la medida.",
    steps: [
      "Párate en un pie. Imagina una estrella de 8 puntas bajo tus pies.",
      "Con el pie libre, alcanza en la dirección anterior (frente) lo más lejos posible.",
      "Toca suavemente el suelo y regresa a la posición inicial.",
      "Repite alcanzando en las direcciones: posterior medial, posterior lateral.",
      "6 repeticiones por dirección antes de cambiar de pie.",
    ],
    tip: "Mide la distancia de alcance — asimetría >4 cm indica riesgo de lesión.",
    youtubeSearch: "star excursion balance test Y balance ankle rehabilitation",
  },
  {
    id: "intrinsic-foot-towel-curl",
    name: "Towel Curl",
    nameLocal: "Arrugado de Toalla con Pies",
    region: "Tobillo / Pie",
    difficulty: "beginner",
    sets: 3, reps: 20, restSeconds: 20,
    musclesWorked: ["Flexor corto de los dedos", "Lumbricales", "Interóseos plantares"],
    keyPoint: "Activa solo los dedos del pie — no uses la pierna entera.",
    steps: [
      "Siéntate en una silla con una toalla extendida bajo el pie descalzo.",
      "Con los dedos del pie, arruga la toalla hacia ti.",
      "Usa solo los músculos intrínsecos del pie — no todo el pie.",
      "Extiende la toalla de nuevo con los dedos.",
      "Alterna pies o trabaja ambos.",
    ],
    tip: "Muy útil en fascitis plantar, dedo en garra y prevención de esguinces.",
    youtubeSearch: "towel curl toe exercise intrinsic foot strengthening plantar fasciitis",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // CERVICAL — más variedad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "cervical-extension-band",
    name: "Cervical Extension Strengthening",
    nameLocal: "Extensión Cervical con Liga",
    region: "Cervical",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Esplenio cervical", "Semiespinoso cervical", "Multífidos cervicales"],
    keyPoint: "Movimiento pequeño y controlado desde el core cervical.",
    steps: [
      "Siéntate erguido. Ancla la liga en la frente (usa una almohada de protección).",
      "El otro extremo de la liga sujeto con las manos al pecho.",
      "Realiza extensión cervical (lleva la cabeza hacia atrás) contra la resistencia.",
      "Mantén 2 segundos. Regresa lentamente al centro.",
      "Sin hiperextensión — el movimiento se detiene en posición neutra.",
    ],
    tip: "Poca resistencia — los extensores cervicales son estabilizadores, no potentes.",
    youtubeSearch: "cervical extension strengthening exercise neck band tutorial",
  },
  {
    id: "scm-stretch",
    name: "SCM Stretch",
    nameLocal: "Estiramiento del Esternocleidomastoideo",
    region: "Cervical",
    difficulty: "beginner",
    sets: 3, reps: 30, restSeconds: 20,
    musclesWorked: ["Esternocleidomastoideo (ECOM)", "Escalenos"],
    keyPoint: "Tres componentes: rotación + inclinación lateral + extensión cervical suave.",
    steps: [
      "Siéntate o párate erguido. Estabiliza el hombro ipsilateral hacia abajo.",
      "Gira la cabeza hacia el lado a estirar.",
      "Inclina la cabeza hacia el lado contrario.",
      "Añade una extensión cervical suave (lleva la nariz ligeramente hacia el techo).",
      "Mantén 30 segundos. Respira. Cambia de lado.",
    ],
    tip: "Muy útil en tortícolis y cefalea cervicogénica.",
    youtubeSearch: "sternocleidomastoid stretch SCM neck cervical exercise tutorial",
  },
  {
    id: "cervical-rotation-active",
    name: "Cervical Rotation Active",
    nameLocal: "Rotación Cervical Activa Asistida",
    region: "Cervical",
    difficulty: "beginner",
    sets: 3, reps: 10, restSeconds: 20,
    musclesWorked: ["Esternocleidomastoideo", "Esplenio cervical", "Suboccipitales"],
    keyPoint: "El movimiento activo es más seguro que el pasivo — la cabeza controla.",
    steps: [
      "Siéntado erguido, cuello en posición neutra.",
      "Gira suavemente la cabeza hacia un lado hasta el máximo confort.",
      "Mantén 3 segundos. Siente el estiramiento contralateral.",
      "Vuelve al centro despacio.",
      "Alterna: 10 repeticiones por lado.",
    ],
    tip: "Si hay mareo al rotar, consultar antes de continuar (descartar vertebrobasilar).",
    contraindications: "No realizar si hay mareo, visión doble o náuseas al rotar la cabeza.",
    youtubeSearch: "cervical rotation exercise neck mobility physical therapy tutorial",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // TORÁCICA / ESPALDA ALTA — más variedad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "band-row-seated",
    name: "Seated Band Row",
    nameLocal: "Remo Sentado con Liga",
    region: "Torácica / Hombro",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Romboides", "Trapecio medio", "Bíceps", "Dorsal ancho"],
    keyPoint: "El movimiento es de codo hacia atrás — las escápulas se juntan.",
    steps: [
      "Siéntate con las piernas extendidas. Liga anclada en los pies.",
      "Sujeta los extremos con ambas manos, brazos extendidos al frente.",
      "Tira de la liga llevando los codos hacia atrás, juntando las escápulas.",
      "Mantén 2 segundos con escápulas juntas.",
      "Regresa con control. No dejes que la liga te jale bruscamente.",
    ],
    tip: "Si la espalda baja se redondea al tirar, reduce la resistencia.",
    youtubeSearch: "seated resistance band row exercise back rhomboids tutorial",
  },
  {
    id: "chest-opener-ball",
    name: "Chest Opener on Ball",
    nameLocal: "Apertura de Pecho con Pelota",
    region: "Torácica / Hombro",
    difficulty: "beginner",
    sets: 3, reps: 60, restSeconds: 30,
    musclesWorked: ["Pectoral mayor/menor", "Bíceps", "Flexores de hombro", "Fascia anterior"],
    keyPoint: "La gravedad hace el trabajo — relajarte completamente sobre la pelota.",
    steps: [
      "Siéntate en la pelota terapéutica y rueda hasta que la pelota apoye en la parte alta de la espalda.",
      "Brazos abiertos hacia los lados o extendidos por encima de la cabeza.",
      "La cabeza se apoya o cuelga hacia atrás — cuello relajado.",
      "Mantén la posición 30–60 segundos respirando profundo.",
      "Regresa lentamente sentándote.",
    ],
    tip: "Si el cuello queda incómodo, coloca una almohada bajo la cabeza.",
    youtubeSearch: "chest opener exercise ball thoracic extension posture tutorial",
  },
  {
    id: "band-face-pull",
    name: "Band Face Pull",
    nameLocal: "Face Pull con Liga",
    region: "Hombro / Torácica",
    difficulty: "intermediate",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Deltoides posterior", "Trapecio medio", "Rotadores externos", "Romboides"],
    keyPoint: "Los codos suben por encima de los hombros — como astas de toro.",
    steps: [
      "Ancla la liga a la altura de los ojos o un poco más alto.",
      "Tira de la liga hacia tu cara separando las manos con codos hacia arriba.",
      "Las manos terminan a los lados de la cara, codos por encima del nivel de los hombros.",
      "Mantén 2 segundos con los músculos posteriores contraídos.",
      "Regresa con control. Sin dejar que los hombros se adelanten.",
    ],
    tip: "Uno de los mejores ejercicios para la salud del manguito rotador y la postura.",
    youtubeSearch: "face pull resistance band exercise shoulder health tutorial",
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // CODO / ANTEBRAZO — mancuerna, liga, bodyweight
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "wrist-flexion-extension",
    name: "Wrist Flexion & Extension",
    nameLocal: "Flexo-Extensión de Muñeca con Mancuerna",
    region: "Codo / Muñeca",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 25,
    musclesWorked: ["Flexores de muñeca", "Extensores de muñeca", "Pronadores/supinadores"],
    keyPoint: "Movimiento aislado de muñeca — el codo permanece quieto.",
    steps: [
      "Siéntate, antebrazo apoyado en el muslo, mano colgando más allá de la rodilla.",
      "Mancuerna ligera (0.5–1 kg) en la mano.",
      "Realiza flexión de muñeca (sube la mano). Mantén 2 segundos.",
      "Baja hasta la extensión máxima. Mantén 2 segundos.",
      "Cada ciclo completo (sube y baja) = 1 repetición.",
    ],
    tip: "Clave en epicondilitis lateral y medial para el fortalecimiento excéntrico.",
    contraindications: "En fase aguda de epicondilitis, iniciar solo en fase sub-aguda.",
    youtubeSearch: "wrist flexion extension exercise dumbbell physical therapy tutorial",
  },
  {
    id: "eccentric-wrist-extension",
    name: "Eccentric Wrist Extension",
    nameLocal: "Extensión Excéntrica de Muñeca (Codo de Tenista)",
    region: "Codo / Muñeca",
    difficulty: "intermediate",
    sets: 3, reps: 15, restSeconds: 45,
    musclesWorked: ["Extensor carpi radialis brevis (ECRB)", "Extensor común de los dedos"],
    keyPoint: "Solo la fase excéntrica (bajada lenta) es terapéutica — sube con la otra mano.",
    steps: [
      "Siéntate con el antebrazo apoyado, mano en supinación colgando.",
      "Mancuerna ligera (0.5 kg). Usa la mano sana para subir la muñeca a extensión.",
      "Con solo la mano a tratar, baja lentamente en 5 segundos hasta flexión completa.",
      "Usa la mano sana para volver a subir. Repite.",
      "Esto es el ejercicio de Nirschl para el codo de tenista.",
    ],
    tip: "Puede haber leve molestia — normal. Dolor intenso (>4/10) es demasiado.",
    youtubeSearch: "eccentric wrist extension exercise lateral epicondylitis tennis elbow",
  },
  {
    id: "pronation-supination-dumbbell",
    name: "Pronation-Supination",
    nameLocal: "Pronosupinación con Mancuerna",
    region: "Codo / Antebrazo",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 25,
    musclesWorked: ["Pronador redondo", "Pronador cuadrado", "Supinador", "Bíceps"],
    keyPoint: "Solo el antebrazo rota — el codo permanece quieto al costado del cuerpo.",
    steps: [
      "Siéntate con el antebrazo apoyado en el muslo o en una mesa.",
      "Sujeta la mancuerna en posición neutra (pulgar arriba).",
      "Gira el antebrazo hacia abajo (pronación) lentamente.",
      "Regresa al centro y continúa hacia arriba (supinación).",
      "El rango debe ser sin dolor.",
    ],
    tip: "Empieza con el peso más ligero — el antebrazo se fatiga rápido.",
    youtubeSearch: "pronation supination dumbbell forearm exercise physical therapy",
  },
  {
    id: "tricep-extension-band",
    name: "Tricep Extension Band",
    nameLocal: "Extensión de Tríceps con Liga",
    region: "Codo / Hombro",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Tríceps braquial (todas las cabezas)", "Anconeo"],
    keyPoint: "Solo el codo se extiende — el húmero permanece quieto.",
    steps: [
      "Ancla la liga sobre tu cabeza (en una puerta o anclaje alto).",
      "Sujeta el extremo con ambas manos o una mano.",
      "Codo flexionado junto a la cabeza. Extiende el codo hacia abajo.",
      "Mantén 2 segundos en extensión completa.",
      "Regresa lentamente al inicio.",
    ],
    tip: "La cabeza del tríceps larga también trabaja el hombro — ideal en rehabilitación.",
    youtubeSearch: "tricep extension overhead resistance band exercise tutorial",
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    nameLocal: "Curl Martillo con Mancuerna",
    region: "Codo / Bíceps",
    difficulty: "beginner",
    sets: 3, reps: 12, restSeconds: 30,
    musclesWorked: ["Braquirradial", "Bíceps braquial", "Braquial"],
    keyPoint: "El pulgar apunta hacia arriba durante todo el movimiento (posición neutra).",
    steps: [
      "De pie o sentado, mancuernas a los lados del cuerpo, pulgares hacia arriba.",
      "Flexiona un codo llevando la mancuerna hacia el hombro sin rotar el antebrazo.",
      "El codo no se adelanta — permanece junto al cuerpo.",
      "Mantén 1 segundo en la cima.",
      "Baja en 3 segundos con control. Alterna brazos.",
    ],
    tip: "El curl martillo trabaja más el braquirradial que el curl supinado clásico.",
    youtubeSearch: "hammer curl dumbbell bicep forearm exercise tutorial",
  },
  {
    id: "band-elbow-flexion-curl",
    name: "Band Bicep Curl",
    nameLocal: "Curl de Bíceps con Liga",
    region: "Codo / Bíceps",
    difficulty: "beginner",
    sets: 3, reps: 15, restSeconds: 30,
    musclesWorked: ["Bíceps braquial", "Braquial", "Supinador"],
    keyPoint: "El codo se mantiene junto al cuerpo — no se adelanta al subir.",
    steps: [
      "Párate sobre la liga con los pies, sujeta los extremos con ambas manos.",
      "Palmas hacia arriba (supinación).",
      "Flexiona ambos codos llevando las manos hacia los hombros.",
      "Mantén 2 segundos en la cima.",
      "Baja lentamente en 3 segundos resistiendo la liga.",
    ],
    tip: "La resistencia variable de la liga es diferente al peso fijo — el pico es al final.",
    youtubeSearch: "resistance band bicep curl exercise tutorial proper form",
  },
];

// Merge base exercises with the full 300-exercise registry (de-duplicated by id)
const _registryMapped: ExerciseData[] = EXERCISE_REGISTRY
  .filter(ex => !BASE_EXERCISES.find(b => b.id === ex.id))
  .map(ex => ({ ...ex, AnimComponent: ENGINE_MAP[ex.id] }));
const ALL_EXERCISES: ExerciseData[] = [...BASE_EXERCISES, ..._registryMapped];

const REGIONS = ["Todos", "Hombro", "Cervical", "Torácica", "Lumbar", "Cadera", "Rodilla", "Tobillo", "Codo", "Muñeca/Mano", "Core", "Glúteo", "Espalda media"];
const DIFFICULTIES = ["Todos", "beginner", "intermediate", "advanced"];
const DIFFICULTY_LABEL: Record<string, string> = { beginner: "Básico", intermediate: "Intermedio", advanced: "Avanzado" };

const DIFFICULTY_BG: Record<string, string> = {
  beginner:     "bg-clinical-500/10 text-clinical-700 border-clinical-500/20",
  intermediate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  advanced:     "bg-orange-500/10 text-orange-700 border-orange-500/20",
  expert:       "bg-red-500/10 text-red-700 border-red-500/20",
};

// ─── Colores por región para el thumbnail ──────────────────────────────────
const REGION_GRADIENT: Record<string, string> = {
  "Hombro":         "from-sky-500 to-blue-600",
  "Lumbar / Core":  "from-teal-500 to-emerald-600",
  "Lumbar / Lumbar":"from-teal-500 to-emerald-600",
  "Lumbar / Torácica":"from-teal-500 to-emerald-600",
  "Lumbar / Sacroilíaca":"from-teal-500 to-emerald-600",
  "Cadera":         "from-violet-500 to-purple-600",
  "Cadera / Glúteo":"from-violet-500 to-purple-600",
  "Core":           "from-teal-500 to-emerald-600",
  "Cervical":       "from-pink-500 to-rose-600",
  "Tobillo":        "from-lime-500 to-green-600",
  "Torácica":       "from-amber-500 to-orange-600",
  "Rodilla / Cuádriceps": "from-orange-500 to-red-600",
  "Cuádriceps / Rodilla": "from-orange-500 to-red-600",
  "Glúteo / Lumbar":      "from-violet-500 to-purple-600",
  "Glúteo / Core":        "from-violet-500 to-purple-600",
  "Isquiotibiales / Lumbar": "from-indigo-500 to-blue-600",
  "Pierna / Rodilla":     "from-orange-500 to-red-600",
  "Codo / Bíceps":        "from-sky-500 to-blue-600",
  "Espalda media":        "from-indigo-500 to-blue-600",
  "Nervio Ciático":       "from-rose-500 to-pink-600",
  "Lumbar / Pelvis":      "from-teal-500 to-emerald-600",
  "Lumbar":               "from-teal-500 to-emerald-600",
};

const REGION_EMOJI: Record<string, string> = {
  "Hombro": "🦾", "Lumbar / Core": "🎯", "Core": "🎯", "Cadera": "🦵",
  "Cadera / Glúteo": "🦵", "Cervical": "🧠", "Tobillo": "🦶", "Torácica": "🫁",
  "Rodilla / Cuádriceps": "🦵", "Cuádriceps / Rodilla": "🦵", "Glúteo / Lumbar": "🍑",
  "Glúteo / Core": "🍑", "Isquiotibiales / Lumbar": "🦵", "Pierna / Rodilla": "🦵",
  "Codo / Bíceps": "💪", "Espalda media": "🔙", "Nervio Ciático": "⚡",
  "Lumbar / Pelvis": "🎯", "Lumbar": "🎯", "Lumbar / Torácica": "🫁",
  "Lumbar / Sacroilíaca": "🎯", "Lumbar / Lumbar": "🎯",
};

// ─── Tarjeta de ejercicio ─────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  onPlay,
  onAdd,
  added,
}: {
  exercise: ExerciseData;
  onPlay: () => void;
  onAdd: () => void;
  added: boolean;
}) {
  const gradient = REGION_GRADIENT[exercise.region] ?? "from-brand-500 to-brand-700";
  const emoji = REGION_EMOJI[exercise.region] ?? "🏃";
  const hasVideo = !!(exercise.youtubeId || exercise.youtubeSearch);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border border-surface-200 bg-white">
      {/* Thumbnail con gradiente + ícono de región */}
      <button
        onClick={onPlay}
        className="relative block w-full overflow-hidden"
        style={{ aspectRatio: "16/10" }}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

        {/* Emoji región */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-25 select-none">{emoji}</span>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
            <Play className="h-6 w-6 text-white fill-white translate-x-0.5" />
          </div>
        </div>

        {/* Badge: Video disponible */}
        {hasVideo && (
          <div className="absolute top-2 start-2 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="text-[10px] text-white font-medium">▶ Video</span>
          </div>
        )}

        {/* Badge dificultad */}
        <div className="absolute top-2 end-2 z-10">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", DIFFICULTY_BG[exercise.difficulty])}>
            {DIFFICULTY_LABEL[exercise.difficulty] ?? exercise.difficulty}
          </span>
        </div>

        {/* Badge duración/series */}
        {(exercise.durationSeconds || (exercise.sets && exercise.reps)) && (
          <div className="absolute bottom-2 start-2 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5">
            {exercise.durationSeconds ? (
              <>
                <Clock className="h-2.5 w-2.5 text-white" />
                <span className="text-[10px] text-white">{exercise.durationSeconds}s</span>
              </>
            ) : (
              <>
                <Repeat2 className="h-2.5 w-2.5 text-white" />
                <span className="text-[10px] text-white">{exercise.sets}×{exercise.reps}</span>
              </>
            )}
          </div>
        )}
      </button>

      <CardContent className="p-3.5">
        <button onClick={onPlay} className="text-start w-full mb-2">
          <h3 className="text-sm font-semibold text-surface-900 leading-tight hover:text-brand-600 transition-colors">
            {exercise.nameLocal || exercise.name}
          </h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{exercise.region}</p>
        </button>

        {exercise.keyPoint && (
          <p className="text-[10px] text-surface-500 leading-snug mb-3 line-clamp-2">
            {exercise.keyPoint}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onPlay}
            className="flex-1 h-8 text-xs font-medium border border-surface-200 rounded-lg hover:bg-surface-50 text-surface-600 hover:text-surface-900 transition-colors"
          >
            Ver técnica
          </button>
          <button
            onClick={onAdd}
            className={cn(
              "flex-1 h-8 text-xs font-semibold rounded-lg transition-all",
              added
                ? "bg-clinical-500/15 text-clinical-700 border border-clinical-500/30"
                : "bg-brand-600 text-white hover:bg-brand-500"
            )}
          >
            {added ? (
              <span className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Agregado
              </span>
            ) : "+ Rutina"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Panel de Anatomía Aplicada ───────────────────────────────────────────────
function AnatomyPanel({ region }: { region: string }) {
  const [activeLayer, setActiveLayer] = useState<string>("anatomy");
  const key = REGION_TO_ANATOMY_KEY[region];
  const content = REGION_CONTENT[key];
  if (!content) return null;
  const layer = ANATOMY_LAYERS.find((l) => l.key === activeLayer);
  const items = content[activeLayer as keyof typeof content];

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🔬</span>
        <div>
          <h3 className="font-semibold text-blue-900 text-sm">Anatomía aplicada — {region}</h3>
          <p className="text-xs text-blue-600">Contexto clínico para los ejercicios de esta región</p>
        </div>
      </div>
      {/* Layer tabs */}
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
      {/* Content */}
      <div className={cn("rounded-xl border p-4 space-y-2", layer?.color ?? "bg-white border-blue-100")}>
        <ul className="space-y-1.5">
          {(items as string[]).map((item, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("Todos");
  const [diffFilter, setDiffFilter] = useState("Todos");
  const [playerExercise, setPlayerExercise] = useState<ExerciseData | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  // Static CDN registry — 467 exercises with Pexels video URLs
  const cdnRegistry = exerciseRegistry as Record<string, { video?: string }>;

  const filtered = ALL_EXERCISES.filter((ex) => {
    const matchSearch = !search ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      (ex.nameLocal?.toLowerCase().includes(search.toLowerCase())) ||
      ex.musclesWorked.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
      ex.region.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === "Todos" || ex.region.includes(regionFilter);
    const matchDiff = diffFilter === "Todos" || ex.difficulty === diffFilter;
    return matchSearch && matchRegion && matchDiff;
  });

  function openPlayer(index: number) {
    setPlayerIndex(index);
    const ex = filtered[index];
    setPlayerExercise({
      ...ex,
      AnimComponent: ENGINE_MAP[ex.id] ?? ex.AnimComponent,
      // Priority: 1️⃣ CDN registry (Pexels)  2️⃣ local dev fallback  3️⃣ undefined
      videoSrc: cdnRegistry[ex.id]?.video ?? ex.videoSrc ?? undefined,
    });
  }

  function handleAdd(exercise: ExerciseData) {
    setAddedIds((prev) => new Set([...prev, exercise.id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const n = new Set(prev);
        n.delete(exercise.id);
        return n;
      });
    }, 2000);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Biblioteca de ejercicios" />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

            {/* Buscador y filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar ejercicios, músculos, regiones..."
                  className="ps-9 bg-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="h-10 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <select
                  value={diffFilter}
                  onChange={(e) => setDiffFilter(e.target.value)}
                  className="h-10 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d === "Todos" ? "Todos los niveles" : DIFFICULTY_LABEL[d]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conteo */}
            <p className="text-sm text-surface-500">
              <span className="font-semibold text-surface-900">{filtered.length}</span> ejercicios encontrados
            </p>

            {/* Panel de anatomía aplicada — visible cuando hay un filtro de región activo */}
            {regionFilter !== "Todos" && REGION_TO_ANATOMY_KEY[regionFilter] && (
              <AnatomyPanel region={regionFilter} />
            )}

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((ex, i) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onPlay={() => openPlayer(i)}
                    onAdd={() => handleAdd(ex)}
                    added={addedIds.has(ex.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-surface-400 mb-2">No se encontraron ejercicios</p>
                <button onClick={() => { setSearch(""); setRegionFilter("Todos"); setDiffFilter("Todos"); }}
                  className="text-sm text-brand-600 hover:underline">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Modal */}
      {playerExercise && (
        <ExercisePlayer
          exercise={playerExercise}
          isOpen={!!playerExercise}
          onClose={() => setPlayerExercise(null)}
          onPrev={() => openPlayer(Math.max(0, playerIndex - 1))}
          onNext={() => openPlayer(Math.min(filtered.length - 1, playerIndex + 1))}
          hasPrev={playerIndex > 0}
          hasNext={playerIndex < filtered.length - 1}
          showAddToRoutine
          onAddToRoutine={handleAdd}
        />
      )}
    </div>
  );
}
