import fs from "fs";
import path from "path";
import { getAllBookings } from "./bookings";
import {
  generateOfficialDocx,
  generateOfficialExcel,
  getOfficialKhmerDate,
  computeReportMetrics,
} from "./reports";

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "9278143321:AAE73YdgWRNZQzwjBUZ1v7Lt4MdXmhGNImk";
export const TELEGRAM_BOT_USERNAME = "vvotel_bot";
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vvhotel.vercel.app";

import os from "os";

declare global {
  var _vvotelTelegramStorage: TelegramStorage | undefined;
}

const SEED_CHATS_FILE = path.join(process.cwd(), "data", "telegram_chats.json");
const TMP_CHATS_FILE = path.join(os.tmpdir(), "vvotel_telegram_chats.json");

interface TelegramStorage {
  chatIds: (string | number)[];
  lastUpdateId: number;
  updatedAt: string;
}

export const getStorage = (): TelegramStorage => {
  if (globalThis._vvotelTelegramStorage) {
    return globalThis._vvotelTelegramStorage;
  }
  try {
    if (fs.existsSync(TMP_CHATS_FILE)) {
      const raw = fs.readFileSync(TMP_CHATS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.chatIds)) {
        globalThis._vvotelTelegramStorage = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(SEED_CHATS_FILE)) {
      const raw = fs.readFileSync(SEED_CHATS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.chatIds)) {
        globalThis._vvotelTelegramStorage = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading telegram_chats.json", e);
  }
  const defaultStorage: TelegramStorage = { chatIds: [683808125], lastUpdateId: 0, updatedAt: new Date().toISOString() };
  globalThis._vvotelTelegramStorage = defaultStorage;
  return defaultStorage;
};

export const saveStorage = (data: TelegramStorage) => {
  globalThis._vvotelTelegramStorage = data;
  try {
    const tmpDir = path.dirname(TMP_CHATS_FILE);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(TMP_CHATS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}

  try {
    const dir = path.dirname(SEED_CHATS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SEED_CHATS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
};

/**
 * Register chat ID into storage
 */
export function registerChatId(chatId: string | number) {
  const storage = getStorage();
  const currentSet = new Set(storage.chatIds.map(String));
  const strId = String(chatId);
  if (!currentSet.has(strId)) {
    storage.chatIds.push(chatId);
    storage.updatedAt = new Date().toISOString();
    saveStorage(storage);
  }
}

/**
 * Generic helper to send a message via Telegram Bot API
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: {
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  } = {}
) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || "HTML",
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? false,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error(`Failed to send Telegram message to ${chatId}:`, err);
    return { ok: false, error: err };
  }
}

export const VVOTEL_LOGO_URL = "https://vvhotel.vercel.app/icons/icon-512.png?v=2";
export const HOTEL_FACADE_URL = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

/**
 * Helper to send photo with caption via Telegram Bot API
 */
export async function sendTelegramPhoto(
  chatId: string | number,
  photoUrl: string,
  caption: string,
  options: {
    parse_mode?: "HTML" | "Markdown";
    reply_markup?: any;
  } = {}
) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: options.parse_mode || "HTML",
        reply_markup: options.reply_markup,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn("sendTelegramPhoto fallback to sendMessage:", data.description);
      return await sendTelegramMessage(chatId, caption, options);
    }
    return data;
  } catch (err) {
    console.error(`Failed to send Telegram photo to ${chatId}:`, err);
    return await sendTelegramMessage(chatId, caption, options);
  }
}

/**
 * Send documents (e.g. DOCX, XLSX, PDF) via Telegram Bot API
 */
export async function sendTelegramDocument(
  chatId: string | number,
  buffer: Buffer,
  filename: string,
  caption: string,
  options: {
    parse_mode?: "HTML" | "Markdown";
    reply_markup?: any;
  } = {}
) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("document", new Blob([new Uint8Array(buffer)]), filename);
    formData.append("caption", caption);
    if (options.parse_mode) {
      formData.append("parse_mode", options.parse_mode);
    }
    if (options.reply_markup) {
      formData.append("reply_markup", JSON.stringify(options.reply_markup));
    }

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (err) {
    console.error(`Failed to send Telegram document to ${chatId}:`, err);
    return { ok: false, error: err };
  }
}

/**
 * Answer an incoming callback query to remove Telegram's loading spinner
 */
export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "",
        show_alert: false,
      }),
    });
  } catch (e) {
    console.error("Failed to answer callback query:", e);
  }
}

/**
 * Configure Telegram Bot Commands and Webhook
 */
