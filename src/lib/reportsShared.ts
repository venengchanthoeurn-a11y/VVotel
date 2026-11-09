import { BookingRecord } from "./bookings";

/**
 * Convert Arabic digits to Khmer numerals
 */
export function toKhmerNum(val: number | string): string {
  const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return String(val).replace(/\d/g, (d) => khmerDigits[parseInt(d, 10)]);
}

/**
 * Format date into official Cambodian administrative date string
 */
export function getOfficialKhmerDate(d: Date = new Date()) {
  const days = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
  const months = [
    "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
    "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
  ];

  const dayName = days[d.getDay()];
  const dayNum = toKhmerNum(String(d.getDate()).padStart(2, "0"));
  const monthName = months[d.getMonth()];
  const yearNum = toKhmerNum(d.getFullYear());

  return {
    fullSolarDate: `ថ្ងៃ${dayName} ទី${dayNum} ខែ${monthName} ឆ្នាំ${yearNum}`,
    standardHeaderDate: `កំពង់ចាម, ថ្ងៃទី${dayNum} ខែ${monthName} ឆ្នាំ${yearNum}`,
    shortDate: `${dayNum}/${toKhmerNum(String(d.getMonth() + 1).padStart(2, "0"))}/${yearNum}`,
    isoDate: d.toISOString().split("T")[0],
  };
}

export type ReportPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "all";

export const PERIOD_TITLES: Record<
  ReportPeriod,
  { km: string; en: string; subtitleKm: string }
> = {
  daily: {
    km: "របាយការណ៍ប្រចាំថ្ងៃ",
    en: "Daily Operational Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការប្រចាំថ្ងៃ (Daily Report)",
  },
  weekly: {
    km: "របាយការណ៍ប្រចាំសប្តាហ៍",
    en: "Weekly Operational Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការប្រចាំសប្តាហ៍ (Weekly Report)",
  },
  monthly: {
    km: "របាយការណ៍ប្រចាំខែ",
    en: "Monthly Operational Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការប្រចាំខែ (Monthly Report)",
  },
  quarterly: {
    km: "របាយការណ៍ប្រចាំត្រីមាស",
    en: "Quarterly Operational Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការប្រចាំត្រីមាស (Quarterly Report)",
  },
  semi_annual: {
    km: "របាយការណ៍ប្រចាំឆមាស",
    en: "Semi-Annual Operational Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការប្រចាំឆមាស (Semi-Annual Report)",
  },
  annual: {
    km: "របាយការណ៍ប្រចាំឆ្នាំ",
    en: "Annual Operational Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការប្រចាំឆ្នាំ (Annual Report)",
  },
  all: {
    km: "របាយការណ៍បូកសរុបរួម",
    en: "Executive Master Report",
    subtitleKm: "ទិន្នន័យប្រតិបត្តិការសរុបទាំងអស់ (All Time Master Records)",
  },
};

export function filterBookingsByPeriod(
  bookings: BookingRecord[],
  period: ReportPeriod = "all",
  refDate: Date = new Date()
): {
  filtered: BookingRecord[];
  periodLabelKm: string;
  periodLabelEn: string;
  dateRangeText: string;
} {
  const periodKey = (period || "all").toLowerCase() as ReportPeriod;
  const periodMeta = PERIOD_TITLES[periodKey] || PERIOD_TITLES.all;

  if (!Array.isArray(bookings)) {
    return {
      filtered: [],
      periodLabelKm: periodMeta.km,
      periodLabelEn: periodMeta.en,
      dateRangeText: "គ្មានទិន្នន័យ",
    };
  }

  const target = new Date(refDate);
  const targetYear = target.getFullYear();
  const targetMonth = target.getMonth();
  const targetDay = target.getDate();

  const getDateOfBooking = (b: BookingRecord): Date => {
    if (b.checkIn) {
      const d = new Date(b.checkIn);
      if (!isNaN(d.getTime())) return d;
    }
    if (b.createdAt) {
      const d = new Date(b.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  let startDate: Date;
  let endDate: Date;
  let dateRangeText = "";

  switch (periodKey) {
    case "daily": {
      startDate = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);
      endDate = new Date(targetYear, targetMonth, targetDay, 23, 59, 59, 999);
      const kDate = getOfficialKhmerDate(target);
      dateRangeText = `${kDate.fullSolarDate}`;
      break;
    }
    case "weekly": {
      const dayOfWeek = target.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      startDate = new Date(targetYear, targetMonth, targetDay - diffToMonday, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 7 * 86400000 - 1);
      const startK = getOfficialKhmerDate(startDate);
      const endK = getOfficialKhmerDate(endDate);
      dateRangeText = `សប្តាហ៍ទី ${toKhmerNum(Math.ceil(targetDay / 7))}: ${startK.shortDate} ដល់ ${endK.shortDate}`;
      break;
    }
    case "monthly": {
      startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0);
      endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
      const months = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
      ];
      dateRangeText = `ប្រចាំខែ ${months[targetMonth]} ឆ្នាំ ${toKhmerNum(targetYear)}`;
      break;
    }
    case "quarterly": {
      const quarterIndex = Math.floor(targetMonth / 3);
      startDate = new Date(targetYear, quarterIndex * 3, 1, 0, 0, 0);
      endDate = new Date(targetYear, (quarterIndex + 1) * 3, 0, 23, 59, 59, 999);
      dateRangeText = `ត្រីមាសទី ${toKhmerNum(quarterIndex + 1)} ឆ្នាំ ${toKhmerNum(targetYear)}`;
      break;
    }
    case "semi_annual": {
      const semesterIndex = targetMonth < 6 ? 0 : 1;
      startDate = new Date(targetYear, semesterIndex * 6, 1, 0, 0, 0);
      endDate = new Date(targetYear, (semesterIndex + 1) * 6, 0, 23, 59, 59, 999);
      dateRangeText = `ឆមាសទី ${toKhmerNum(semesterIndex + 1)} ឆ្នាំ ${toKhmerNum(targetYear)}`;
      break;
    }
    case "annual": {
      startDate = new Date(targetYear, 0, 1, 0, 0, 0);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
      dateRangeText = `ប្រចាំឆ្នាំ ${toKhmerNum(targetYear)}`;
      break;
    }
    case "all":
    default: {
      startDate = new Date(0);
      endDate = new Date(8640000000000000);
      dateRangeText = `ទិន្នន័យសរុបរួមទាំងអស់ (All Time)`;
      break;
    }
  }

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  let filtered = bookings.filter((b) => {
    const bookingDate = getDateOfBooking(b);
    const t = bookingDate.getTime();
    return t >= startTime && t <= endTime;
  });

  if (filtered.length === 0 && bookings.length > 0) {
    filtered = bookings;
    dateRangeText += " (បង្ហាញទិន្នន័យប្រតិបត្តិការជាក់ស្តែងក្នុងប្រព័ន្ធ)";
  }

  return {
    filtered,
    periodLabelKm: periodMeta.km,
    periodLabelEn: periodMeta.en,
    dateRangeText,
  };
}
