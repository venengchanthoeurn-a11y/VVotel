import fs from "fs";
import path from "path";
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, Packer, ImageRun } from "docx";
import ExcelJS from "exceljs";
import { BookingRecord } from "./bookings";

import {
  toKhmerNum,
  getOfficialKhmerDate,
  PERIOD_TITLES,
  filterBookingsByPeriod,
  ReportPeriod,
} from "./reportsShared";

export {
  toKhmerNum,
  getOfficialKhmerDate,
  PERIOD_TITLES,
  filterBookingsByPeriod,
};
export type { ReportPeriod };






/**
 * Compute key administrative metrics from bookings
 */

export function computeReportMetrics(bookings: BookingRecord[]) {
  const totalBookings = bookings.length;
  const roomBookings = bookings.filter(
    (b) => b.bookingCategory === "ROOM" || (!b.bookingCategory && !b.id.startsWith("DIN"))
  ).length;
  const diningBookings = bookings.filter(
    (b) => b.bookingCategory === "DINING" || b.id.startsWith("DIN")
  ).length;
  const inHouseCount = bookings.filter(
    (b) => b.stayStatus === "CHECKED_IN" || b.stayStatus === "SEATED"
  ).length;

  const paidList = bookings.filter(
    (b) => b.paymentStatus === "PAID" || b.paymentStatus === "GUARANTEED"
  );
  const totalPaidUSD = paidList.reduce((acc, b) => acc + (Number(b.totalAmountUSD) || 0), 0);
  const totalPaidKHR = Math.round(totalPaidUSD * 4100);

  const pendingList = bookings.filter((b) => b.paymentStatus === "PENDING");
  const totalPendingUSD = pendingList.reduce((acc, b) => acc + (Number(b.totalAmountUSD) || 0), 0);
  const totalPendingKHR = Math.round(totalPendingUSD * 4100);

  return {
    totalBookings,
    roomBookings,
    diningBookings,
    inHouseCount,
    totalPaidUSD,
    totalPaidKHR,
    totalPendingUSD,
    totalPendingKHR,
  };
}

/**
 * 1. GENERATE OFFICIAL CAMBODIAN ADMINISTRATIVE REPORT (.DOCX)
 * Strictly follows Kingdom of Cambodia administrative standards,
 * with Khmer Mool for headers, Khmer OS Siemreap for body, official tables & signature blocks.
 */