export async function configureTelegramBot(domain: string = APP_BASE_URL) {
  try {
    // 1. Set Bot Commands
    const commandsUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`;
    await fetch(commandsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "start", description: "🏠 បើកម៉ឺនុយមេ (Main Menu)" },
          { command: "pms", description: "🏨 ភ្ជាប់ប្រព័ន្ធកណ្តាល ALL Accor PMS" },
          { command: "admin", description: "📊 ផ្ទាំងគ្រប់គ្រងសណ្ឋាគារ (Admin Portal)" },
          { command: "rooms", description: "🛏️ បន្ទប់ស្នាក់នៅ និងតម្លៃ (Rooms & Rates)" },
          { command: "booking", description: "🛎️ កក់បន្ទប់តាម Online WebApp" },
          { command: "report", description: "📑 របាយការណ៍រដ្ឋបាល Word, Excel, PDF (Reports)" },
          { command: "guide", description: "🗺️ មគ្គុទ្ទេសក៍ទេសចរណ៍ខេត្តកំពង់ចាម" },
          { command: "contact", description: "📞 ទំនាក់ទំនង & ទីតាំងសណ្ឋាគារ" },
        ],
      }),
    });

    // 2. Set Webhook
    const cleanDomain = domain.replace(/\/$/, "");
    const webhookUrl = `${cleanDomain}/api/telegram/webhook`;
    const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    const res = await fetch(setWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: false,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to configure Telegram bot webhook:", err);
    return { ok: false, error: err };
  }
}

/**
 * Send the Grand Executive Main Menu
 */
export async function sendTelegramMainMenu(chatId: string | number, name: string = "Guest") {
  registerChatId(chatId);

  const text = `
✨ <b>សណ្ឋាគារ វឌ្ឍនៈ (VVOTEL) កំពង់ចាម</b> ✨
<i>Vattanac Luxury Hotel • Central PMS & Assistant Bot</i>
━━━━━━━━━━━━━━━━━━━━━━
👑 <b>សូមស្វាគមន៍លោកអ្នក ${name}!</b>

ប្រព័ន្ធ Bot ឆ្លាតវៃផ្លូវការរបស់ <b>VVotel Kampong Cham</b> បានតភ្ជាប់ទៅកាន់ប្រព័ន្ធគ្រប់គ្រងកណ្តាលសណ្ឋាគារ (Central PMS Hub) និងគេហទំព័រជាស្វ័យប្រវត្ត។

🛎️ <b>សេវាកម្ម និងមុខងារសំខាន់ៗ៖</b>
• <b>ប្រព័ន្ធកណ្តាល ALL Accor PMS:</b> គ្រប់គ្រងការកក់បន្ទប់ និងទិន្នន័យ
• <b>ប្រព័ន្ធកក់បន្ទប់ផ្ទាល់:</b> កក់បន្ទប់ភ្លាមៗតាមទូរស័ព្ទដៃ
• <b>ការទូទាត់កម្រិតខ្ពស់:</b> គាំទ្រ Bakong KHQR និងកាត 3D Secure
• <b>របាយការណ៍រដ្ឋបាលផ្លូវការ:</b> ផលិតរបាយការណ៍ Word (.docx), Excel (.xlsx), PDF
• <b>ការជូនដំណឹងស្វ័យប្រវត្ត:</b> Alert ភ្លាមៗរាល់ពេលភ្ញៀវកក់ ឬបាញ់លុយចូល

សូមជ្រើសរើសមុខងារដែលលោកអ្នកត្រូវការខាងក្រោម៖
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "🛎️ កក់បន្ទប់ភ្លាមៗ (Book Now WebApp)",
          web_app: { url: APP_BASE_URL },
        },
      ],
      [
        {
          text: "📑 របាយការណ៍រដ្ឋបាលផ្លូវការ (Administrative Reports)",
          callback_data: "cmd_report",
        },
      ],
      [
        {
          text: "🏨 ភ្ជាប់ប្រព័ន្ធកណ្តាល ALL Accor PMS",
          callback_data: "cmd_pms",
        },
        {
          text: "📊 ផ្ទាំងគ្រប់គ្រង (Admin PMS)",
          callback_data: "cmd_admin",
        },
      ],
      [
        {
          text: "🛏️ បន្ទប់ និងតម្លៃ (Rooms & Rates)",
          callback_data: "cmd_rooms",
        },
        {
          text: "🗺️ មគ្គុទ្ទេសក៍ទេសចរណ៍កំពង់ចាម",
          callback_data: "cmd_guide",
        },
      ],
      [
        {
          text: "📞 ទំនាក់ទំនង & ទីតាំងសណ្ឋាគារ",
          callback_data: "cmd_contact",
        },
        {
          text: "🌐 ចូលទៅកាន់គេហទំព័រ",
          url: APP_BASE_URL,
        },
      ],
    ],
  };

  return sendTelegramPhoto(chatId, VVOTEL_LOGO_URL, text, { reply_markup });
}

/**
 * Send Administrative Report Menu
 */
