import { safeCache } from "./redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;

function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const clean = ip.trim();
  return IPV4_REGEX.test(clean) || IPV6_REGEX.test(clean);
}

/**
 * Extract client IP address safely from trusted proxy headers.
 * Protects against IP spoofing by prioritizing verified edge headers
 * (Cloudflare cf-connecting-ip, Vercel x-vercel-forwarded-for, x-real-ip)
 * over arbitrary client-supplied X-Forwarded-For headers.
 */
export function getClientIp(request: Request): string {
  // 1. Cloudflare Edge: authenticated client IP
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) {
    return cfIp.trim();
  }

  // 2. Vercel Edge Proxy: canonical client IP added by Vercel routing
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const vList = vercelForwarded.split(",").map((s) => s.trim());
    if (vList[0] && isValidIp(vList[0])) return vList[0];
  }

  // 3. Trusted Reverse Proxy Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // 4. Fallback: Parse X-Forwarded-For safely (sanitize and validate)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const list = forwarded.split(",").map((s) => s.trim());
    // Find the first valid IP from the list
    for (const candidate of list) {
      if (isValidIp(candidate)) {
        return candidate;
      }
    }
  }

  return "127.0.0.1";
}

/**
 * Route-Specific Rate Limit Definitions
 */
export const RATE_LIMITS = {
  AUTH_LOGIN: { limit: 5, windowSeconds: 60 },
  PAYMENT_VERIFY: { limit: 10, windowSeconds: 60 },
  PAYMENT_KHQR: { limit: 20, windowSeconds: 60 },
  NEWSLETTER: { limit: 5, windowSeconds: 60 },
  RATE_INQUIRY: { limit: 60, windowSeconds: 60 },
  ADMIN_SETTINGS: { limit: 30, windowSeconds: 60 },
} as const;

/**
 * Sliding window rate limiter backed by Redis or In-Memory Cache
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const cleanId = identifier.replace(/[^a-zA-Z0-9_:.-]/g, "_");
  const key = `ratelimit:${cleanId}`;
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
