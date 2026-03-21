import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Cloudflare Stream Upload Webhook ────────────────────────────────────────
// Fires when a video finishes processing in Cloudflare Stream.
// Writes cloudflare_id + video_url to Supabase `video_registry` table.
// This works on Netlify serverless (no filesystem writes).
//
// Cloudflare Stream webhook payload:
// { uid: "abc123", meta: { registry_id: "A_CER_001" }, status: { state: "ready" } }
//
// Supabase SQL (run once):
// create table video_registry (
//   registry_id text primary key,
//   cloudflare_id text,
//   video_url text,
//   updated_at timestamptz default now()
// );

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, meta, status } = body;

    if (!uid || !meta?.registry_id) {
      return NextResponse.json({ error: "Missing uid or meta.registry_id" }, { status: 400 });
    }

    if (status?.state !== "ready") {
      return NextResponse.json({ ok: true, note: `Skipped — state: ${status?.state}` });
    }

    const registry_id: string = meta.registry_id;
    const video_url = `https://watch.videodelivery.net/${uid}`;

    const { error } = await supabase.from("video_registry").upsert({
      registry_id,
      cloudflare_id: uid,
      video_url,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[cloudflare/webhook] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, registry_id, cloudflare_id: uid, video_url });
  } catch (err) {
    console.error("[cloudflare/webhook]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