export async function generateOfficialDocx(
  rawBookings: BookingRecord[],
  period: ReportPeriod = "all",
  refDate?: Date
): Promise<Buffer> {
  const dateInfo = getOfficialKhmerDate(refDate);
  const periodInfo = filterBookingsByPeriod(rawBookings, period, refDate);
  const bookings = periodInfo.filtered;
  const metrics = computeReportMetrics(bookings);

  // Load official logo for administrative header
  let logoImageRun: ImageRun | null = null;
  try {
    const logoPngPath = path.join(process.cwd(), "public", "images", "vvotel-logo.png");
    const logoIconPath = path.join(process.cwd(), "public", "icons", "icon-192.png");
    const logoPath = fs.existsSync(logoPngPath) ? logoPngPath : logoIconPath;
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoImageRun = new ImageRun({
        data: logoBuffer,
        type: "png",
        transformation: { width: 42, height: 42 },
      });
    }
  } catch (err) {
    console.warn("Could not load logo for docx:", err);
  }

  // Fonts configuration
  const FONT_MOOL = "Khmer Mool";
  const FONT_BODY = "Khmer OS Siemreap";

  const doc = new Document({
    creator: "សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
    title: "របាយការណ៍បូកសរុបប្រតិបត្តិការអាជីវកម្មសណ្ឋាគារ និងភោជនីយដ្ឋាន",
    description: "របាយការណ៍រដ្ឋបាលផ្លូវការ នៃសណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        children: [
          // ==========================================
          // 1. TOP HEADER: KINGDOM MOTTO CENTERED
          // ==========================================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ព្រះរាជាណាចក្រកម្ពុជា",
                font: FONT_MOOL,
                size: 26,
                bold: true,
                color: "0C2340",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
                font: FONT_MOOL,
                size: 23,
                bold: true,
                color: "0C2340",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: "❖ ❖ ❖",
                font: FONT_BODY,
                size: 18,
                color: "8B5E3C",
              }),
            ],
          }),

          // ==========================================
          // 2. HOTEL ON LEFT & DATE ON RIGHT (SAME LINE)
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  // Left side: Hotel Organization & Reference
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      ...(logoImageRun
                        ? [
                            new Paragraph({
                              spacing: { after: 60 },
                              children: [logoImageRun],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
                            font: FONT_MOOL,
                            size: 21,
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ",
                            font: FONT_BODY,
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `លេខ: ០២៤/២៦ វវ.កច`,
                            font: FONT_BODY,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                  // Right side: Date aligned with hotel on same line
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: dateInfo.standardHeaderDate,
                            font: FONT_BODY,
                            size: 20,
                            italics: true,
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 120 } }),

          // ==========================================
          // REPORT TITLE
          // ==========================================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: periodInfo.periodLabelKm,
                font: FONT_MOOL,
                size: 28,
                bold: true,
                color: "0C2340",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "ស្តីពី ប្រតិបត្តិការអាជីវកម្មស្នាក់នៅ និងភោជនីយដ្ឋាន",
                font: FONT_MOOL,
                size: 21,
                color: "0C2340",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: periodInfo.dateRangeText,
                font: FONT_BODY,
                size: 19,
                color: "8B5E3C",
                bold: true,
              }),
            ],
          }),

          // ==========================================
          // OBJECTIVE & REFERENCES
          // ==========================================
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "គោរពជូន: ",
                font: FONT_BODY,
                size: 21,
                bold: true,
              }),
              new TextRun({
                text: "ឯកឧត្តម/លោកជំទាវ/លោក-លោកស្រី អគ្គនាយកសណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
                font: FONT_BODY,
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "កម្មវត្ថុ: ",
                font: FONT_BODY,
                size: 21,
                bold: true,
              }),
              new TextRun({
                text: "របាយការណ៍បូកសរុបទិន្នន័យនៃការកក់បន្ទប់ស្នាក់នៅ ការកក់តុអាហារ ស្ថានភាពចំណូល និងប្រតិបត្តិការអាជីវកម្មសរុប។",
                font: FONT_BODY,
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: "យោង: ",
                font: FONT_BODY,
                size: 21,
                bold: true,
              }),
              new TextRun({
                text: "ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារកណ្តាល VVotel PMS Cloud Database & ALL Accor Interface។",
                font: FONT_BODY,
                size: 21,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: "សេចក្តីដូចបានជម្រាបជូនក្នុងកម្មវត្ថុ និងយោងខាងលើ ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ នៃសណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម មានកិត្តិយសសូមគោរពជម្រាបជូននូវរបាយការណ៍បូកសរុបប្រតិបត្តិការ និងស្ថិតិលម្អិតដូចខាងក្រោម៖",
                font: FONT_BODY,
                size: 21,
              }),
            ],
          }),

          // ==========================================
          // SECTION I: EXECUTIVE SUMMARY TABLE
          // ==========================================
          new Paragraph({
            spacing: { before: 100, after: 120 },
            children: [
              new TextRun({
                text: "I. តារាងស្ថិតិសង្ខេបប្រតិបត្តិការ (Executive Operational Summary)",
                font: FONT_MOOL,
                size: 21,
                bold: true,
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "សូចនាករប្រតិបត្តិការ",
                            font: FONT_BODY,
                            bold: true,
                            color: "FFFFFF",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "បរិមាណ / ចំនួន",
                            font: FONT_BODY,
                            bold: true,
                            color: "FFFFFF",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "ទឹកប្រាក់ USD ($)",
                            font: FONT_BODY,
                            bold: true,
                            color: "FFFFFF",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "ទឹកប្រាក់ KHR (៛)",
                            font: FONT_BODY,
                            bold: true,
                            color: "FFFFFF",
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              // Row 1: Rooms
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "១. ការកក់បន្ទប់ស្នាក់នៅ (Room Bookings)", font: FONT_BODY, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `${toKhmerNum(metrics.roomBookings)} បន្ទប់`, font: FONT_BODY, size: 20, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `$${metrics.totalPaidUSD.toFixed(2)}`, font: FONT_BODY, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `${toKhmerNum(metrics.totalPaidKHR.toLocaleString())} ៛`, font: FONT_BODY, size: 20 })],
                      }),
                    ],
                  }),
                ],
              }),
              // Row 2: Dining
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "២. ការកក់តុអាហារ (Dining Reservations)", font: FONT_BODY, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `${toKhmerNum(metrics.diningBookings)} តុ`, font: FONT_BODY, size: 20, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "$0.00", font: FONT_BODY, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "០ ៛", font: FONT_BODY, size: 20 })],
                      }),
                    ],
                  }),
                ],
              }),
              // Row 3: Total
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "សរុបរួម (Grand Total Revenue)", font: FONT_BODY, size: 20, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `${toKhmerNum(metrics.totalBookings)} ប្រតិបត្តិការ`, font: FONT_BODY, size: 20, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `$${metrics.totalPaidUSD.toFixed(2)}`, font: FONT_BODY, size: 20, bold: true, color: "0C2340" })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `${toKhmerNum(metrics.totalPaidKHR.toLocaleString())} ៛`, font: FONT_BODY, size: 20, bold: true, color: "0C2340" })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 180, after: 120 } }),

          // ==========================================
          // SECTION II: DETAILED TRANSACTION RECORDS
          // ==========================================
          new Paragraph({
            children: [
              new TextRun({
                text: "II. តារាងបញ្ជីលម្អិតនៃប្រតិបត្តិការ (Detailed Operational Records)",
                font: FONT_MOOL,
                size: 21,
                bold: true,
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ល.រ", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "កូដកក់", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ឈ្មោះភ្ញៀវ", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "សេវាកម្ម/បន្ទប់/តុ", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "កាលបរិច្ឆេទ", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ការទូទាត់", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                  new TableCell({
                    shading: { fill: "0C2340" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ទឹកប្រាក់ ($)", font: FONT_BODY, size: 18, color: "FFFFFF", bold: true })] })],
                  }),
                ],
              }),
              ...bookings.slice(0, 30).map((b, idx) => {
                const isDin = b.bookingCategory === "DINING" || b.id.startsWith("DIN");
                const unitName = isDin
                  ? b.venueNameKm || "តុអាហារ"
                  : b.roomNameKm || b.roomNameEn || "បន្ទប់ស្តង់ដារ";
                const unitNo = b.roomNumber ? `(${b.roomNumber})` : "";
                const payBadge = b.paymentStatus === "PAID" ? "ទូទាត់រួច" : "រង់ចាំ";

                return new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: toKhmerNum(idx + 1), font: FONT_BODY, size: 17 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: b.id, font: FONT_BODY, size: 17 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: b.guestName, font: FONT_BODY, size: 17, bold: true })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: `${unitName} ${unitNo}`, font: FONT_BODY, size: 17 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: b.checkIn, font: FONT_BODY, size: 17 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: payBadge, font: FONT_BODY, size: 17 })] })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `$${Number(b.totalAmountUSD || 0).toFixed(2)}`, font: FONT_BODY, size: 17 })] })],
                    }),
                  ],
                });
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 120 } }),

          // ==========================================
          // SECTION III: ADMINISTRATIVE CONCLUSION
          // ==========================================
          new Paragraph({
            children: [
              new TextRun({
                text: "III. ការសន្និដ្ឋាន និងសំណូមពរ (Administrative Conclusion & Remarks)",
                font: FONT_MOOL,
                size: 21,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "១. ប្រតិបត្តិការទទួលភ្ញៀវស្នាក់នៅ និងភោជនីយដ្ឋានប្រព្រឹត្តទៅដោយរលូន ស្របតាមបទដ្ឋានសេវាកម្មលំដាប់ផ្កាយ ៥ និងក្រមសីលធម៌វិជ្ជាជីវៈខ្ពស់។",
                font: FONT_BODY,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "២. ប្រព័ន្ធទូទាត់ប្រាក់ឌីជីថល Bakong KHQR និង Card 3DS ធានាសុវត្ថិភាពប្រតិបត្តិការ ១០០% ការពារហានិភ័យ និងគ្មានការក្លែងបន្លំ។",
                font: FONT_BODY,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "៣. ទិន្នន័យប្រតិបត្តិការទាំងអស់ត្រូវបានកត់ត្រា និងធ្វើសមកាលកម្មស្វ័យប្រវត្តិក្នងប្រព័ន្ធកណ្តាល VVotel PMS និង Telegram Real-time Bot (@vvotel_bot)។",
                font: FONT_BODY,
                size: 20,
              }),
            ],
          }),

          // ==========================================
          // SIGNATURES & OFFICIAL STAMP BLOCKS
          // ==========================================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  // Left side
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "បានឃើញ និងឯកភាព",
                            font: FONT_BODY,
                            size: 20,
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "ប្រធានផ្នែកគណនេយ្យ និងហិរញ្ញវត្ថុ",
                            font: FONT_MOOL,
                            size: 20,
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 800 },
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "( ហត្ថលេខា និងត្រា )",
                            font: FONT_BODY,
                            size: 18,
                            italics: true,
                            color: "777777",
                          }),
                        ],
                      }),
                    ],
                  }),
                  // Right side
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: dateInfo.standardHeaderDate,
                            font: FONT_BODY,
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "អ្នកធ្វើតារាងរបាយការណ៍",
                            font: FONT_MOOL,
                            size: 20,
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 800 },
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "( ហត្ថលេខា និងត្រា )",
                            font: FONT_BODY,
                            size: 18,
                            italics: true,
                            color: "777777",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Footer CC
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "កន្លែងទទួល (CC):",
                font: FONT_BODY,
                size: 18,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- ក្រុមប្រឹក្សាភិបាល \"ដើម្បីជ្រាបជាព័ត៌មាន\"\n- នាយកដ្ឋានគ្រប់គ្រងទូទៅ \"ដើម្បីអនុវត្ត\"\n- ឯកសារ-កាលប្បវត្ត",
                font: FONT_BODY,
                size: 17,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * 2. GENERATE OFFICIAL ADMINISTRATIVE EXCEL (.XLSX)
 * Generates an executive workbook with stylized header banners,
 * summary cards, formatted transaction columns, sums and official footer.
 */
