import { NextResponse } from "next/server";
import {
  authenticateCredentials,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // 1. Sliding window rate limiting: max 10 login attempts per minute per IP
    const rateCheck = await checkRateLimit(`login:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: `ការប៉ុនប៉ងចូលច្រើនដងពេក! សូមរង់ចាំ ${rateCheck.resetSeconds} វិនាទីមុនពេលព្យាយាមម្តងទៀត។`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { passcode, username, remember } = body;

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INPUT",
          message: "សូមបញ្ចូលលេខកូដសម្ងាត់ ឬពាក្យសម្ងាត់ (Passcode / Password required)",
        },
        { status: 400 }
      );
    }

    // 2. Authenticate
    const result = await authenticateCredentials(passcode, username, ip, userAgent);
    if (!result.success || !result.user) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ",
          locked: result.locked,
          remainingSeconds: result.remainingSeconds,
        },
        { status: 401 }
      );
    }

    // 3. Create Session
    const sessionId = await createSession(result.user, ip, userAgent);

    // 4. Set Secure HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      message: "ចូលប្រព័ន្ធដោយជោគជ័យ (Login successful)",
      user: {
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
        role: result.user.role,
        permissions: result.user.permissions,
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    const maxAge = remember === false ? undefined : SESSION_TTL_SECONDS;

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "មានបញ្ហាបច្ចេកទេសក្នុងប្រព័ន្ធ" },
      { status: 500 }
    );
  }
}
