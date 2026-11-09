import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: auth.user.id,
      username: auth.user.username,
      displayName: auth.user.displayName,
      role: auth.user.role,
      permissions: auth.user.permissions,
    },
  });
}
