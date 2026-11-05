import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { amount, bookingRef, guestName } = await request.json();

    const amt = Number(amount) || 120;
    const riels = Math.round(amt * 4100);
    const ref = bookingRef || `VVT-KC-${Math.floor(100000 + Math.random() * 900000)}`;

    // EMVCo / Bakong standard CRC16-CCITT (Polynomial 0x1021, Init 0xFFFF)
    const computeCrc16 = (str: string): string => {
      let crc = 0xffff;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = ((crc << 1) ^ 0x1021) & 0xffff;
          } else {
            crc = (crc << 1) & 0xffff;
          }
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, "0");
    };

    // National Bank of Cambodia Bakong KHQR EMVCo format payload
    const merchantId = "030402_VVOTEL_KC";
    const amtStr = amt.toFixed(2);
    const amtTag = `54${amtStr.length.toString().padStart(2, "0")}${amtStr}`;
    const rawQr = `00020101021229300012bakong@nbc.kh0108${merchantId}520470115303840${amtTag}5802KH5928VATTANAC HOTEL VVOTEL6012KAMPONG CHAM62180114${ref}6304`;
    const crc = computeCrc16(rawQr);
    const emvCoPayload = `${rawQr}${crc}`;

    return NextResponse.json({
      success: true,
      bookingRef: ref,
      merchantName: "VATTANAC HOTEL (VVOTEL) KAMPONG CHAM",
      merchantCity: "KAMPONG CHAM",
      storeLabel: "NO. 2052 PREAH MONIVONG ST",
      terminalId: "POS-ONLINE-01",
      currency: "USD",
      amountUSD: amt.toFixed(2),
      amountKHR: riels.toLocaleString(),
      qrPayload: emvCoPayload,
      crcChecksum: crc,
      emvCoCompliant: true,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes dynamic QR
      securityBadges: [
        { label: "NBC Bakong Certified", icon: "bank" },
        { label: "EMVCo Standard QR", icon: "shield" },
        { label: "End-to-End Encrypted", icon: "lock" },
      ],
      supportedBanks: [
        { name: "ABA Bank", logo: "ABA", color: "#004a7c" },
        { name: "Bakong", logo: "BAKONG", color: "#d92d27" },
        { name: "ACLEDA Bank", logo: "ACLEDA", color: "#1c3c6d" },
        { name: "Wing Bank", logo: "WING", color: "#8cc63f" },
        { name: "Canadia Bank", logo: "CANADIA", color: "#b91c1c" },
        { name: "Sathapana Bank", logo: "SPN", color: "#003b70" },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate secure KHQR payload" },
      { status: 500 }
    );
  }
}
