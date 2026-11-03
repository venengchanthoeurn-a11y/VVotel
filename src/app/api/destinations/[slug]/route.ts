import { NextResponse } from "next/server";
import { DESTINATIONS } from "@/data/destinations";
import { cache } from "@/lib/redis";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const cacheKey = `destination:slug:${slug}`;

  try {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: { "X-Cache": "HIT-REDIS" },
      });
    }

    const item = DESTINATIONS.find((d) => d.slug === slug);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    const payload = { success: true, data: item };
    await cache.set(cacheKey, JSON.stringify(payload), "EX", 3600);

    return NextResponse.json(payload, {
      headers: {
        "X-Cache": "MISS-STORED",
        "Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
