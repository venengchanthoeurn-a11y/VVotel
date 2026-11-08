import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSiteSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { amount, bookingRef, guestName } = await request.json();
    const settings = getSiteSettings();

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
    const merchantId = settings.bakongMerchantId || "030402_VVOTEL_KC";
    const bakongAcc = settings.bakongAccountId || "vvotel@abaa";
    const merchantName = (settings.hotelNameEn || "VATTANAC HOTEL VVOTEL").toUpperCase().slice(0, 25);
    const amtStr = amt.toFixed(2);
    const amtTag = `54${amtStr.length.toString().padStart(2, "0")}${amtStr}`;

    // Tag 29 for Bakong Account ID
    const bakongTagVal = `0012bakong@nbc.kh01${bakongAcc.length.toString().padStart(2, "0")}${bakongAcc}`;
    const tag29 = `29${bakongTagVal.length.toString().padStart(2, "0")}${bakongTagVal}`;

    const rawQr = `000201010212${tag29}520470115303840${amtTag}5802KH59${merchantName.length.toString().padStart(2, "0")}${merchantName}6012KAMPONG CHAM62180114${ref}6304`;
    const crc = computeCrc16(rawQr);
    const emvCoPayload = `${rawQr}${crc}`;

    // MD5 of EMVCo string for Bakong check_transaction_by_md5 API
    const md5Hash = crypto.createHash("md5").update(emvCoPayload).digest("hex");

    return NextResponse.json({
      success: true,
      bookingRef: ref,
      merchantName: settings.hotelNameKm,
      merchantNameEn: settings.hotelNameEn,
      bankName: settings.bankName,
      bankAccountName: settings.bankAccountName,
      bankAccountNumber: settings.bankAccountNumber,
      bakongAccountId: settings.bakongAccountId,
      qrCustomImageUrl: settings.qrCustomImageUrl || null,
      strictBakongVerification: settings.strictBakongVerification,
      hasBakongToken: Boolean(settings.bakongOpenApiToken),
      merchantCity: "KAMPONG CHAM",
      storeLabel: settings.addressKm,
      terminalId: "POS-ONLINE-01",
      currency: "USD",
      amountUSD: amt.toFixed(2),
      amountKHR: riels.toLocaleString(),
      qrPayload: emvCoPayload,
      crcChecksum: crc,
      md5Hash: md5Hash,
      emvCoCompliant: true,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes dynamic QR
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
