import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
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
