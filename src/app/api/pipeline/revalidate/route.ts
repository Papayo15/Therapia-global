/**
 * POST /api/pipeline/revalidate?slug=bird-dog
 *
 * Manually triggers ISR revalidation for a specific exercise/technique slug
 * across all 10 locales. Used by the /admin/pipeline dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const LOCALES = ["en", "es", "fr", "de", "pt", "ar", "zh", "hi", "ja", "ru"];

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug query param required" }, { status: 400 });
  }

  const revalidated: string[] = [];

  try {
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/exercise/${slug}`, "page");
      revalidatePath(`/${locale}/osteopathy/${slug}`, "page");
      revalidated.push(`/${locale}/exercise/${slug}`, `/${locale}/osteopathy/${slug}`);
    }
    revalidatePath("/[locale]/exercises", "page");
    revalidatePath("/[locale]/osteopathy", "page");
  } catch {
    // revalidatePath may throw outside Next.js request context
  }

  return NextResponse.json({ success: true, slug, revalidated }, { status: 200 });
}