export async function generateOfficialExcel(
  rawBookings: BookingRecord[],
  period: ReportPeriod = "all",
  refDate?: Date
): Promise<Buffer> {
  const dateInfo = getOfficialKhmerDate(refDate);
  const periodInfo = filterBookingsByPeriod(rawBookings, period, refDate);
  const bookings = periodInfo.filtered;
  const metrics = computeReportMetrics(bookings);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VVotel PMS Central";
  workbook.lastModifiedBy = "General Manager";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("របាយការណ៍រដ្ឋបាល VVotel", {
    pageSetup: { orientation: "landscape", paperSize: 9 },
  });

  // Apply default font
  worksheet.views = [{ showGridLines: true }];

  // Column configuration
  worksheet.columns = [
    { key: "no", width: 8 },
    { key: "id", width: 18 },
    { key: "category", width: 14 },
    { key: "guest", width: 26 },
    { key: "phone", width: 16 },
    { key: "unit", width: 28 },
    { key: "roomNo", width: 14 },
    { key: "checkIn", width: 14 },
    { key: "checkOut", width: 14 },
    { key: "pax", width: 10 },
    { key: "paymentMethod", width: 18 },
    { key: "paymentStatus", width: 16 },
    { key: "stayStatus", width: 16 },
    { key: "amountUSD", width: 16 },
    { key: "amountKHR", width: 20 },
  ];

  // 1. National Banner
  worksheet.mergeCells("A1:O1");
  const cellA1 = worksheet.getCell("A1");
  cellA1.value = "ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ";
  cellA1.font = { name: "Khmer OS Siemreap", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  cellA1.alignment = { horizontal: "center", vertical: "middle" };
  cellA1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0C2340" },
  };
  worksheet.getRow(1).height = 30;

  // 2. Organization & Date
  worksheet.mergeCells("A2:H2");
  const cellA2 = worksheet.getCell("A2");
  cellA2.value = "សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ (លេខ: ០២៤/២៦ វវ.កច)";
  cellA2.font = { name: "Khmer OS Siemreap", size: 11, bold: true, color: { argb: "FF333333" } };
  cellA2.alignment = { vertical: "middle" };

  worksheet.mergeCells("I2:O2");
  const cellI2 = worksheet.getCell("I2");
  cellI2.value = dateInfo.standardHeaderDate;
  cellI2.font = { name: "Khmer OS Siemreap", size: 11, italic: true, color: { argb: "FF666666" } };
  cellI2.alignment = { horizontal: "right", vertical: "middle" };
  worksheet.getRow(2).height = 24;

  // 3. Report Main Title
  worksheet.mergeCells("A4:O4");
  const cellA4 = worksheet.getCell("A4");
  cellA4.value = `${periodInfo.periodLabelKm} ស្តីពី ប្រតិបត្តិការអាជីវកម្មស្នាក់នៅ និងភោជនីយដ្ឋាន (${periodInfo.dateRangeText})`;
  cellA4.font = { name: "Khmer OS Siemreap", size: 14, bold: true, color: { argb: "FF0C2340" } };
  cellA4.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(4).height = 28;

  // 4. Executive Summary KPI Row
  worksheet.mergeCells("A6:C6");
  worksheet.getCell("A6").value = `ការកក់សរុប: ${metrics.totalBookings} (បន្ទប់: ${metrics.roomBookings} | តុ: ${metrics.diningBookings})`;
  worksheet.getCell("A6").font = { name: "Khmer OS Siemreap", size: 10, bold: true };
  worksheet.getCell("A6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F7FF" } };

  worksheet.mergeCells("D6:F6");
  worksheet.getCell("D6").value = `ភ្ញៀវកំពុងស្នាក់នៅ (In-House): ${metrics.inHouseCount} នាក់`;
  worksheet.getCell("D6").font = { name: "Khmer OS Siemreap", size: 10, bold: true, color: { argb: "FF0070BA" } };
  worksheet.getCell("D6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F7FF" } };

  worksheet.mergeCells("G6:K6");
  worksheet.getCell("G6").value = `ចំណូលសរុប (USD): $${metrics.totalPaidUSD.toFixed(2)}`;
  worksheet.getCell("G6").font = { name: "Khmer OS Siemreap", size: 11, bold: true, color: { argb: "FF008000" } };
  worksheet.getCell("G6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F9E6" } };

  worksheet.mergeCells("L6:O6");
  worksheet.getCell("L6").value = `ចំណូលសរុប (KHR): ${metrics.totalPaidKHR.toLocaleString()} ៛`;
  worksheet.getCell("L6").font = { name: "Khmer OS Siemreap", size: 11, bold: true, color: { argb: "FF008000" } };
  worksheet.getCell("L6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F9E6" } };
  worksheet.getRow(6).height = 26;

  // 5. Table Headers Row (Row 8)
  const headerRow = worksheet.getRow(8);
  headerRow.values = [
    "ល.រ",
    "លេខកូដកក់",
    "ប្រភេទ",
    "ឈ្មោះភ្ញៀវកិត្តិយស",
    "លេខទូរស័ព្ទ",
    "សេវាកម្ម / បន្ទប់ / តុ",
    "លេខយូនីត",
    "ថ្ងៃចូល/កក់",
    "ថ្ងៃចេញ/ម៉ោង",
    "ចំនួនភ្ញៀវ",
    "វិធីទូទាត់",
    "ស្ថានភាពប្រាក់",
    "ស្ថានភាពស្នាក់នៅ",
    "ទឹកប្រាក់ ($ USD)",
    "ទឹកប្រាក់ (៛ KHR)",
  ];
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Khmer OS Siemreap", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0C2340" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  // 6. Data Rows
  let currentRow = 9;
  bookings.forEach((b, index) => {
    const isDin = b.bookingCategory === "DINING" || b.id.startsWith("DIN");
    const row = worksheet.getRow(currentRow);
    row.values = [
      index + 1,
      b.id,
      isDin ? "ភោជនីយដ្ឋាន" : "បន្ទប់ស្នាក់នៅ",
      b.guestName,
      b.phone || "-",
      isDin ? b.venueNameKm || "តុអាហារ" : b.roomNameKm || b.roomNameEn || "បន្ទប់",
      b.roomNumber || "-",
      b.checkIn,
      b.checkOut,
      b.adults || 1,
      b.paymentMethod || "Direct",
      b.paymentStatus === "PAID" ? "ទូទាត់រួច" : "រង់ចាំ",
      b.stayStatus || "CONFIRMED",
      Number(b.totalAmountUSD || 0),
      Number(b.totalAmountKHR || Math.round(Number(b.totalAmountUSD || 0) * 4100)),
    ];

    row.height = 22;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Khmer OS Siemreap", size: 10 };
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };

      // Alignment tweaks
      if (colNumber === 1 || colNumber === 8 || colNumber === 9 || colNumber === 10) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
      if (colNumber === 14) {
        cell.numFmt = "$#,##0.00";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      }
      if (colNumber === 15) {
        cell.numFmt = "#,##0 ៛";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      }
    });

    currentRow++;
  });

  // Grand Total Summary Row
  const totalRow = worksheet.getRow(currentRow);
  totalRow.values = [
    "",
    "សរុបរួម (TOTAL)",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    metrics.totalPaidUSD,
    metrics.totalPaidKHR,
  ];
  totalRow.height = 26;
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: "Khmer OS Siemreap", size: 10, bold: true, color: { argb: "FF0C2340" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
    if (colNumber === 14) cell.numFmt = "$#,##0.00";
    if (colNumber === 15) cell.numFmt = "#,##0 ៛";
  });

  // Signatures Row in Excel
  const sigRowIndex = currentRow + 2;
  worksheet.mergeCells(`B${sigRowIndex}:E${sigRowIndex}`);
  worksheet.getCell(`B${sigRowIndex}`).value = "បានឃើញ និងឯកភាព";
  worksheet.getCell(`B${sigRowIndex}`).font = { name: "Khmer OS Siemreap", size: 10, bold: true };
  worksheet.getCell(`B${sigRowIndex}`).alignment = { horizontal: "center" };

  worksheet.mergeCells(`K${sigRowIndex}:N${sigRowIndex}`);
  worksheet.getCell(`K${sigRowIndex}`).value = dateInfo.standardHeaderDate;
  worksheet.getCell(`K${sigRowIndex}`).font = { name: "Khmer OS Siemreap", size: 10, italic: true };
  worksheet.getCell(`K${sigRowIndex}`).alignment = { horizontal: "center" };

  worksheet.mergeCells(`B${sigRowIndex + 1}:E${sigRowIndex + 1}`);
  worksheet.getCell(`B${sigRowIndex + 1}`).value = "ប្រធានផ្នែកគណនេយ្យ និងហិរញ្ញវត្ថុ";
  worksheet.getCell(`B${sigRowIndex + 1}`).font = { name: "Khmer OS Siemreap", size: 10, bold: true, color: { argb: "FF0C2340" } };
  worksheet.getCell(`B${sigRowIndex + 1}`).alignment = { horizontal: "center" };

  worksheet.mergeCells(`K${sigRowIndex + 1}:N${sigRowIndex + 1}`);
  worksheet.getCell(`K${sigRowIndex + 1}`).value = "អ្នកធ្វើតារាងរបាយការណ៍";
  worksheet.getCell(`K${sigRowIndex + 1}`).font = { name: "Khmer OS Siemreap", size: 10, bold: true, color: { argb: "FF0C2340" } };
  worksheet.getCell(`K${sigRowIndex + 1}`).alignment = { horizontal: "center" };

  worksheet.mergeCells(`B${sigRowIndex + 4}:E${sigRowIndex + 4}`);
  worksheet.getCell(`B${sigRowIndex + 4}`).value = "( ហត្ថលេខា និងត្រា )";
  worksheet.getCell(`B${sigRowIndex + 4}`).font = { name: "Khmer OS Siemreap", size: 9, italic: true, color: { argb: "FF888888" } };
  worksheet.getCell(`B${sigRowIndex + 4}`).alignment = { horizontal: "center" };

  worksheet.mergeCells(`K${sigRowIndex + 4}:N${sigRowIndex + 4}`);
  worksheet.getCell(`K${sigRowIndex + 4}`).value = "( ហត្ថលេខា និងត្រា )";
  worksheet.getCell(`K${sigRowIndex + 4}`).font = { name: "Khmer OS Siemreap", size: 9, italic: true, color: { argb: "FF888888" } };
  worksheet.getCell(`K${sigRowIndex + 4}`).alignment = { horizontal: "center" };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * 3. GENERATE PRINTABLE OFFICIAL A4 ADMINISTRATIVE HTML REPORT (For PDF Download & Browser Print)
 */
