import { NextResponse } from "next/server";
import { extractSessionToken, revokeSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const token = extractSessionToken(request);
    const ip = getClientIp(request);

    if (token) {
      await revokeSession(token, ip);
    }

    const response = NextResponse.json({
      success: true,
      message: "បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ (Logged out)",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "LOGOUT_ERROR" },
      { status: 500 }
    );
  }
}
