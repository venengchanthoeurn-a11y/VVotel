import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate limiting: max 5 newsletter attempts per minute per IP
    const rateCheck = await checkRateLimit(`newsletter:${ip}`, 5, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: `Too many subscription attempts. Please wait ${rateCheck.resetSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").toString().trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Valid email address is required (ឧ. example@domain.com)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: {
        en: "Thank you for subscribing to VVotel Kampong Cham exclusive offers!",
        km: "អរគុណសម្រាប់ការជាវព្រឹត្តិបត្រព័ត៌មាន និងការផ្តល់ជូនពិសេសពី វីវ៉ូថែល កំពង់ចាម!",
      },
      email,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
