import fs from "fs";
import path from "path";

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "9278143321:AAE73YdgWRNZQzwjBUZ1v7Lt4MdXmhGNImk";
export const TELEGRAM_BOT_USERNAME = "vvotel_bot";

const CHATS_FILE = path.join(process.cwd(), "data", "telegram_chats.json");

interface TelegramStorage {
  chatIds: (string | number)[];
  lastUpdateId: number;
  updatedAt: string;
}

const getStorage = (): TelegramStorage => {
  try {
    if (fs.existsSync(CHATS_FILE)) {
      const raw = fs.readFileSync(CHATS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading telegram_chats.json", e);
  }
  return { chatIds: [], lastUpdateId: 0, updatedAt: new Date().toISOString() };
};

const saveStorage = (data: TelegramStorage) => {
  try {
    const dir = path.dirname(CHATS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHATS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving telegram_chats.json", e);
  }
};

/**
 * Polls Telegram getUpdates to automatically register any admin or user
 * who started a chat or sent a message to @vvotel_bot
 */
export async function syncTelegramChatIds(): Promise<(string | number)[]> {
  const storage = getStorage();
  try {
    const offset = storage.lastUpdateId > 0 ? storage.lastUpdateId + 1 : 0;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      let maxUpdateId = storage.lastUpdateId;
      const currentIds = new Set(storage.chatIds.map(String));

      for (const update of data.result) {
        if (update.update_id > maxUpdateId) {
          maxUpdateId = update.update_id;
        }
        const chatId =
          update.message?.chat?.id ||
          update.channel_post?.chat?.id ||
          update.my_chat_member?.chat?.id;

        if (chatId) {
          const strId = String(chatId);
          if (!currentIds.has(strId)) {
            currentIds.add(strId);
            storage.chatIds.push(chatId);
          }
        }
      }

      storage.lastUpdateId = maxUpdateId;
      storage.updatedAt = new Date().toISOString();
      saveStorage(storage);
    }
  } catch (error) {
    console.error("Failed to sync Telegram chat IDs:", error);
  }

  return storage.chatIds;
}

/**
 * Send an executive HTML notification to all registered admins via @vvotel_bot
 */
export async function sendTelegramBookingAlert(booking: any): Promise<{
  success: boolean;
  deliveredCount: number;
  error?: string;
}> {
  // Sync latest chats
  const chatIds = await syncTelegramChatIds();

  // If no chat IDs found yet, check environment fallback
  const fallbackChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const targetChats = Array.from(
    new Set([...chatIds.map(String), ...(fallbackChatId ? [fallbackChatId] : [])])
  );

  const formattedAmountUSD = Number(booking.totalAmountUSD || booking.amountUSD || 0).toFixed(2);
  const formattedAmountKHR = Number(
    booking.totalAmountKHR || booking.amountKHR || Math.round(Number(formattedAmountUSD) * 4100)
  ).toLocaleString();

  const messageHtml = `
🔔 <b>ដំណឹងកក់បន្ទប់ថ្មី / NEW BOOKING ALERT</b>
🏨 <b>VATTANAC HOTEL (VVOTEL) KAMPONG CHAM</b>
━━━━━━━━━━━━━━━━━━━━
🔖 <b>លេខកូដកក់ (Ref):</b> <code>#${booking.id || booking.bookingRef}</code>
👤 <b>ឈ្មោះភ្ញៀវ (Guest):</b> <b>${booking.guestName || `${booking.firstName || ""} ${booking.lastName || ""}`.trim() || "Sopheap Chan"}</b>
📞 <b>លេខទូរស័ព្ទ (Phone):</b> <code>${booking.phone || "+855 12 345 678"}</code>
📧 <b>អ៊ីមែល (Email):</b> ${booking.email || "guest@vvotel.com"}

🛏️ <b>ប្រភេទបន្ទប់:</b> ${booking.roomNameKm || "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ"} (${booking.roomCount || 1} បន្ទប់)
📅 <b>កាលបរិច្ឆេទ:</b> ${booking.checkIn} ➔ ${booking.checkOut} (${booking.nights || 1} យប់)
⏰ <b>ម៉ោងចូលស្នាក់នៅ (Check-in):</b> ${booking.checkInTime || "14:00 (រសៀល)"}
⏰ <b>ម៉ោងចាកចេញ (Check-out):</b> ${booking.checkOutTime || "12:00 (ថ្ងៃត្រង់)"}
👥 <b>ចំនួនភ្ញៀវ:</b> ${booking.adults || 2} មនុស្សចាស់${booking.children ? `, ${booking.children} កុមារ` : ""}

💵 <b>ទឹកប្រាក់សរុប:</b> <b>$${formattedAmountUSD} USD</b> (≈ ${formattedAmountKHR} ៛)
💳 <b>ច្រកទូទាត់ (Gateway):</b> <b>${booking.paymentMethod || "KHQR_BAKONG"}</b>
🛡️ <b>ស្ថានភាពកាត់ប្រាក់:</b> ✅ <b>${booking.paymentStatus || "PAID"}</b>
🔐 <b>ហត្ថលេខាសម្ងាត់ HMAC:</b> <code>${(booking.signatureHMAC || "").slice(0, 24)}...</code>

${booking.specialRequests ? `📝 <b>សំណើពិសេស:</b> <i>${booking.specialRequests}</i>\n` : ""}━━━━━━━━━━━━━━━━━━━━
🌐 <b>ផ្ទាំងគ្រប់គ្រង Admin Portal:</b>
<a href="https://vvhotel.vercel.app/admin">https://vvhotel.vercel.app/admin</a>
  `.trim();

  if (targetChats.length === 0) {
    console.warn("No Telegram chat IDs registered yet for @vvotel_bot. Tell admin to send /start to https://t.me/vvotel_bot");
    return {
      success: false,
      deliveredCount: 0,
      error: "No chat IDs registered yet. Please start https://t.me/vvotel_bot in Telegram to receive alerts.",
    };
  }

  let deliveredCount = 0;
  for (const chatId of targetChats) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageHtml,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        deliveredCount++;
      } else {
        console.error(`Telegram API error for chat ${chatId}:`, data.description);
      }
    } catch (err) {
      console.error(`Failed to send Telegram message to ${chatId}:`, err);
    }
  }

  return { success: deliveredCount > 0, deliveredCount };
}

