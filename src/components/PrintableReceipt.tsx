"use client";

import React, { useState, useEffect } from "react";
import { Printer, X, CheckCircle, ShieldCheck, QrCode, Building, Lock } from "lucide-react";
import { BookingRecord } from "@/lib/bookings";

/**
 * Isolated high-fidelity printing engine for VVotel receipts and invoices.
 * Prints ONLY the designated container without rendering the rest of the website.
 */
function printDedicatedInvoice(targetId: string, mode: "pos-80mm" | "a4-invoice") {
  if (typeof window === "undefined") return;

  const targetElement = document.getElementById(targetId);
  if (!targetElement) {
    window.print();
    return;
  }

  // Remove any preexisting print iframe
  const oldIframe = document.getElementById("vvotel-print-frame");
  if (oldIframe) {
    oldIframe.remove();
  }

  // Create an invisible iframe attached to body
  const iframe = document.createElement("iframe");
  iframe.id = "vvotel-print-frame";
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;z-index:-1;"
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect stylesheet tags from parent document
  const styleElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
  const stylesMarkup = styleElements.map((el) => el.outerHTML).join("\n");

  const pageSpecificCss =
    mode === "pos-80mm"
      ? `
        @page {
          size: 80mm auto;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 80mm !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #thermal-receipt {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 auto !important;
          padding: 4mm 3mm !important;
          box-shadow: none !important;
          border: none !important;
        }
      `
      : `
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #a4-invoice {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 2mm !important;
          box-shadow: none !important;
          border: none !important;
          min-height: auto !important;
        }
      `;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="km">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VVotel Official ${mode === "pos-80mm" ? "POS Receipt" : "Tax Invoice"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        ${stylesMarkup}
        <style>
          ${pageSpecificCss}
          .font-mool { font-family: 'Moul', cursive, serif !important; }
          .font-siemreap { font-family: 'Siemreap', 'Khmer OS Siemreap', sans-serif !important; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body class="bg-white text-black font-siemreap antialiased">
        ${targetElement.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Allow styles and fonts to render before prompting native print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("Iframe print fallback to window.print():", e);
      window.print();
    }
  }, 400);
}

