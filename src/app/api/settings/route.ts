import { NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = getSiteSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings payload" },
        { status: 400 }
      );
    }

    const updated = saveSiteSettings(body);

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully and synchronized across website.",
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
