import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getAuditLogs } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAuth(request, "audit:read");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));

  const logs = await getAuditLogs(limit);

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs,
  });
}