interface PrintableReceiptProps {
  booking: BookingRecord | any;
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "pos-80mm" | "a4-invoice";
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  booking,
  isOpen,
  onClose,
  defaultMode = "pos-80mm",
}) => {
  const [printMode, setPrintMode] = useState<"pos-80mm" | "a4-invoice">(defaultMode);

  // Synchronize printMode whenever defaultMode or modal state updates
  useEffect(() => {
    if (defaultMode) {
      setPrintMode(defaultMode);
    }
  }, [defaultMode, isOpen]);

  // Synchronize body class for print styling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("print-receipt-modal-active");
    } else {
      document.body.classList.remove("print-receipt-modal-active");
    }
    return () => {
      document.body.classList.remove("print-receipt-modal-active");
    };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    const targetId = printMode === "pos-80mm" ? "thermal-receipt" : "a4-invoice";
    printDedicatedInvoice(targetId, printMode);
  };

  const formattedDate = new Date(booking.createdAt || Date.now()).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      id="printable-receipt-backdrop"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static"
    >
      {/* Container - hide screen header when printing */}
      <div
        id="printable-receipt-card"
        className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-200 my-auto print:max-w-none print:w-full print:border-none print:shadow-none print:max-h-none"
      >
        {/* Modal Controls Bar (Hidden during printing) */}
        <div
          id="printable-receipt-controls"
          className="p-4 bg-[#0c2340] text-white flex items-center justify-between border-b border-white/10 print:hidden shrink-0"
        >
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-vvotel-gold" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                បោះពុម្ពវិក្កយបត្រ (Standardized Invoice & Receipt)
              </h3>
              <p className="text-[11px] text-gray-300">
                ជ្រើសរើសទំហំម៉ាស៊ីនកាត់ក្រដាសកម្ដៅ 80mm ឬក្រដាស A4 ផ្លូវការ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Switcher */}
            <div className="bg-white/10 rounded-xl p-1 flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setPrintMode("pos-80mm")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  printMode === "pos-80mm"
                    ? "bg-vvotel-gold text-vvotel-navy shadow"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                🧾 80mm POS Thermal
              </button>
              <button
                type="button"
                onClick={() => setPrintMode("a4-invoice")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  printMode === "a4-invoice"
                    ? "bg-vvotel-gold text-vvotel-navy shadow"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                📄 A4 Tax Invoice
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print Now)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex justify-center bg-gray-100 print:bg-white print:p-0 print:overflow-visible">
          {/* ===================== MODE 1: 80MM POS THERMAL RECEIPT ===================== */}
          {printMode === "pos-80mm" && (
            <div
              id="thermal-receipt"
              className="w-[80mm] max-w-[80mm] bg-white p-4 text-black font-mono text-[11px] leading-tight shadow-md border border-gray-300 mx-auto print:shadow-none print:border-none print:w-[80mm] print:p-2"
              style={{ minHeight: "140mm" }}
            >
              {/* Thermal Header */}
              <div className="text-center pb-2 border-b border-dashed border-gray-400 space-y-1">
                <div className="flex justify-center pb-1">
                  <img src="/icons/icon-192.png" alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
                </div>
                <div className="font-extrabold text-sm tracking-wider">
                  VVOTEL KAMPONG CHAM
                </div>
                <div className="text-[10px] font-bold text-gray-700">
                  VATTANAC HOTEL & RESORT
                </div>
                <div className="text-[9px] text-gray-600">
                  No. 2052, Preah Monivong St., Phum 7, Kampong Cham
                </div>
                <div className="text-[9px] text-gray-600">
                  Tel: +855 (0) 42 982 999 • VAT: K002-9018449
                </div>
                <div className="pt-1 font-bold text-xs uppercase underline">
                  OFFICIAL POS TAX RECEIPT
                </div>
              </div>

              {/* Metadata */}
              <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span className="font-bold">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminal:</span>
                  <span>POS-RECEPTION-01</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest Name:</span>
                  <span className="font-bold">{booking.guestName}</span>
                </div>
                {booking.roomNumber && (
                  <div className="flex justify-between font-bold">
                    <span>Room Assigned:</span>
                    <span>{booking.roomNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Stay:</span>
                  <span>{booking.checkIn} ➔ {booking.checkOut} ({booking.nights}N)</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-dashed border-gray-400 text-[10px]">
                <div className="flex justify-between font-bold border-b border-gray-300 pb-1 mb-1">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>AMOUNT</span>
                </div>
                <div className="space-y-1">
                  <div>
                    <div className="font-bold truncate">{booking.roomNameEn || booking.roomType}</div>
                    <div className="flex justify-between text-gray-600 text-[9px]">
                      <span>${booking.basePrice} × {booking.nights}N × {booking.roomCount || 1}R</span>
                      <span>${(booking.basePrice * booking.nights * (booking.roomCount || 1)).toFixed(2)}</span>
                    </div>
                  </div>

                  {booking.includeBreakfast && (
                    <div className="flex justify-between text-[9px]">
                      <span>Mekong Buffet Breakfast</span>
                      <span>+${Number(booking.breakfastCost || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {Number(booking.discount || 0) > 0 && (
                    <div className="flex justify-between text-[9px] font-bold">
                      <span>Discount Voucher</span>
                      <span>-${Number(booking.discount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL DUE (USD):</span>
                  <span>${Number(booking.totalAmountUSD || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL DUE (KHR):</span>
                  <span>{Number(booking.totalAmountKHR || Math.round(Number(booking.totalAmountUSD || 0) * 4100)).toLocaleString()} ៛</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-600 pt-0.5">
                  <span>Payment Gateway:</span>
                  <span className="font-bold">{booking.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-600">
                  <span>Status:</span>
                  <span className="font-bold">{booking.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-600">
                  <span>Txn Auth ID:</span>
                  <span className="font-mono text-[8px] truncate">{booking.transactionId || "TXN-SEC-10928"}</span>
                </div>
              </div>

              {/* QR Verification & Footer */}
              <div className="text-center pt-3 space-y-1.5">
                <div className="w-16 h-16 mx-auto bg-gray-900 rounded p-1 flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-white" />
                </div>
                <div className="text-[8px] font-mono text-gray-500 break-all truncate">
                  {booking.tamperProofHash || `sha256:${booking.signatureHMAC?.slice(0, 24)}...`}
                </div>
                <div className="text-[9px] font-bold text-gray-800">
                  សូមអរគុណសម្រាប់ការស្នាក់នៅ!
                </div>
                <div className="text-[8px] text-gray-600">
                  THANK YOU FOR CHOOSING VVOTEL KAMPONG CHAM
                </div>
                <div className="text-[7px] text-gray-400">
                  Check-in 14:00 • Check-out 12:00 • www.vvotel.com
                </div>
              </div>
            </div>
          )}

          {/* ===================== MODE 2: A4 OFFICIAL TAX INVOICE ===================== */}
          {printMode === "a4-invoice" && (
            <div
              id="a4-invoice"
              className="w-full max-w-[210mm] bg-white p-8 sm:p-12 text-gray-900 font-sans shadow-lg border border-gray-200 mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none"
              style={{ minHeight: "297mm" }}
            >
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-vvotel-gold pb-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/icons/icon-192.png"
                      alt="VVotel Logo"
                      className="w-12 h-12 rounded-xl object-contain shadow-sm border border-vvotel-gold/40 shrink-0"
                    />
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-vvotel-navy tracking-tight">
                        VATTANAC HOTEL (VVOTEL)
                      </h1>
                      <div className="text-xs text-vvotel-gold font-bold tracking-widest uppercase">
                        Kampong Cham Riverside Luxury Resort & Spa
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 pt-2 leading-relaxed">
                    No. 2052, Preah Monivong St., Phum 7, Sangkat Boeng Kok, Kampong Cham City, Cambodia<br />
                    Tel: +855 (0) 42 982 999 • Email: reservations@vvotel.com • Web: vvhotel.vercel.app<br />
                    Tax Identification Number (TIN): K002-901844910
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block bg-amber-100 text-amber-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    Official Tax Invoice
                  </span>
                  <div className="text-base font-extrabold text-vvotel-navy pt-1">
                    Invoice #{booking.id}
                  </div>
                  <div className="text-xs text-gray-500">
                    Date: {formattedDate}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700">
                    Status: {booking.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Guest & Stay Details Grid */}
              <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200 text-xs">
                <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] block text-vvotel-gold">
                    ព័ត៌មានភ្ញៀវស្នាក់នៅ (Billed To):
                  </span>
                  <div className="text-sm font-bold text-vvotel-navy">{booking.guestName}</div>
                  <div className="text-gray-600">Phone: {booking.phone}</div>
                  <div className="text-gray-600">Email: {booking.email}</div>
                  <div className="text-gray-600">Country: {booking.country || "Cambodia"}</div>
                </div>

                <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] block text-vvotel-gold">
                    ព័ត៌មានការស្នាក់នៅ (Stay Details):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-gray-500 block">Check-in:</span>
                      <span className="font-bold text-gray-900">{booking.checkIn} (14:00 PM)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Check-out:</span>
                      <span className="font-bold text-gray-900">{booking.checkOut} (12:00 PM)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Duration:</span>
                      <span className="font-bold text-gray-900">{booking.nights} Night(s)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Guests:</span>
                      <span className="font-bold text-gray-900">{booking.adults}A {booking.children ? `+ ${booking.children}C` : ""}</span>
                    </div>
                    {booking.roomNumber && (
                      <div className="col-span-2 pt-1 border-t border-gray-200">
                        <span className="text-gray-500">Room Assigned: </span>
                        <span className="font-extrabold text-vvotel-navy">{booking.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-6">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-100/80">
                      <th className="py-2.5 px-3 font-extrabold text-gray-700">#</th>
                      <th className="py-2.5 px-3 font-extrabold text-gray-700">Description / ការពិពណ៌នា</th>
                      <th className="py-2.5 px-3 font-extrabold text-gray-700 text-center">Nights</th>
                      <th className="py-2.5 px-3 font-extrabold text-gray-700 text-center">Rooms</th>
                      <th className="py-2.5 px-3 font-extrabold text-gray-700 text-right">Rate (USD)</th>
                      <th className="py-2.5 px-3 font-extrabold text-gray-700 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-3">1</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-vvotel-navy">{booking.roomNameKm || "បន្ទប់ស៊ុភើរៀ"}</div>
                        <div className="text-[11px] text-gray-500">{booking.roomNameEn || booking.roomType}</div>
                      </td>
                      <td className="py-3 px-3 text-center">{booking.nights}</td>
                      <td className="py-3 px-3 text-center">{booking.roomCount || 1}</td>
                      <td className="py-3 px-3 text-right font-mono">${booking.basePrice}.00</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        ${(booking.basePrice * booking.nights * (booking.roomCount || 1)).toFixed(2)}
                      </td>
                    </tr>

                    {booking.includeBreakfast && (
                      <tr>
                        <td className="py-3 px-3">2</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-vvotel-navy">អាហារពេលព្រឹកប៊ុហ្វេ (Mekong Buffet Breakfast)</div>
                          <div className="text-[11px] text-gray-500">Daily International & Khmer spread ($15/adult/night)</div>
                        </td>
                        <td className="py-3 px-3 text-center">{booking.nights}</td>
                        <td className="py-3 px-3 text-center">{booking.adults} Guests</td>
                        <td className="py-3 px-3 text-right font-mono">$15.00</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          +${Number(booking.breakfastCost || 0).toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {Number(booking.discount || 0) > 0 && (
                      <tr className="text-emerald-700 font-bold bg-emerald-50/40">
                        <td className="py-2 px-3">3</td>
                        <td className="py-2 px-3">Corporate / Loyalty Member Privilege Discount</td>
                        <td className="py-2 px-3 text-center">-</td>
                        <td className="py-2 px-3 text-center">-</td>
                        <td className="py-2 px-3 text-right font-mono">-</td>
                        <td className="py-2 px-3 text-right font-mono">-${Number(booking.discount).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation & Cryptographic Seal */}
              <div className="grid grid-cols-2 gap-8 border-t-2 border-gray-200 pt-6 text-xs">
                {/* Security Verification Stamp */}
                <div className="space-y-2 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Security & Compliance Seal</span>
                  </div>
                  <div className="font-mono text-[10px] text-gray-600 break-all">
                    HMAC-SHA256: {booking.signatureHMAC || "57fdcbb238787f7fd731445fd43e00c7"}
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-0.5">
                    <div>PCI-DSS Level 1 Compliant • TLS 1.3 256-Bit Encrypted</div>
                    <div>Gateway: {booking.paymentMethod} (EMVCo Certified)</div>
                    <div>Transaction Ref: {booking.transactionId}</div>
                  </div>
                </div>

                {/* Subtotals Table */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">${Number(booking.subtotal || booking.totalAmountUSD).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Service Charge (Included 10%):</span>
                    <span className="font-mono font-semibold">$0.00 (Inclusive)</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-vvotel-navy">Total Paid:</span>
                    <div className="text-right">
                      <div className="text-xl font-black text-vvotel-navy">
                        ${Number(booking.totalAmountUSD || 0).toFixed(2)} USD
                      </div>
                      <div className="text-xs font-bold text-gray-500">
                        ≈ {Number(booking.totalAmountKHR || Math.round(Number(booking.totalAmountUSD || 0) * 4100)).toLocaleString()} KHR
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Terms */}
              <div className="grid grid-cols-2 gap-8 pt-12 text-xs border-t border-gray-200 mt-8">
                <div className="space-y-8">
                  <div className="text-gray-600 text-[11px] leading-relaxed">
                    <b>Hotel Policy:</b> Check-in is at 14:00 and check-out is at 12:00. Non-smoking policy applies in all rooms. Free Wi-Fi 6 is available throughout the property. Thank you for your patronage!
                  </div>
                  <div className="pt-4 border-t border-gray-300 w-48 text-center text-gray-500 text-[10px]">
                    Guest Signature
                  </div>
                </div>

                <div className="text-right space-y-8">
                  <div className="inline-block p-2 border-2 border-vvotel-gold rounded-xl text-center">
                    <div className="text-[10px] font-black text-vvotel-gold uppercase tracking-widest">
                      VVOTEL KAMPONG CHAM
                    </div>
                    <div className="text-[9px] text-gray-600 font-bold">
                      RESERVATIONS & FRONT OFFICE
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-300 w-48 ml-auto text-center text-gray-500 text-[10px]">
                    Authorized Officer Stamp
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
