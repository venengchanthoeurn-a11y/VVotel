import { NextResponse } from "next/server";
import { handleTelegramUpdate, configureTelegramBot } from "@/lib/telegram";
import { verifyAuth, timingSafeCompare } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // If webhook secret token is configured, enforce strict validation
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken) {
      const headerToken = request.headers.get("x-telegram-bot-api-secret-token") || "";
      if (!timingSafeCompare(secretToken, headerToken)) {
        return NextResponse.json({ ok: false, error: "Invalid secret token" }, { status: 403 });
      }
    }

    const update = await request.json();
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 200 });
  }
}

export async function GET(request: Request) {
  // Prevent arbitrary Host header injection & protect bot webhook configuration
  const auth = await verifyAuth(request, "telegram:manage");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    // Use canonical production domain or verified origin to prevent Host header poisoning
    const canonicalDomain =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://vvhotel.vercel.app";

    const result = await configureTelegramBot(canonicalDomain);
    return NextResponse.json({
      success: true,
      message: "Telegram Bot Webhook & Commands configured successfully",
      domain: canonicalDomain,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
