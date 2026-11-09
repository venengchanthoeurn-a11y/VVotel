import { safeCache } from "./redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Extract client IP address safely from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const list = forwarded.split(",").map((s) => s.trim());
    if (list[0]) return list[0];
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

/**
 * Sliding window rate limiter backed by Redis or In-Memory Cache
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  try {
    const raw = await safeCache.get(key);
    let timestamps: number[] = [];
    if (raw) {
      try {
        timestamps = JSON.parse(raw);
      } catch {
        timestamps = [];
      }
    }

    // Filter out timestamps outside the active sliding window
    timestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        success: false,
        limit,
        remaining: 0,
        resetSeconds,
      };
    }

    // Record this request
    timestamps.push(now);
    await safeCache.set(key, JSON.stringify(timestamps), "EX", windowSeconds + 1);

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - timestamps.length),
      resetSeconds: windowSeconds,
    };
  } catch (err) {
    console.warn("Rate limiter fallback:", err);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }
}
