import { NextRequest, NextResponse } from "next/server";
import { getAllBookings, BookingRecord } from "@/lib/bookings";
import {
  generateOfficialDocx,
  generateOfficialExcel,
  generateOfficialHtmlReport,
  getOfficialKhmerDate,
  filterBookingsByPeriod,
  ReportPeriod,
} from "@/lib/reports";
import { verifyAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLog";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

async function handleReportRequest(
  request: NextRequest,
  format: string,
  period: ReportPeriod,
  providedBookings?: BookingRecord[],
  refDateStr?: string
) {
  // Authorize report generation: Manager or higher required
  const auth = await verifyAuth(request, "reports:generate");
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  const ip = getClientIp(request);
  const refDate = refDateStr ? new Date(refDateStr) : new Date();
  const dateInfo = getOfficialKhmerDate(refDate);

  // Merge server bookings with client provided bookings if any
  let bookings: BookingRecord[] = [];
  if (Array.isArray(providedBookings) && providedBookings.length > 0) {
    const serverList = getAllBookings();
    const map = new Map<string, BookingRecord>();
    for (const b of providedBookings) map.set(b.id, b);
    for (const b of serverList) {
      if (!map.has(b.id)) map.set(b.id, b);
    }
    bookings = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    bookings = getAllBookings();
  }

  await logAuditEvent(
    "REPORT_GENERATED",
    { username: auth.user?.username, role: auth.user?.role, ip },
    "SUCCESS",
    { format, period, totalRecords: bookings.length }
  );

  // 1. DOCX FORMAT
  if (format === "docx" || format === "doc" || format === "word") {
    const buffer = await generateOfficialDocx(bookings, period, refDate);
    const filename = `VVotel_Official_${period}_Report_${dateInfo.isoDate}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  // 2. EXCEL FORMAT (.xlsx)
  if (format === "xlsx" || format === "excel" || format === "xls") {
    const buffer = await generateOfficialExcel(bookings, period, refDate);
    const filename = `VVotel_Executive_${period}_Report_${dateInfo.isoDate}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  // 3. CSV FORMAT
  if (format === "csv") {
    const periodInfo = filterBookingsByPeriod(bookings, period, refDate);
    const filteredList = periodInfo.filtered;

    const headers = [
      "No,ID,Category,Guest Name,Phone,Unit,CheckIn,CheckOut,Guests,AmountUSD,AmountKHR,PaymentStatus,StayStatus",
    ];
    const rows = filteredList.map((b, i) =>
      [
        i + 1,
        b.id,
        b.bookingCategory || "ROOM",
        `"${b.guestName}"`,
        `"${b.phone || ""}"`,
        `"${b.roomNameEn || b.roomType || ""}"`,
        b.checkIn,
        b.checkOut,
        b.adults || 1,
        b.totalAmountUSD || 0,
        b.totalAmountKHR || 0,
        b.paymentStatus,
        b.stayStatus,
      ].join(",")
    );
    const csvData = "\uFEFF" + [headers, ...rows].join("\n");
    const filename = `VVotel_${period}_Report_${dateInfo.isoDate}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  // 4. OFFICIAL PRINTABLE A4 REPORT / PDF VIEW (Default)
  const html = generateOfficialHtmlReport(bookings, period, refDate);
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "html").toLowerCase();
    const period = ((searchParams.get("period") || "all").toLowerCase()) as ReportPeriod;
    const refDate = searchParams.get("date") || undefined;

    return await handleReportRequest(request, format, period, undefined, refDate);
  } catch (error) {
    console.error("Failed to generate report (GET):", error);
    return NextResponse.json(
      { success: false, error: "Report generation failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const format = (body.format || "html").toLowerCase();
    const period = ((body.period || "all").toLowerCase()) as ReportPeriod;
    const providedBookings = Array.isArray(body.bookings) ? body.bookings : undefined;
    const refDate = body.date || undefined;

    return await handleReportRequest(request, format, period, providedBookings, refDate);
  } catch (error) {
    console.error("Failed to generate report (POST):", error);
    return NextResponse.json(
      { success: false, error: "Report generation failed" },
      { status: 500 }
    );
  }
}
