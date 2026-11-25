import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface PDFExercise {
  order: number;
  nombre_display: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  frequency_per_week: number;
  equipment_used: string;
  note_from_therapist: string;
  instructions_eli5: string[];
}

export interface PDFPlanMeta {
  patient_name: string;
  diagnosis: string;
  plan_id?: string;
  /** link de la rutina (QR); si falta se arma con plan_id */
  share_url?: string;
  phase?: string;
  frequency_per_week?: number;
  duration_weeks?: number;
}

// ─── Colores Therapia Global ───────────────────────────────────────────────
const BRAND   = { r: 14,  g: 165, b: 233 }; // sky-500
const DARK    = { r: 15,  g: 23,  b: 42  }; // slate-900
const GRAY    = { r: 100, g: 116, b: 139 }; // slate-500
const LIGHT   = { r: 248, g: 250, b: 252 }; // slate-50
const AMBER   = { r: 245, g: 158, b: 11  }; // amber-500
const WHITE   = { r: 255, g: 255, b: 255 };

/** Textos del PDF en el idioma del terapeuta (solo alfabeto latino: la fuente estándar de jsPDF no tiene otros). */
export interface PDFLabels {
  diagnosis: string; generated: string; exercises: string; sets: string; reps: string; hold: string;
  rest: string; perWeek: string; scan: string; note: string; patient: string; locale: string;
}
const ES: PDFLabels = {
  diagnosis: "Diagnóstico", generated: "Generado el", exercises: "ejercicios", sets: "series", reps: "reps", hold: "mantener",
  rest: "descanso", perWeek: "días/semana", scan: "Escanea para ver la rutina", note: "Nota de tu terapeuta", patient: "Paciente",
  locale: "es",
};

function rgb(c: { r: number; g: number; b: number }) {
  return [c.r, c.g, c.b] as [number, number, number];
}

