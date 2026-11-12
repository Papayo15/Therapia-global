import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { exercise_name, grupo_articular, canal, patient_context, equipment } =
      await req.json();

    const canalCtx =
      canal === "B"
        ? "osteopathy manual technique"
        : canal === "C"
        ? "stretching exercise"
        : "active strengthening exercise";

    const prompt = `You are a physiotherapy communication expert specializing in patient education.

Exercise: "${exercise_name}"
Body region: ${grupo_articular}
Type: ${canalCtx}
Equipment: ${equipment ?? "bodyweight"}
Patient context: ${patient_context ?? "general adult patient"}

Generate 3 ultra-simple patient instructions (ELI5 level — explain like the patient is 5 years old).
Rules:
- ZERO medical jargon (no "isometric", "supination", "scapular", etc.)
- Use action verbs and sensory metaphors ("feel like...", "imagine...", "like you're...")
- Maximum 15 words per step
- Start each step with a concrete physical cue
- Step 3 must include breathing or return to start

Also generate one short personal note (max 20 words) the therapist can customize.

Respond in JSON only:
{
  "instructions_eli5": ["step 1", "step 2", "step 3"],
  "note_suggestion": "short personalized note template"
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(MOCK_ELI5(exercise_name));
    }

    const msg = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (err) {
    console.error("ELI5 error:", err);
    // Graceful fallback
    const { exercise_name } = await req.json().catch(() => ({ exercise_name: "this exercise" }));
    return NextResponse.json(MOCK_ELI5(exercise_name ?? "this exercise"));
  }
}

function MOCK_ELI5(name: string) {
  return {
    instructions_eli5: [
      `Start in a comfortable position for ${name}`,
      "Move slowly and controlled — feel the muscle working",
      "Return to start and breathe out completely",
    ],
    note_suggestion: `Remember to keep good form throughout — you're doing great!`,
  };
}
