import { NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings-server";
import { verifyAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLog";
import { getClientIp } from "@/lib/rateLimit";
import { SiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Strips sensitive backend credentials before sending settings to public frontend
 */
function sanitizePublicSettings(settings: SiteSettings): Partial<SiteSettings> {
  const clone = { ...settings };
  // Hide secret bot tokens and OpenAPI access keys from public consumers
  clone.telegramBotToken = "";
  clone.bakongOpenApiToken = "";
  return clone;
}

export async function GET(request: Request) {
  try {
    const rawSettings = getSiteSettings();

    // Check if requester has privileged admin session
    const auth = await verifyAuth(request, "settings:read_sensitive");
    if (auth.authorized) {
      // Privileged administrator receives full settings including config keys
      return NextResponse.json({
        success: true,
        settings: rawSettings,
        isPrivileged: true,
      });
    }

    // Unauthenticated public visitors receive strictly sanitized settings without API keys
    const publicSettings = sanitizePublicSettings(rawSettings);
    return NextResponse.json({
      success: true,
      settings: publicSettings,
      isPrivileged: false,
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Enforce server-side authorization: Only Administrator or Super Admin can modify settings
  const auth = await verifyAuth(request, "settings:update");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const ip = getClientIp(request);

  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings payload" },
        { status: 400 }
      );
    }

    // Preserve existing sensitive secrets if client submitted blank strings
    const currentSettings = getSiteSettings();
    if (!body.telegramBotToken && currentSettings.telegramBotToken) {
      body.telegramBotToken = currentSettings.telegramBotToken;
    }
    if (!body.bakongOpenApiToken && currentSettings.bakongOpenApiToken) {
      body.bakongOpenApiToken = currentSettings.bakongOpenApiToken;
    }

    const updated = saveSiteSettings(body);

    await logAuditEvent(
      "SETTINGS_UPDATED",
      { username: auth.user?.username, role: auth.user?.role, ip },
      "SUCCESS",
      {
        hotelNameKm: updated.hotelNameKm,
        roomsCount: updated.rooms?.length,
        diningCount: updated.dining?.length,
        destinationsCount: updated.destinations?.length,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully and synchronized across website.",
      settings: updated,
    });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
