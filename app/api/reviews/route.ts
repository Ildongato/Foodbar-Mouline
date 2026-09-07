import { serverEnv } from '@/lib/server-env';
export async function GET() {
  const env = await serverEnv();
  const headers = { 'Cache-Control': 'no-store' };
  if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID)
    return Response.json({ status: 'unconfigured' }, { headers });
  if (!/^[A-Za-z0-9_-]+$/.test(env.GOOGLE_PLACE_ID))
    return Response.json({ status: 'unavailable' }, { status: 503, headers });
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}?languageCode=nl`,
      {
        headers: {
          'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask':
            'rating,userRatingCount,reviews,googleMapsUri,attributions',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(7000),
      },
    );
    if (!response.ok)
      return Response.json({ status: 'unavailable' }, { status: 503, headers });
    const place = (await response.json()) as {
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      reviews?: unknown[];
      attributions?: unknown[];
    };
    return Response.json(
      {
        status: 'ready',
        rating: place.rating ?? null,
        count: place.userRatingCount ?? null,
        url: place.googleMapsUri,
        reviews: (place.reviews ?? []).slice(0, 3),
        attributions: place.attributions ?? [],
      },
      { headers },
    );
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503, headers });
  }
}
