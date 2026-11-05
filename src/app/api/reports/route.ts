import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/bookings";
import {
  generateOfficialDocx,
  generateOfficialExcel,
  generateOfficialHtmlReport,
  getOfficialKhmerDate,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "html").toLowerCase();
    const dateInfo = getOfficialKhmerDate();
    const bookings = getAllBookings();

    // 1. DOCX FORMAT
    if (format === "docx" || format === "doc" || format === "word") {
      const buffer = await generateOfficialDocx(bookings);
      const filename = `VVotel_Official_Administrative_Report_${dateInfo.isoDate}.docx`;

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
      const buffer = await generateOfficialExcel(bookings);
      const filename = `VVotel_Official_Executive_Report_${dateInfo.isoDate}.xlsx`;

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
      const headers = [
        "No,ID,Category,Guest Name,Phone,Unit,CheckIn,CheckOut,Guests,AmountUSD,AmountKHR,PaymentStatus,StayStatus",
      ];
      const rows = bookings.map((b, i) =>
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
      const filename = `VVotel_Report_${dateInfo.isoDate}.csv`;

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
    const html = generateOfficialHtmlReport(bookings);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { success: false, error: "Report generation failed" },
      { status: 500 }
    );
  }
}
