import { NextResponse } from "next/server";
import { DESTINATIONS } from "@/data/destinations";
import { cache } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase();

  const cacheKey = `destinations:${category || "all"}:${search || "none"}`;

  try {
    // 1. Check Redis Cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), {
        headers: {
          "X-Cache": "HIT-REDIS",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 2. Filter data
    let results = [...DESTINATIONS];

    if (category && category !== "all") {
      results = results.filter((d) => d.category === category);
    }

    if (search) {
      results = results.filter(
        (d) =>
          d.title.en.toLowerCase().includes(search) ||
          d.title.km.toLowerCase().includes(search) ||
          d.summary.en.toLowerCase().includes(search) ||
          d.summary.km.toLowerCase().includes(search) ||
          d.address.en.toLowerCase().includes(search)
      );
    }

    const responsePayload = {
      success: true,
      count: results.length,
      data: results,
      cachedAt: new Date().toISOString(),
    };

    // 3. Store in Redis with TTL 3600s
    await cache.set(cacheKey, JSON.stringify(responsePayload), "EX", 3600);

    return NextResponse.json(responsePayload, {
      headers: {
        "X-Cache": "MISS-STORED-IN-REDIS",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve destinations", data: DESTINATIONS },
      { status: 500 }
    );
  }
}
