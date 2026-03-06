"use client";

import { useState } from "react";
import { Search, Clock, Repeat2, CheckCircle2, Play } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExercisePlayer, type ExerciseData } from "@/components/exercises/ExercisePlayer";

// ─── Base de datos de ejercicios con instrucciones completas ─────────────────
const ALL_EXERCISES: ExerciseData[] = [
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
];

const REGIONS = ["Todos", "Hombro", "Lumbar", "Cadera", "Cervical", "Rodilla", "Tobillo", "Core", "Espalda media", "Glúteo", "Isquiotibiales", "Torácica"];
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

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("Todos");
  const [diffFilter, setDiffFilter] = useState("Todos");
  const [playerExercise, setPlayerExercise] = useState<ExerciseData | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

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
    setPlayerExercise(filtered[index]);
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
