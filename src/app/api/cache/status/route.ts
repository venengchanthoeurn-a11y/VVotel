import { NextResponse } from "next/server";
import { cache } from "@/lib/redis";

export async function GET() {
  const status = cache.getStatus();
  return NextResponse.json({
    status: "online",
    engine: "Next.js App Router (Node.js runtime)",
    cache: status,
    timestamp: new Date().toISOString(),
    cdnHeaders: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "CDN-Status": "Active Edge Caching Enabled",
    },
  });
}