/**
 * Send a test notification from Admin Dashboard
 */
export async function sendTelegramTestAlert(): Promise<{
  success: boolean;
  deliveredCount: number;
  registeredChats: (string | number)[];
}> {
  const chatIds = await syncTelegramChatIds();
  const fallbackChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const targetChats = Array.from(
    new Set([...chatIds.map(String), ...(fallbackChatId ? [fallbackChatId] : [])])
  );

  const testMessage = `
🔔 <b>តេស្តប្រព័ន្ធជូនដំណឹង VVotel Telegram Bot (@vvotel_bot)</b>
🏨 <b>Vattanac Hotel (VVotel) Kampong Cham</b>
━━━━━━━━━━━━━━━━━━━━
✅ ប្រព័ន្ធ Bot ដំណើរការជោគជ័យ ១០០%
⏰ ពេលវេលា៖ ${new Date().toLocaleString("km-KH", { timeZone: "Asia/Phnom_Penh" })}
🛡️ បច្ចេកវិទ្យា៖ Webhook & Real-time Booking Alerts
━━━━━━━━━━━━━━━━━━━━
រាល់ពេលមានការកក់បន្ទប់ ឬបង់ប្រាក់តាម KHQR / Card ប្រព័ន្ធនឹងលោតសារ Alert មកទីនេះភ្លាមៗ!
  `.trim();

  let deliveredCount = 0;
  for (const chatId of targetChats) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: "HTML",
        }),
      });
      const data = await res.json();
      if (data.ok) deliveredCount++;
    } catch (e) {
      console.error("Test message error", e);
    }
  }

  return {
    success: deliveredCount > 0,
    deliveredCount,
    registeredChats: targetChats,
  };
}
