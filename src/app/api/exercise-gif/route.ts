/**
 * API Route: /api/exercise-gif?name=shoulder+external+rotation
 * Proxy hacia ExerciseDB (RapidAPI) — mantiene la key server-side.
 * Cache en memoria: cada ejercicio solo se consulta una vez por deploy.
 */

// Cache en memoria (persiste durante el ciclo de vida del servidor)
const gifCache = new Map<string, string | null>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") || "").toLowerCase().trim();

  if (!name) {
    return Response.json({ gifUrl: null });
  }

  // Devolver desde cache si existe
  if (gifCache.has(name)) {
    return Response.json({ gifUrl: gifCache.get(name) });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    // Sin API key → sin GIF (usa fallback SVG en el cliente)
    return Response.json({ gifUrl: null });
  }

  try {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name)}?limit=1`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
        // Cache a nivel de Next.js: revalidar cada 24h
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) {
      gifCache.set(name, null);
      return Response.json({ gifUrl: null });
    }

    const data = await res.json();
    const gifUrl: string | null = data?.[0]?.gifUrl ?? null;
    gifCache.set(name, gifUrl);
    return Response.json({ gifUrl });
  } catch {
    gifCache.set(name, null);
    return Response.json({ gifUrl: null });
  }
}
