import { NextResponse } from "next/server";
import { handleTelegramUpdate, configureTelegramBot } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 200 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const domain = `${url.protocol}//${url.host}`;
    const result = await configureTelegramBot(domain);
    return NextResponse.json({
      success: true,
      message: "Telegram Bot Webhook & Commands configured successfully",
      domain,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
