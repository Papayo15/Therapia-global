import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ─── Cloudflare Stream Upload Webhook ────────────────────────────────────────
// Receives notification when a video finishes processing in Cloudflare Stream.
// Updates data/master-registry.json with the cloudflare_id.
// Triggers ISR revalidation for all 15 locales.
//
// Payload from Cloudflare Stream:
// { uid: "abc123", meta: { registry_id: "A_CER_001" }, status: { state: "ready" } }

const REGISTRY_PATH = path.join(process.cwd(), "data", "master-registry.json");

const LOCALES = ["en","es","fr","pt","de","zh","ja","ru","ar","hi","it","ko","tr","nl","pl"];

export async function POST(req: NextRequest) {
  // Guard: serverless filesystems (Netlify) — skip file writes
  if (process.env.NETLIFY === "true") {
    return NextResponse.json({ ok: true, note: "Serverless: registry updates handled via CDN" });
  }

  try {
    const body = await req.json();
    const { uid, meta, status } = body;

    if (!uid || !meta?.registry_id) {
      return NextResponse.json({ error: "Missing uid or meta.registry_id" }, { status: 400 });
    }

    if (status?.state !== "ready") {
      return NextResponse.json({ ok: true, note: `Skipped — state: ${status?.state}` });
    }

    const registryId: string = meta.registry_id;

    // Read and update registry
    const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
    const registry = JSON.parse(raw) as Record<string, { cloudflare_id?: string; video_url?: string }>;

    if (!registry[registryId]) {
      return NextResponse.json({ error: `Unknown registry_id: ${registryId}` }, { status: 404 });
    }

    registry[registryId].cloudflare_id = uid;
    registry[registryId].video_url = `https://watch.videodelivery.net/${uid}`;

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");

    // Trigger ISR revalidation for all locales
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;
    const revalidations = LOCALES.map((locale) =>
      fetch(`${baseUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `/${locale}/exercises` }),
      }).catch(() => null)
    );
    await Promise.allSettled(revalidations);

    return NextResponse.json({ ok: true, registry_id: registryId, cloudflare_id: uid });
  } catch (err) {
    console.error("[cloudflare/webhook]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