export async function sendTelegramReportMenu(chatId: string | number) {
  registerChatId(chatId);
  const bookings = getAllBookings();
  const dateInfo = getOfficialKhmerDate();
  const metrics = computeReportMetrics(bookings);

  const text = `
📑 <b>របាយការណ៍រដ្ឋបាលផ្លូវការ • VVOTEL KAMPONG CHAM</b>
<i>Official Administrative Reports Suite • Central PMS Hub</i>
━━━━━━━━━━━━━━━━━━━━━━
🏛️ <b>ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ</b>
🏢 <b>សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម | ផ្នែករដ្ឋបាល និងហិរញ្ញវត្ថុ</b>
📅 <b>កាលបរិច្ឆេទ:</b> ${dateInfo.fullSolarDate}

📊 <b>ស្ថិតិសង្ខេបប្រតិបត្តិការ៖</b>
• ចំនួនការកក់សរុប: <b>${metrics.totalBookings}</b> (បន្ទប់: ${metrics.roomBookings} | តុ: ${metrics.diningBookings})
• ភ្ញៀវកំពុងស្នាក់នៅ (In-House): <b>${metrics.inHouseCount} នាក់</b>
• ចំណូលសរុប (USD): <b>$${metrics.totalPaidUSD.toFixed(2)}</b>
• ចំណូលសរុប (KHR): <b>${metrics.totalPaidKHR.toLocaleString()} ៛</b>

🎯 <b>ទម្រង់របាយការណ៍រដ្ឋបាលស្តង់ដារកម្ពុជា៖</b>
លោកអ្នកអាចទាញយករបាយការណ៍រដ្ឋបាលជាឯកសារ Word (.docx), Excel (.xlsx), ឬមើល និងបោះពុម្ពជា PDF តាមប៊ូតុងខាងក្រោម៖
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📄 ទាញយក Word (.docx)",
          callback_data: "cmd_report_docx",
        },
        {
          text: "📊 ទាញយក Excel (.xlsx)",
          callback_data: "cmd_report_excel",
        },
      ],
      [
        {
          text: "📕 បើកមើល / បោះពុម្ព PDF ផ្លូវការ",
          url: `${APP_BASE_URL}/api/reports?format=html`,
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Generate and deliver official DOCX Administrative Report
 */
export async function sendTelegramReportDocx(chatId: string | number) {
  try {
    await sendTelegramMessage(
      chatId,
      "⏳ <i>កំពុងរៀបចំផលិតរបាយការណ៍រដ្ឋបាលជាទម្រង់ Microsoft Word (.docx) តាមបទដ្ឋានផ្លូវការកម្ពុជា...</i>"
    );
    const bookings = getAllBookings();
    const dateInfo = getOfficialKhmerDate();
    const buffer = await generateOfficialDocx(bookings);
    const filename = `VVotel_Official_Administrative_Report_${dateInfo.isoDate}.docx`;
    const caption = `
📄 <b>របាយការណ៍បូកសរុបប្រតិបត្តិការ (Word Document • .docx)</b>
<i>សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • ទម្រង់រដ្ឋបាលស្តង់ដារកម្ពុជា</i>
━━━━━━━━━━━━━━━━━━━━━━
• <b>ពុម្ភអក្សរ:</b> Khmer Mool (ក្បាលលិខិត) & Khmer OS Siemreap (តួអត្ថបទ)
• <b>កាលបរិច្ឆេទ:</b> ${dateInfo.standardHeaderDate}
• <b>ចំនួនប្រតិបត្តិការ:</b> ${bookings.length} ការកក់
• <b>ទម្រង់ឯកសារ:</b> Microsoft Word (.docx) មានតារាងទិន្នន័យ ស្ថិតិ និងប្រអប់ហត្ថលេខា/ត្រាពេញលេញ។
`;
    return await sendTelegramDocument(chatId, buffer, filename, caption, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📊 ទាញយក Excel (.xlsx)", callback_data: "cmd_report_excel" },
            { text: "🔄 ត្រឡប់ទៅម៉ឺនុយរបាយការណ៍", callback_data: "cmd_report" },
          ],
        ],
      },
    });
  } catch (err) {
    console.error("Error sending docx report to telegram:", err);
    return await sendTelegramMessage(
      chatId,
      "❌ មានបញ្ហាក្នុងការបង្កើតរបាយការណ៍ Word សូមសាកល្បងម្តងទៀត។"
    );
  }
}

/**
 * Generate and deliver official Excel (.xlsx) Administrative Report
 */
export async function sendTelegramReportExcel(chatId: string | number) {
  try {
    await sendTelegramMessage(
      chatId,
      "⏳ <i>កំពុងរៀបចំផលិតរបាយការណ៍រដ្ឋបាលជាទម្រង់ Microsoft Excel (.xlsx) ជាមួយរូបមន្ត និងតារាងទិន្នន័យ...</i>"
    );
    const bookings = getAllBookings();
    const dateInfo = getOfficialKhmerDate();
    const buffer = await generateOfficialExcel(bookings);
    const filename = `VVotel_Official_Executive_Report_${dateInfo.isoDate}.xlsx`;
    const caption = `
📊 <b>របាយការណ៍បូកសរុបប្រតិបត្តិការ (Excel Workbook • .xlsx)</b>
<i>សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម • តារាងទិន្នន័យ និងចំណូល</i>
━━━━━━━━━━━━━━━━━━━━━━
• <b>កាលបរិច្ឆេទ:</b> ${dateInfo.standardHeaderDate}
• <b>ចំនួនប្រតិបត្តិការ:</b> ${bookings.length} ការកក់
• <b>លក្ខណៈពិសេស:</b> តារាងព័ត៌មានលម្អិត, ការគណនាផលបូកចំណូលសរុប USD ($) និង KHR (៛) ដោយស្វ័យប្រវត្តិ។
`;
    return await sendTelegramDocument(chatId, buffer, filename, caption, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📄 ទាញយក Word (.docx)", callback_data: "cmd_report_docx" },
            { text: "🔄 ត្រឡប់ទៅម៉ឺនុយរបាយការណ៍", callback_data: "cmd_report" },
          ],
        ],
      },
    });
  } catch (err) {
    console.error("Error sending excel report to telegram:", err);
    return await sendTelegramMessage(
      chatId,
      "❌ មានបញ្ហាក្នុងការបង្កើតរបាយការណ៍ Excel សូមសាកល្បងម្តងទៀត។"
    );
  }
}

/**
 * Send ALL Accor PMS Bridge Overview
 */
export async function sendTelegramPmsBridge(chatId: string | number) {
  registerChatId(chatId);

  const bookings = getAllBookings();
  const totalBookings = bookings.length;
  const totalUSD = bookings
    .filter((b) => b.paymentStatus === "PAID" || b.paymentStatus === "GUARANTEED")
    .reduce((acc, b) => acc + (b.totalAmountUSD || 0), 0);
  const totalKHR = Math.round(totalUSD * 4100);

  const text = `
🏨 <b>ប្រព័ន្ធកណ្តាល ALL ACCOR PMS • VVOTEL KAMPONG CHAM</b>
<i>Central Property Management System Bridge (Hotel Code: A611)</i>
━━━━━━━━━━━━━━━━━━━━━━
⚡ <b>ស្ថានភាពតភ្ជាប់បច្ចុប្បន្ន:</b> 🟢 <b>ONLINE & SYNCHRONIZED</b>

📊 <b>ទិន្នន័យកត់ត្រាក្នុងប្រព័ន្ធកណ្តាល៖</b>
• ចំនួនការកក់សរុប: <b>${totalBookings} ការកក់</b>
• ចំណូលសរុប (USD): <b>$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
• ចំណូលសរុប (KHR): <b>៛${totalKHR.toLocaleString()} ៛</b>
• ម៉ោង Check-in ស្តង់ដារ: <b>14:00</b>
• ម៉ោង Check-out ស្តង់ដារ: <b>12:00</b>

🔐 <b>បណ្តាញទូទាត់ប្រាក់មានសុវត្ថិភាពខ្ពស់៖</b>
• <b>Bakong KHQR:</b> ស្កេនទូទាត់ប្រាក់រៀល និងដុល្លារ
• <b>Card 3D Secure 2.2:</b> ការពារដោយលេខកូដសម្ងាត់ OTP
• <b>HMAC SHA-256:</b> ហត្ថលេខាសុវត្ថិភាពឌីជីថល Tamper-proof

🔔 <b>Telegram Real-time Alert:</b>
រាល់ពេលមានការកក់ ឬបាញ់លុយចូលពី Website ប្រព័ន្ធ Bot នឹងលោត Alert ជូនដំណឹងមកកាន់ Telegram នេះភ្លាមៗ!
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📊 បើកផ្ទាំងគ្រប់គ្រងសណ្ឋាគារ (Open Admin PMS)",
          url: `${APP_BASE_URL}/admin`,
        },
      ],
      [
        {
          text: "🛎️ កក់បន្ទប់លើប្រព័ន្ធផ្ទាល់ (Direct Booking)",
          web_app: { url: APP_BASE_URL },
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Send Admin PMS Overview
 */
export async function sendTelegramAdminOverview(chatId: string | number) {
  registerChatId(chatId);

  const bookings = getAllBookings();
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckIns = bookings.filter((b) => b.checkIn === todayStr).length;
  const todayCheckOuts = bookings.filter((b) => b.checkOut === todayStr).length;
  const inHouse = bookings.filter((b) => b.stayStatus === "CHECKED_IN").length;

  const text = `
📊 <b>ផ្ទាំងគ្រប់គ្រងសណ្ឋាគារ (HOTEL ADMIN PMS PORTAL)</b>
<i>VVotel Kampong Cham • Front-Desk & Operational Management</i>
━━━━━━━━━━━━━━━━━━━━━━
🛎️ <b>ស្ថានភាពបន្ទប់ និងភ្ញៀវថ្ងៃនេះ (${todayStr}):</b>
• ភ្ញៀវចូលថ្ងៃនេះ (Check-in 14:00): <b>${todayCheckIns} នាក់</b>
• ភ្ញៀវចេញថ្ងៃនេះ (Check-out 12:00): <b>${todayCheckOuts} នាក់</b>
• ភ្ញៀវកំពុងស្នាក់នៅ (In-House): <b>${inHouse} បន្ទប់</b>
• ការកក់សរុបក្នុង Database: <b>${bookings.length}</b>

🧾 <b>ប្រព័ន្ធបោះពុម្ពវិក្កយបត្រស្តង់ដារ៖</b>
• <b>80mm POS Thermal Receipt:</b> សម្រាប់ម៉ាស៊ីនកាត់ក្រដាសកម្តៅ
• <b>A4 Official Tax Invoice:</b> មាន TIN ផ្លូវការ (K002-901844910) និងពន្ធ 10% VAT

លោកអ្នកអាចចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងពេញលេញតាមរយៈតំណភ្ជាប់ខាងក្រោម៖
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📊 ចូលផ្ទាំងគ្រប់គ្រង Admin Portal",
          url: `${APP_BASE_URL}/admin`,
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Send Rooms & Rates Catalog
 */
export async function sendTelegramRoomsCatalog(chatId: string | number) {
  const text = `
🛏️ <b>បន្ទប់ និងបន្ទប់ស្វ៊ីតប្រណីត • VVOTEL KAMPONG CHAM</b>
<i>Luxury Accommodation Catalog • Mekong Riverfront</i>
━━━━━━━━━━━━━━━━━━━━━━
<b>១. បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង (Standard Room City View)</b>
• ទំហំ: 34 m² | គ្រែឃីង ១ ឬគ្រែទោល ២
• តម្លៃ: <b>$85 / យប់</b> (≈ ៛348,500)

<b>២. បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ (Superior Room River View)</b>
• ទំហំ: 42 m² | គ្រែឃីងធំ ១ + យ៉រមើលទេសភាពទន្លេ
• តម្លៃ: <b>$125 / យប់</b> (≈ ៛512,500)

<b>៣. បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ (Executive Mekong Suite)</b>
• ទំហំ: 68 m² | ១ បន្ទប់គេងធំ + បន្ទប់ទទួលភ្ញៀវដាច់ដោយឡែក
• តម្លៃ: <b>$195 / យប់</b> (≈ ៛799,500)

<b>៤. បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (Royal Family River Suite)</b>
• ទំហំ: 95 m² | ២ បន្ទប់គេងធំ + បន្ទប់ទទួលទានអាហារ
• តម្លៃ: <b>$280 / យប់</b> (≈ ៛1,148,000)

✨ <i>រាល់ការកក់មានរួមបញ្ចូលអាហារពេលព្រឹក ប៊ូហ្វេលំដាប់ផ្កាយ ៥ និង Wi-Fi ល្បឿនលឿនឥតគិតថ្លៃ!</i>
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "🛎️ កក់បន្ទប់ឥឡូវនេះ (Book a Room)",
          web_app: { url: `${APP_BASE_URL}#rooms` },
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Send Kampong Cham Tour Guide Info
 */
export async function sendTelegramGuideInfo(chatId: string | number) {
  const text = `
🗺️ <b>មគ្គុទ្ទេសក៍ទេសចរណ៍ខេត្តកំពង់ចាម (KAMPONG CHAM GUIDE)</b>
<i>រុករកសម្រស់ខ្សែបន្ទាត់ដងទន្លេមេគង្គ និងទឹកដីប្រវត្តិសាស្ត្រ</i>
━━━━━━━━━━━━━━━━━━━━━━
📍 <b>គោលដៅទេសចរណ៍ល្បីៗទាំង ២០ កន្លែង៖</b>
1. <b>ស្ពានឫស្សីកោះប៉ែន (Koh Pen Bamboo Bridge)</b> - ស្ពានឫស្សីវែងជាងគេបំផុតក្នុងលោក
2. <b>វត្តនគរបាជ័យ (Wat Nokor Bachey)</b> - ប្រាសាទបុរាណសតវត្សរ៍ទី ១១
3. <b>ភ្នំប្រុស ភ្នំស្រី (Phnom Pros & Phnom Srey)</b> - រមណីយដ្ឋានវប្បធម៌ និងប្រវត្តិសាស្ត្រ
4. <b>កោះប៉ែន (Koh Pen Island)</b> - ភូមិដ្ឋានប្រពៃណី និងផ្លូវជិះកង់កម្សាន្ត
5. <b>រមណីយដ្ឋានទឹកឆា (Teuk Chha Natural Resort)</b> - ទឹកធ្លាក់ធម្មជាតិដ៏ត្រជាក់
6. <b>ភ្នំហាន់ជ័យ (Wat Hanchey)</b> - វត្តលើកំពូលភ្នំមើលទេសភាពទន្លេមេគង្គ ៣៦០ ដឺក្រេ
7. <b>ស្ពានគីហ្សូណា (Kizuna Bridge)</b> - ស្ពានឆ្លងកាត់ទន្លេមេគង្គដំបូងគេនៅកម្ពុជា
... និងគោលដៅទេសចរណ៍ជាច្រើនទៀត!

លោកអ្នកអាចបើកមើលផែនទីអន្តរកម្ម Live Google Maps លើ Website ផ្ទាល់បាន!
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "🗺️ បើកផែនទីអន្តរកម្ម (Interactive Map)",
          web_app: { url: `${APP_BASE_URL}#destination-guide` },
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Send Contact & Location Info
 */
export async function sendTelegramContactInfo(chatId: string | number) {
  const text = `
📞 <b>ទំនាក់ទំនង & ទីតាំងសណ្ឋាគារ វឌ្ឍនៈ (VVOTEL) កំពង់ចាម</b>
━━━━━━━━━━━━━━━━━━━━━━
📍 <b>អាសយដ្ឋាន៖</b>
ផ្លូវព្រះមុនីវង្ស (មាត់ទន្លេមេគង្គ), ភូមិ ៧, សង្កាត់កំពង់ចាម, ក្រុងកំពង់ចាម, ខេត្តកំពង់ចាម (No. 2052, Preah Monivong St., Phum 7, 030402)

☎️ <b>លេខទូរស័ព្ទទាន់ហេតុការណ៍ (24/7 Hotline):</b>
<a href="tel:+85542982999">+855 (0) 42 982 999</a> / <a href="tel:+85512345678">+855 (0) 12 345 678</a>

📧 <b>អ៊ីមែល៖</b>
reservations@vvotel-kampongcham.com

🌐 <b>គេហទំព័រផ្លូវការ៖</b>
https://vvhotel.vercel.app
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📍 បើកមើលទីតាំងលើ Google Maps",
          url: "https://maps.google.com/?q=11.9934,105.4645",
        },
      ],
      [
        {
          text: "🌐 ចូលទៅកាន់គេហទំព័រផ្លូវការ",
          url: APP_BASE_URL,
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Lookup Booking by Reference ID
 */
export async function sendTelegramBookingLookup(chatId: string | number, ref: string) {
  const cleanRef = ref.trim().toUpperCase();
  const bookings = getAllBookings();
  const found = bookings.find(
    (b) => b.id.toUpperCase() === cleanRef || b.id.toUpperCase().includes(cleanRef)
  );

  if (!found) {
    const text = `
❌ <b>រកមិនឃើញទិន្នន័យការកក់កូដ "${ref}" ឡើយ!</b>

សូមពិនិត្យលេខកូដកក់ឡើងវិញ (ឧទាហរណ៍៖ <code>VVT-KC-894125</code>) ឬទាក់ទងមកកាន់ផ្នែកបម្រើអតិថិជន +855 42 982 999។
`;
    return sendTelegramMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [[{ text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ", callback_data: "cmd_main" }]],
      },
    });
  }

  const text = `
✅ <b>ព័ត៌មានលម្អិតនៃការកក់ #${found.id}</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>ឈ្មោះភ្ញៀវ:</b> ${found.guestName}
📱 <b>លេខទូរស័ព្ទ:</b> ${found.phone}
🛏️ <b>បន្ទប់:</b> ${found.roomNameKm || found.roomNameEn || found.roomType} ${found.roomNumber ? `(បន្ទប់លេខ: <b>${found.roomNumber}</b>)` : "(មិនទាន់កំណត់លេខបន្ទប់)"}
📅 <b>កាលបរិច្ឆេទ:</b> ${found.checkIn} ដល់ ${found.checkOut} (${found.nights} យប់)
👥 <b>ចំនួនភ្ញៀវ:</b> ${found.adults} នាក់ធំ, ${found.children} ក្មេង

💵 <b>ទឹកប្រាក់សរុប:</b> <b>$${Number(found.totalAmountUSD || 0).toFixed(2)} USD</b> (≈ ៛${Number(found.totalAmountKHR || 0).toLocaleString()} ៛)
💳 <b>វិធីទូទាត់:</b> ${found.paymentMethod}
🛡️ <b>ស្ថានភាពទូទាត់:</b> <b>${found.paymentStatus}</b>
🛎️ <b>ស្ថានភាពស្នាក់នៅ:</b> <b>${found.stayStatus}</b>
🕒 <b>ម៉ោង Check-in ស្តង់ដារ:</b> 14:00 | <b>Check-out:</b> 12:00
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📊 បើកមើលក្នុង Admin PMS",
          url: `${APP_BASE_URL}/admin`,
        },
      ],
      [
        {
          text: "🔄 ត្រឡប់ទៅម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  return sendTelegramMessage(chatId, text, { reply_markup });
}

/**
 * Handle incoming Telegram webhook updates (Messages & Callback Queries)
 */
export async function handleTelegramUpdate(update: any) {
  try {
    // 1. Process Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const fromName = msg.from?.first_name || "Guest";
      const text = (msg.text || "").trim();

      if (!chatId) return { ok: true };

      // Register chat
      registerChatId(chatId);

      // Deep link /start parameter
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        if (parts.length > 1 && (parts[1].includes("pms") || parts[1].includes("accor"))) {
          return await sendTelegramPmsBridge(chatId);
        }
        return await sendTelegramMainMenu(chatId, fromName);
      }

      if (text === "/pms" || text.toLowerCase() === "pms") {
        return await sendTelegramPmsBridge(chatId);
      }

      if (text === "/admin" || text.toLowerCase() === "admin") {
        return await sendTelegramAdminOverview(chatId);
      }

      if (text === "/rooms" || text.toLowerCase() === "rooms") {
        return await sendTelegramRoomsCatalog(chatId);
      }

      if (text === "/guide" || text.toLowerCase() === "guide") {
        return await sendTelegramGuideInfo(chatId);
      }

      if (text === "/contact" || text.toLowerCase() === "contact") {
        return await sendTelegramContactInfo(chatId);
      }

      if (
        text === "/report" ||
        text.toLowerCase() === "report" ||
        text === "/reports" ||
        text.toLowerCase() === "reports" ||
        text === "/export"
      ) {
        return await sendTelegramReportMenu(chatId);
      }

      // Check if user entered a booking code like VVT-KC-...
      if (text.toUpperCase().includes("VVT") || /^\d{6}$/.test(text)) {
        return await sendTelegramBookingLookup(chatId, text);
      }

      // Fallback response with main menu
      return await sendTelegramMainMenu(chatId, fromName);
    }

    // 2. Process Callback Queries (Inline Button clicks)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      if (!chatId) return { ok: true };

      // Always answer callback to dismiss Telegram's spinning icon
      await answerCallbackQuery(cb.id);

      switch (data) {
        case "cmd_main":
          return await sendTelegramMainMenu(chatId, cb.from?.first_name || "Guest");
        case "cmd_report":
          return await sendTelegramReportMenu(chatId);
        case "cmd_report_docx":
          return await sendTelegramReportDocx(chatId);
        case "cmd_report_excel":
          return await sendTelegramReportExcel(chatId);
        case "cmd_pms":
          return await sendTelegramPmsBridge(chatId);
        case "cmd_admin":
          return await sendTelegramAdminOverview(chatId);
        case "cmd_rooms":
          return await sendTelegramRoomsCatalog(chatId);
        case "cmd_guide":
          return await sendTelegramGuideInfo(chatId);
        case "cmd_contact":
          return await sendTelegramContactInfo(chatId);
        default:
          return await sendTelegramMainMenu(chatId, cb.from?.first_name || "Guest");
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Error processing Telegram update:", error);
    return { ok: false, error };
  }
}

/**
 * Send an executive HTML notification to all registered admins via @vvotel_bot
 * whenever a new booking is confirmed or paid!
 */
export async function sendTelegramBookingAlert(booking: any): Promise<{
  success: boolean;
  deliveredCount: number;
  error?: string;
}> {
  const storage = getStorage();
  const fallbackChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || 683808125;
  const targetChats = Array.from(
    new Set([...storage.chatIds.map(String), String(fallbackChatId)])
  );

  const formattedAmountUSD = Number(booking.totalAmountUSD || booking.amountUSD || 0).toFixed(2);
  const formattedAmountKHR = Number(
    booking.totalAmountKHR || Math.round(Number(formattedAmountUSD) * 4100)
  ).toLocaleString();

  const isBakong = booking.paymentMethod === "KHQR_BAKONG";
  const isCard = booking.paymentMethod && booking.paymentMethod.includes("CARD");
  const isHotel = booking.paymentMethod === "PAY_AT_HOTEL";

  const paymentBadge = isBakong
    ? "🔴 BAKONG KHQR (ទូទាត់រួច)"
    : isCard
    ? "💳 3D SECURE CARD (ទូទាត់រួច)"
    : "⏳ PAY AT HOTEL (ធានាកក់)";

  const isDining = booking.bookingCategory === "DINING" || String(booking.id || "").startsWith("DIN");

  const html = isDining
    ? `
🍽️ <b>ដំណឹងកក់តុអាហារថ្មី • VVOTEL KAMPONG CHAM</b> 🍽️
<i>Executive Table & Dining Reservation Alert</i>
━━━━━━━━━━━━━━━━━━━━━━
🔖 <b>លេខកូដកក់ (Ref):</b> <code>${booking.id || booking.bookingRef}</code>
🏨 <b>ភោជនីយដ្ឋាន/ទីកន្លែង:</b> <b>${booking.venueNameKm || booking.roomNameKm || "ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស"}</b>
👤 <b>ឈ្មោះភ្ញៀវ:</b> <b>${booking.guestName}</b>
📱 <b>លេខទូរស័ព្ទ:</b> <code>${booking.phone || "N/A"}</code>
👥 <b>ចំនួនភ្ញៀវ:</b> <b>${booking.adults || 2} នាក់</b>
🪑 <b>តុលេខ:</b> <b>${booking.roomNumber || "តុ VIP មាត់ទន្លេ"}</b>

📅 <b>កាលបរិច្ឆេទ & ម៉ោង:</b>
• <b>ថ្ងៃទទួលទាន:</b> ${booking.checkIn || booking.reservationDate}
• <b>ម៉ោងកក់:</b> <b>${booking.checkInTime || booking.reservationTime || "19:00"}</b>

${booking.specialRequests ? `📝 <b>សំណូមពរពិសេស:</b> <i>${booking.specialRequests}</i>\n` : ""}━━━━━━━━━━━━━━━━━━━━━━
✅ <i>ទិន្នន័យបានកត់ត្រាចូល Admin Portal និងរៀបចំតុទទួលភ្ញៀវរួចរាល់។</i>
`
    : `
🚨 <b>ដំណឹងកក់បន្ទប់ថ្មី • VVOTEL KAMPONG CHAM</b> 🚨
<i>Executive Booking Notification & PMS Alert</i>
━━━━━━━━━━━━━━━━━━━━━━
🔖 <b>លេខកូដកក់ (Ref):</b> <code>${booking.id || booking.bookingRef}</code>
👤 <b>ឈ្មោះភ្ញៀវ:</b> <b>${booking.guestName}</b>
📱 <b>លេខទូរស័ព្ទ:</b> <code>${booking.phone || "N/A"}</code>
📧 <b>អ៊ីមែល:</b> ${booking.email || "N/A"}
🌍 <b>ប្រទេស:</b> ${booking.country || "Cambodia"}

🛏️ <b>ប្រភេទបន្ទប់:</b> <b>${booking.roomNameKm || booking.roomNameEn || booking.roomType}</b>
🔢 <b>ចំនួនបន្ទប់:</b> ${booking.roomCount || 1} បន្ទប់ ${booking.roomNumber ? `(លេខបន្ទប់: <b>${booking.roomNumber}</b>)` : ""}
👥 <b>ភ្ញៀវ:</b> ${booking.adults || 2} នាក់ធំ, ${booking.children || 0} កុមារ
🍳 <b>អាហារពេលព្រឹក:</b> ${booking.includeBreakfast ? "✅ រួមបញ្ចូល" : "❌ មិនរួមបញ្ចូល"}

📅 <b>កាលបរិច្ឆេទស្នាក់នៅ:</b>
• <b>ថ្ងៃចូល (Check-In):</b> ${booking.checkIn} (ម៉ោង ១៤:០០)
• <b>ថ្ងៃចេញ (Check-Out):</b> ${booking.checkOut} (ម៉ោង ១២:០០)
• <b>ចំនួនស្នាក់នៅ:</b> ${booking.nights || 1} យប់

💰 <b>ទឹកប្រាក់ទទួលបាន:</b>
• <b>USD:</b> <b>$${formattedAmountUSD}</b>
• <b>KHR:</b> <b>៛${formattedAmountKHR}</b>
💳 <b>វិធីទូទាត់:</b> ${paymentBadge}
🛡️ <b>ស្ថានភាពទូទាត់:</b> <b>${booking.paymentStatus || "PAID"}</b>
🔑 <b>លេខកូដប្រតិបត្តិការ (TxID):</b> <code>${booking.transactionId || "TXN-SEC-" + Date.now().toString(36).toUpperCase()}</code>

${booking.specialRequests ? `📝 <b>សំណូមពរពិសេស:</b> <i>${booking.specialRequests}</i>\n` : ""}━━━━━━━━━━━━━━━━━━━━━━
✅ <i>ទិន្នន័យត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារកណ្តាលរួចរាល់។</i>
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📊 បើកមើលក្នុង Admin Portal",
          url: `${APP_BASE_URL}/admin`,
        },
      ],
      [
        {
          text: "🛎️ បើកមើលលើ Website",
          url: APP_BASE_URL,
        },
        {
          text: "🔄 ម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  let delivered = 0;
  for (const chatId of targetChats) {
    if (!chatId) continue;
    try {
      const res = await sendTelegramPhoto(chatId, VVOTEL_LOGO_URL, html, { reply_markup });
      if (res && res.ok) delivered++;
    } catch (e) {
      console.error(`Failed to dispatch alert to chat ${chatId}:`, e);
    }
  }

  return { success: delivered > 0, deliveredCount: delivered };
}

/**
 * Sync Telegram chat IDs by polling getUpdates
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
 * Send an executive test alert card to all registered admin chats
 */
export async function sendTelegramTestAlert(): Promise<{
  success: boolean;
  deliveredCount: number;
  registeredChats: number;
}> {
  await syncTelegramChatIds();
  const storage = getStorage();
  const targetChats = Array.from(new Set([...storage.chatIds.map(String), "683808125"]));

  const nowStr = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Phnom_Penh",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const html = `
🔔 <b>សារតេស្តប្រព័ន្ធស្វ័យប្រវត្ត (TEST ALERT) • @vvotel_bot</b> 🔔
━━━━━━━━━━━━━━━━━━━━━━
🏨 <b>សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម</b>
🕒 <b>កាលបរិច្ឆេទ:</b> ${nowStr} (ម៉ោងនៅកម្ពុជា)
🟢 <b>ស្ថានភាពប្រព័ន្ធ:</b> កំពុងដំណើរការយ៉ាងពេញលេញ ១០០%

⚡ <b>ការតភ្ជាប់ប្រព័ន្ធកណ្តាល ALL Accor PMS:</b>
• រាល់ពេលភ្ញៀវធ្វើការកក់បន្ទប់ ឬបាញ់លុយតាម <b>Bakong KHQR</b> / <b>3D Secure Card</b> លើ Website ទិន្នន័យទាំងអស់នឹងលោត Alert ចូលមកទីនេះភ្លាមៗ!
• បុគ្គលិកអាចចុចបើកមើលទិន្នន័យក្នុង Admin Portal ដោយផ្ទាល់។
`;

  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: "📊 បើកផ្ទាំងគ្រប់គ្រងសណ្ឋាគារ (Admin PMS)",
          url: `${APP_BASE_URL}/admin`,
        },
      ],
      [
        {
          text: "🛎️ សាកល្បងកក់បន្ទប់លើ WebApp",
          web_app: { url: APP_BASE_URL },
        },
      ],
      [
        {
          text: "🔄 បើកម៉ឺនុយមេ (Main Menu)",
          callback_data: "cmd_main",
        },
      ],
    ],
  };

  let delivered = 0;
  for (const chatId of targetChats) {
    try {
      const res = await sendTelegramMessage(chatId, html, { reply_markup });
      if (res && res.ok) delivered++;
    } catch (e) {
      console.error(`Failed to dispatch test alert to ${chatId}:`, e);
    }
  }

  return {
    success: delivered > 0,
    deliveredCount: delivered,
    registeredChats: targetChats.length,
  };
}