export async function generateRoutinePDF(
  meta: PDFPlanMeta,
  exercises: PDFExercise[],
  L: PDFLabels = ES
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 14;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  // ── Genera QR code (base64) ─────────────────────────────────────────────
  const site = window.location.origin;
  const shareUrl = meta.share_url ?? (meta.plan_id ? `${site}/${L.locale}/p/${meta.plan_id}` : null);

  let qrDataUrl: string | null = null;
  try {
    if (shareUrl) qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 200, margin: 1 });
  } catch { /* sin QR si falla */ }

  // ═══════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════
  // Barra superior azul
  doc.setFillColor(...rgb(BRAND));
  doc.rect(0, 0, W, 22, "F");

  // Logo / nombre
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...rgb(WHITE));
  doc.text("THERAPIA GLOBAL", MARGIN, 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(window.location.host, MARGIN, 14.5);

  // QR code en esquina superior derecha
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", W - MARGIN - 18, 2, 18, 18);
  }

  y = 28;

  // ── Info del paciente ──────────────────────────────────────────────────
  doc.setFillColor(...rgb(LIGHT));
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...rgb(DARK));
  doc.text(meta.patient_name || L.patient, MARGIN + 4, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...rgb(GRAY));
  doc.text(`${L.diagnosis}: ${meta.diagnosis || "-"}`, MARGIN + 4, y + 14);

  const infoRight = [];
  if (meta.phase) infoRight.push(meta.phase);
  if (meta.frequency_per_week) infoRight.push(`${meta.frequency_per_week} ${L.perWeek}`);
  if (infoRight.length) {
    doc.text(infoRight.join(" · "), MARGIN + 4, y + 19.5);
  }

  // Scan me label
  if (qrDataUrl) {
    doc.setFontSize(6);
    doc.setTextColor(...rgb(GRAY));
    doc.text(L.scan, W - MARGIN - 9, y - 4, { align: "center", maxWidth: 26 });
  }

  y += 28;

  // ── Fecha ──────────────────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(...rgb(GRAY));
  const fecha = new Date().toLocaleDateString(L.locale, {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.text(`${L.generated} ${fecha} · ${L.exercises}`, MARGIN, y);
  y += 6;

  // ═══════════════════════════════════════════════════════════
  // EJERCICIOS
  // ═══════════════════════════════════════════════════════════
  for (const ex of exercises) {
    // Calcular altura necesaria para este ejercicio
    const eli5Lines = ex.instructions_eli5?.length ?? 0;
    const noteLines = ex.note_from_therapist ? Math.ceil(ex.note_from_therapist.length / 70) : 0;
    const cardH = 14 + eli5Lines * 9 + (noteLines ? noteLines * 5 + 8 : 0) + 6;

    // Nueva página si no cabe
    if (y + cardH > 282) {
      doc.addPage();
      y = 14;
    }

    // Tarjeta del ejercicio
    doc.setFillColor(...rgb(WHITE));
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2, 2, "FD");

    // Número + nombre
    doc.setFillColor(...rgb(BRAND));
    doc.circle(MARGIN + 5, y + 6, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...rgb(WHITE));
    doc.text(String(ex.order), MARGIN + 5, y + 7.5, { align: "center" });

    doc.setTextColor(...rgb(DARK));
    doc.setFontSize(10);
    doc.text(ex.nombre_display, MARGIN + 12, y + 7.5);

    // Stats pills
    const stats = [
      `${ex.sets} ${L.sets}`,
      ex.reps > 0 ? `${ex.reps} ${L.reps}` : L.hold,
      `${ex.rest_seconds}s ${L.rest}`,
      `${ex.frequency_per_week ?? 3} ${L.perWeek}`,
    ];
    let px = MARGIN + 12;
    doc.setFontSize(7);
    for (const stat of stats) {
      const sw = doc.getTextWidth(stat) + 4;
      doc.setFillColor(...rgb(LIGHT));
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(px, y + 10, sw, 5, 1, 1, "FD");
      doc.setTextColor(...rgb(GRAY));
      doc.text(stat, px + 2, y + 13.5);
      px += sw + 2;
    }

    // Equipo
    if (ex.equipment_used) {
      doc.setFontSize(7);
      doc.setTextColor(...rgb(GRAY));
      doc.text(ex.equipment_used, MARGIN + 12, y + 18.5);
    }

    let ey = y + 22;

    // ELI5 instructions
    if (ex.instructions_eli5?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...rgb(BRAND));
      doc.text("INSTRUCCIONES PARA EL PACIENTE:", MARGIN + 4, ey);
      ey += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...rgb(DARK));
      for (let i = 0; i < ex.instructions_eli5.length; i++) {
        const stepNum = `${i + 1}.`;
        const lines = doc.splitTextToSize(ex.instructions_eli5[i], CONTENT_W - 14);
        doc.text(`${stepNum} ${lines[0]}`, MARGIN + 4, ey);
        for (let l = 1; l < lines.length; l++) {
          ey += 4.5;
          doc.text(lines[l], MARGIN + 10, ey);
        }
        ey += 5.5;
      }
    }

    // Nota del Dr.
    if (ex.note_from_therapist) {
      doc.setFillColor(254, 252, 232); // amber-50
      doc.setDrawColor(253, 230, 138); // amber-200
      doc.roundedRect(MARGIN + 4, ey, CONTENT_W - 8, noteLines * 4.5 + 6, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...rgb(AMBER));
      doc.text(`${L.note}:`, MARGIN + 7, ey + 4);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 53, 15); // amber-900
      const noteLines2 = doc.splitTextToSize(ex.note_from_therapist, CONTENT_W - 18);
      doc.text(noteLines2, MARGIN + 7, ey + 9);
    }

    y += cardH + 4;
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...rgb(GRAY));
    doc.text(
      `Therapia Global · ${window.location.host} · ${p}/${pageCount}`,
      W / 2, 292, { align: "center" }
    );
  }

  // ── Descarga ──────────────────────────────────────────────────────────
  const safeName = (meta.patient_name || "paciente")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`therapia-${safeName}-${dateStr}.pdf`);
}
