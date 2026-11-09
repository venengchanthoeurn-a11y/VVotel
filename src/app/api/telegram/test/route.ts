import { NextResponse } from "next/server";
import { sendTelegramTestAlert, syncTelegramChatIds } from "@/lib/telegram";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await verifyAuth(request, "telegram:manage");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const result = await sendTelegramTestAlert();
    return NextResponse.json({
      success: result.success,
      deliveredCount: result.deliveredCount,
      registeredChats: result.registeredChats,
      botUsername: "vvotel_bot",
      botLink: "https://t.me/vvotel_bot",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send test alert" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const auth = await verifyAuth(request, "telegram:manage");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const chatIds = await syncTelegramChatIds();
    return NextResponse.json({
      success: true,
      registeredCount: chatIds.length,
      chatIds,
      botUsername: "vvotel_bot",
      botLink: "https://t.me/vvotel_bot",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
