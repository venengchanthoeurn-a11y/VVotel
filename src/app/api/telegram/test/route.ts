import { NextResponse } from "next/server";
import { sendTelegramTestAlert, syncTelegramChatIds } from "@/lib/telegram";

export async function POST() {
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

export async function GET() {
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