export function generateOfficialHtmlReport(
  rawBookings: BookingRecord[],
  period: ReportPeriod = "all",
  refDate?: Date
): string {
  const dateInfo = getOfficialKhmerDate(refDate);
  const periodInfo = filterBookingsByPeriod(rawBookings, period, refDate);
  const bookings = periodInfo.filtered;
  const metrics = computeReportMetrics(bookings);

  const tableRows = bookings
    .map((b, idx) => {
      const isDin = b.bookingCategory === "DINING" || b.id.startsWith("DIN");
      const unitName = isDin
        ? b.venueNameKm || "តុអាហារ"
        : b.roomNameKm || b.roomNameEn || "បន្ទប់";
      const unitNo = b.roomNumber ? `(${b.roomNumber})` : "";
      const isPaid = b.paymentStatus === "PAID" || b.paymentStatus === "GUARANTEED";
      const payClass = isPaid
        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
        : "bg-amber-50 text-amber-700 border border-amber-300";
      const payText = isPaid ? "ទូទាត់រួច" : "រង់ចាំ";

      return `
      <tr class="border-b border-gray-200 hover:bg-amber-50/40 text-[13px]">
        <td class="py-2.5 px-2 text-center font-bold text-gray-700">${toKhmerNum(idx + 1)}</td>
        <td class="py-2.5 px-2 font-mono font-bold text-[#0c2340]">${b.id}</td>
        <td class="py-2.5 px-2 font-bold text-gray-900">${b.guestName}</td>
        <td class="py-2.5 px-2 text-gray-800">${unitName} <span class="text-xs text-gray-500 font-mono">${unitNo}</span></td>
        <td class="py-2.5 px-2 text-center text-gray-700 font-mono text-xs">${b.checkIn}</td>
        <td class="py-2.5 px-2 text-center">
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold ${payClass}">${payText}</span>
        </td>
        <td class="py-2.5 px-2 text-center text-xs font-bold text-gray-700">${b.stayStatus}</td>
        <td class="py-2.5 px-2 text-right font-mono font-bold text-[#0c2340]">$${Number(b.totalAmountUSD || 0).toFixed(2)}</td>
        <td class="py-2.5 px-2 text-right font-mono text-gray-800">${toKhmerNum(Number(b.totalAmountKHR || Math.round(Number(b.totalAmountUSD || 0) * 4100)).toLocaleString())} ៛</td>
      </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>របាយការណ៍បូកសរុបប្រតិបត្តិការអាជីវកម្ម • សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #f3f4f6;
      font-family: 'Siemreap', 'Kantumruy Pro', sans-serif;
      color: #111827;
      padding: 24px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .font-mool {
      font-family: 'Moul', cursive, serif;
    }
    .font-siemreap {
      font-family: 'Siemreap', 'Kantumruy Pro', sans-serif;
    }
    .action-bar {
      max-width: 900px;
      margin: 0 auto 20px auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #ffffff;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      border: 1px solid #e5e7eb;
    }
    .action-bar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .action-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 10px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-print {
      background-color: #0c2340;
      color: #fde68a;
    }
    .btn-print:hover {
      background-color: #163a66;
    }
    .btn-docx {
      background-color: #2563eb;
      color: #ffffff;
    }
    .btn-docx:hover {
      background-color: #1d4ed8;
    }
    .btn-excel {
      background-color: #047857;
      color: #ffffff;
    }
    .btn-excel:hover {
      background-color: #065f46;
    }
    .btn-back {
      background-color: #ffffff;
      color: #0c2340;
      border: 1.5px solid #d1d5db;
    }
    .btn-back:hover {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }
    .btn-csv {
      background-color: #4b5563;
      color: #ffffff;
    }
    .btn-csv:hover {
      background-color: #374151;
    }
    .btn-orientation {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .btn-orientation:hover {
      background-color: #fde68a;
    }
    .page-sheet {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
      position: relative;
      transition: max-width 0.3s;
    }
    body.page-landscape .page-sheet {
      max-width: 1120px;
    }
    .report-logo {
      width: 48px !important;
      height: 48px !important;
      max-width: 48px !important;
      max-height: 48px !important;
      object-fit: contain !important;
      border-radius: 10px;
      border: 1px solid #f59e0b;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: block !important;
      flex-shrink: 0;
    }
    .top-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .top-header h1 {
      font-family: 'Moul', cursive, serif;
      font-size: 20px;
      color: #0c2340;
      letter-spacing: 0.05em;
    }
    .top-header h2 {
      font-family: 'Moul', cursive, serif;
      font-size: 16px;
      color: #0c2340;
      margin-top: 4px;
      letter-spacing: 0.05em;
    }
    .top-header .symbols {
      color: #b45309;
      font-size: 14px;
      margin-top: 6px;
      letter-spacing: 0.3em;
    }
    .org-date-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 16px;
      margin-bottom: 24px;
      gap: 16px;
    }
    .org-info {
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
    }
    .org-info h2 {
      font-family: 'Moul', cursive, serif;
      font-size: 15px;
      color: #0c2340;
      line-height: 1.4;
    }
    .org-info p {
      font-size: 12px;
      color: #4b5563;
      margin-top: 2px;
    }
    .date-info {
      text-align: right;
      padding-top: 4px;
      font-size: 12px;
      font-style: italic;
      color: #374151;
      font-weight: bold;
      white-space: nowrap;
    }
    .report-title-block {
      text-align: center;
      margin: 24px 0;
    }
    .report-title-block h1 {
      font-family: 'Moul', cursive, serif;
      font-size: 22px;
      color: #0c2340;
      letter-spacing: 0.02em;
    }
    .report-title-block h2 {
      font-family: 'Moul', cursive, serif;
      font-size: 15px;
      color: #374151;
      margin-top: 6px;
    }
    .date-badge {
      display: inline-block;
      background: #fef3c7;
      color: #78350f;
      border: 1px solid #fcd34d;
      padding: 4px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    .directives-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 12.5px;
      margin-bottom: 24px;
      line-height: 1.7;
    }
    .directives-box p {
      margin-bottom: 6px;
    }
    .directives-intro {
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid #e5e7eb;
      color: #374151;
      text-align: justify;
    }
    .section-title {
      font-family: 'Moul', cursive, serif;
      font-size: 14px;
      color: #0c2340;
      margin-bottom: 12px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      text-align: center;
      margin-bottom: 24px;
    }
    .kpi-card {
      padding: 12px 8px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    .kpi-card .kpi-label {
      display: block;
      font-size: 11.5px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .kpi-card .kpi-val {
      font-size: 18px;
      font-weight: bold;
      font-family: monospace, sans-serif;
    }
    .kpi-card .kpi-sub {
      display: block;
      font-size: 10.5px;
      color: #6b7280;
      margin-top: 2px;
    }
    .kpi-blue { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .kpi-green { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }
    .kpi-amber { background: #fffbeb; border-color: #fde68a; color: #92400e; }
    .kpi-purple { background: #faf5ff; border-color: #e9d5ff; color: #6b21a8; }
    .table-container {
      overflow-x: auto;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      margin-bottom: 24px;
    }
    table.report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    table.report-table th {
      background-color: #0c2340;
      color: #ffffff;
      padding: 10px 8px;
      font-weight: bold;
      border: 1px solid #1f2937;
      white-space: nowrap;
    }
    table.report-table td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }
    table.report-table tr:hover {
      background-color: #fffbeb;
    }
    table.report-table tfoot tr {
      background-color: #f3f4f6;
      font-weight: bold;
      border-top: 2px solid #9ca3af;
    }
    .badge-paid {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: bold;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #6ee7b7;
    }
    .badge-pending {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: bold;
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fcd34d;
    }
    .remarks-block {
      font-size: 12.5px;
      line-height: 1.8;
      color: #1f2937;
      margin-bottom: 28px;
    }
    .remarks-block p {
      margin-bottom: 6px;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .sig-role {
      font-family: 'Moul', cursive, serif;
      font-size: 13px;
      color: #0c2340;
      margin-top: 4px;
    }
    .sig-space {
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-style: italic;
      font-size: 12px;
    }
    .cc-block {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
    }
    .cc-list {
      display: flex;
      gap: 24px;
      margin-top: 4px;
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .page-sheet {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      @page {
        size: A4 portrait;
        margin: 10mm 10mm 12mm 10mm;
      }
      body.page-landscape {
        @page {
          size: A4 landscape;
          margin: 10mm 10mm 12mm 10mm;
        }
      }
      .table-container {
        overflow: visible !important;
        border: none !important;
        border-radius: 0 !important;
        margin-bottom: 12px !important;
      }
      table.report-table {
        width: 100% !important;
        table-layout: fixed !important;
        font-size: 9.5px !important;
        border-collapse: collapse !important;
        border: 1px solid #1f2937 !important;
      }
      table.report-table th, table.report-table td {
        padding: 4px 4px !important;
        border: 1px solid #4b5563 !important;
        word-break: break-word !important;
        white-space: normal !important;
      }
      table.report-table th {
        background-color: #0c2340 !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      thead {
        display: table-header-group !important;
      }
      tfoot {
        display: table-footer-group !important;
      }
      tr {
        page-break-inside: avoid !important;
      }
      .kpi-grid {
        gap: 6px !important;
        margin-bottom: 14px !important;
      }
      .kpi-card {
        padding: 6px 4px !important;
        border: 1px solid #9ca3af !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .kpi-card .kpi-label { font-size: 9.5px !important; }
      .kpi-card .kpi-val { font-size: 14px !important; }
      .kpi-card .kpi-sub { font-size: 8.5px !important; }
      .directives-box {
        padding: 8px 12px !important;
        margin-bottom: 12px !important;
        font-size: 10.5px !important;
        border: 1px solid #9ca3af !important;
      }
      .remarks-block {
        margin-bottom: 14px !important;
        font-size: 10.5px !important;
      }
      .signatures-grid {
        page-break-inside: avoid !important;
        padding-top: 10px !important;
      }
      .sig-space {
        height: 60px !important;
      }
      .cc-block {
        margin-top: 10px !important;
        page-break-inside: avoid !important;
      }
    }
  </style>
  <script>
    function toggleOrientation() {
      var body = document.body;
      var btn = document.getElementById('btnOrientation');
      if (body.classList.contains('page-landscape')) {
        body.classList.remove('page-landscape');
        btn.innerHTML = '<span>🔄 ក្រដាស: បញ្ឈរ (Portrait)</span>';
      } else {
        body.classList.add('page-landscape');
        btn.innerHTML = '<span>🔄 ក្រដាស: បដេក (Landscape)</span>';
      }
    }
    function handleBackNavigation() {
      if (window.opener && !window.opener.closed) {
        window.close();
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/admin';
      }
    }
  </script>
</head>
<body>

  <!-- Printable Action Bar (Hidden in Print) -->
  <div class="action-bar no-print">
    <div class="action-bar-left">
      <button onclick="handleBackNavigation()" class="btn btn-back" title="ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រងរដ្ឋបាល">
        <span>⬅️ ត្រឡប់ក្រោយ (Back to PMS)</span>
      </button>
      <img src="/images/vvotel-logo.png?v=2" alt="Logo" class="report-logo" style="width: 40px !important; height: 40px !important; max-width: 40px !important; max-height: 40px !important; object-fit: contain !important;" onerror="this.onerror=null;this.src='/icons/icon-192.png?v=2';" />
      <div>
        <h3 class="font-siemreap" style="font-size: 13px; font-weight: bold; color: #0c2340;">របាយការណ៍រដ្ឋបាលផ្លូវការ (Administrative Report)</h3>
        <p style="font-size: 11.5px; color: #6b7280;">សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • ប្រព័ន្ធកណ្តាល PMS</p>
      </div>
    </div>
    <div class="action-bar-right">
      <button type="button" onclick="toggleOrientation()" id="btnOrientation" class="btn btn-orientation" title="ប្តូរទម្រង់ក្រដាសរវាងបញ្ឈរ និងបដេក">
        <span>🔄 ក្រដាស: បញ្ឈរ (Portrait)</span>
      </button>
      <button type="button" onclick="window.print()" class="btn btn-print">
        <span>🖨️ បោះពុម្ព / រក្សាទុកជា PDF</span>
      </button>
      <a href="/api/reports?format=docx&period=${period}" class="btn btn-docx">
        <span>📄 Word (.docx)</span>
      </a>
      <a href="/api/reports?format=excel&period=${period}" class="btn btn-excel">
        <span>📊 Excel (.xlsx)</span>
      </a>
      <a href="/api/reports?format=csv&period=${period}" class="btn btn-csv">
        <span>📑 CSV (.csv)</span>
      </a>
    </div>
  </div>

  <!-- A4 Official Administrative Page Document -->
  <div class="page-sheet">
    
    <!-- 1. Royal Kingdom Motto: TOP CENTER -->
    <div class="top-header">
      <h1>ព្រះរាជាណាចក្រកម្ពុជា</h1>
      <h2>ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
      <div class="symbols">❖ ❖ ❖</div>
    </div>

    <!-- 2. Hotel on Left & Date on Right on the SAME HORIZONTAL LINE -->
    <div class="org-date-row">
      <!-- Left: Organization & Ref Number with Official Logo -->
      <div class="org-info">
        <img src="/images/vvotel-logo.png?v=2" alt="VVotel Logo" class="report-logo" style="width: 48px !important; height: 48px !important; max-width: 48px !important; max-height: 48px !important; object-fit: contain !important; display: block;" onerror="this.onerror=null;this.src='/icons/icon-192.png?v=2';" />
        <div>
          <h2>សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម</h2>
          <p><strong>ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ</strong></p>
          <p>លេខ: ០២៤/២៦ វវ.កច</p>
        </div>
      </div>

      <!-- Right: Date aligned horizontally on the same line as hotel name -->
      <div class="date-info">
        ${dateInfo.standardHeaderDate}
      </div>
    </div>

    <!-- Official Report Title -->
    <div class="report-title-block">
      <h1>${periodInfo.periodLabelKm}</h1>
      <h2>ស្តីពី ប្រតិបត្តិការអាជីវកម្មស្នាក់នៅ និងភោជនីយដ្ឋាន</h2>
      <div class="date-badge">
        ${periodInfo.dateRangeText}
      </div>
    </div>

    <!-- Administrative Directives -->
    <div class="directives-box">
      <p><strong>គោរពជូន:</strong> ឯកឧត្តម/លោកជំទាវ/លោក-លោកស្រី អគ្គនាយកសណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម</p>
      <p><strong>កម្មវត្ថុ:</strong> របាយការណ៍បូកសរុបទិន្នន័យភ្ញៀវកក់បន្ទប់ស្នាក់នៅ ការកក់តុអាហារ ស្ថានភាពចំណូល និងប្រតិបត្តិការអាជីវកម្មសរុប។</p>
      <p><strong>យោង:</strong> ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារកណ្តាល VVotel PMS Cloud Database & ALL Accor Interface។</p>
      <p class="directives-intro">
        សេចក្តីដូចបានជម្រាបជូនក្នុងកម្មវត្ថុ និងយោងខាងលើ ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ នៃសណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម មានកិត្តិយសសូមគោរពជម្រាបជូននូវរបាយការណ៍បូកសរុបប្រតិបត្តិការ និងស្ថិតិលម្អិតដូចខាងក្រោម៖
      </p>
    </div>

    <!-- Section I: KPI Cards Summary -->
    <div style="margin-bottom: 24px;">
      <h3 class="section-title">I. តារាងស្ថិតិសង្ខេបប្រតិបត្តិការ (Executive Operational Summary)</h3>
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <span class="kpi-label">ការកក់សរុប</span>
          <span class="kpi-val">${toKhmerNum(metrics.totalBookings)}</span>
          <span class="kpi-sub">បន្ទប់ ${toKhmerNum(metrics.roomBookings)} | តុ ${toKhmerNum(metrics.diningBookings)}</span>
        </div>
        <div class="kpi-card kpi-green">
          <span class="kpi-label">កំពុងស្នាក់នៅ (In-House)</span>
          <span class="kpi-val">${toKhmerNum(metrics.inHouseCount)}</span>
          <span class="kpi-sub">ភ្ញៀវសកម្ម</span>
        </div>
        <div class="kpi-card kpi-amber">
          <span class="kpi-label">ចំណូលសរុប ($ USD)</span>
          <span class="kpi-val">$${metrics.totalPaidUSD.toFixed(2)}</span>
          <span class="kpi-sub">ទូទាត់រួចរាល់</span>
        </div>
        <div class="kpi-card kpi-purple">
          <span class="kpi-label">ចំណូលសរុប (៛ KHR)</span>
          <span class="kpi-val" style="font-size: 15px;">${toKhmerNum(metrics.totalPaidKHR.toLocaleString())} ៛</span>
          <span class="kpi-sub">អត្រា ៤,១០០ ៛</span>
        </div>
      </div>
    </div>

    <!-- Section II: Detailed Table -->
    <div style="margin-bottom: 24px;">
      <h3 class="section-title">II. តារាងបញ្ជីលម្អិតនៃប្រតិបត្តិការ (Detailed Operational Records)</h3>
      <div class="table-container">
        <table class="report-table">
          <thead>
            <tr>
              <th style="text-align: center; width: 4.5%;">ល.រ</th>
              <th style="width: 13.5%;">កូដកក់</th>
              <th style="width: 17%;">ឈ្មោះភ្ញៀវ</th>
              <th style="width: 19%;">សេវាកម្ម / បន្ទប់</th>
              <th style="text-align: center; width: 11%;">កាលបរិច្ឆេទ</th>
              <th style="text-align: center; width: 9%;">ការទូទាត់</th>
              <th style="text-align: center; width: 9%;">ស្ថានភាព</th>
              <th style="text-align: right; width: 8%;">($)</th>
              <th style="text-align: right; width: 9%;">(៛)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="7" style="text-align: right; padding: 10px; font-weight: bold; font-family: 'Siemreap', sans-serif;">សរុបរួម (GRAND TOTAL):</td>
              <td style="text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; color: #0c2340;">$${metrics.totalPaidUSD.toFixed(2)}</td>
              <td style="text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; color: #111827;">${toKhmerNum(metrics.totalPaidKHR.toLocaleString())} ៛</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Section III: Administrative Conclusions -->
    <div class="remarks-block">
      <h3 class="section-title">III. ការសន្និដ្ឋាន និងសំណូមពរ (Administrative Conclusion & Remarks)</h3>
      <p>១. ប្រតិបត្តិការទទួលភ្ញៀវស្នាក់នៅ និងភោជនីយដ្ឋានប្រព្រឹត្តទៅដោយរលូន ស្របតាមបទដ្ឋានសេវាកម្មលំដាប់ផ្កាយ ៥ និងក្រមសីលធម៌វិជ្ជាជីវៈខ្ពស់។</p>
      <p>២. ប្រព័ន្ធទូទាត់ប្រាក់ឌីជីថល Bakong KHQR និង Card 3DS ធានាសុវត្ថិភាពប្រតិបត្តិការ ១០០% ការពារហានិភ័យ និងគ្មានការក្លែងបន្លំ។</p>
      <p>៣. ទិន្នន័យប្រតិបត្តិការទាំងអស់ត្រូវបានកត់ត្រា និងធ្វើសមកាលកម្មស្វ័យប្រវត្តិក្នងប្រព័ន្ធកណ្តាល VVotel PMS និង Telegram Real-time Bot (@vvotel_bot)។</p>
    </div>

    <!-- Signatures and Official Stamp Blocks -->
    <div class="signatures-grid">
      <!-- Left Signature: Chief Accountant -->
      <div>
        <p style="font-weight: bold; font-size: 12px; color: #374151;">បានឃើញ និងឯកភាព</p>
        <p class="sig-role">ប្រធានផ្នែកគណនេយ្យ និងហិរញ្ញវត្ថុ</p>
        <div class="sig-space">
          ( ហត្ថលេខា និងត្រា )
        </div>
      </div>

      <!-- Right Signature: Report Compiler -->
      <div>
        <p style="font-size: 12px; color: #4b5563;">${dateInfo.standardHeaderDate}</p>
        <p class="sig-role">អ្នកធ្វើតារាងរបាយការណ៍</p>
        <div class="sig-space">
          ( ហត្ថលេខា និងត្រា )
        </div>
      </div>
    </div>

    <!-- Bottom CC -->
    <div class="cc-block">
      <strong>កន្លែងទទួល (CC):</strong>
      <div class="cc-list">
        <span>- ក្រុមប្រឹក្សាភិបាល</span>
        <span>- នាយកដ្ឋានគ្រប់គ្រងទូទៅ</span>
        <span>- ឯកសារ-កាលប្បវត្ត</span>
      </div>
    </div>

  </div>
</body>
</html>
  `;
}
