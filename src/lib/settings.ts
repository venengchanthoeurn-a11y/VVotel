export interface RoomSetting {
  id: string;
  nameKm: string;
  nameEn: string;
  categoryKm: string;
  categoryEn: string;
  basePrice: number;
  originalPrice: number;
  sizeSqm: number;
  capacityAdults: number;
  capacityChildren: number;
  bedTypeKm: string;
  bedTypeEn: string;
  viewKm: string;
  viewEn: string;
  imageUrl: string;
  availableCount: number;
  enabled: boolean;
}

export interface DestinationSetting {
  id: number;
  slug: string;
  nameKm: string;
  nameEn: string;
  category: "beaches-nature" | "sports-activities" | "culture-local-life" | "restaurants";
  categoryNameKm: string;
  categoryNameEn: string;
  distanceKm: number;
  travelTimeMinutes: number;
  latitude: number;
  longitude: number;
  taglineKm: string;
  taglineEn: string;
  descriptionKm: string;
  descriptionEn: string;
  imageUrl: string;
  googleMapsUrl: string;
  enabled: boolean;
}

export interface SiteSettings {
  // 1. Hotel Brand & Info
  hotelNameKm: string;
  hotelNameEn: string;
  hotelTaglineKm: string;
  hotelTaglineEn: string;
  logoText: string;
  logoImageUrl: string;
  phone: string;
  email: string;
  addressKm: string;
  addressEn: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;

  // 2. Banking & KHQR Gateways
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bakongAccountId: string;
  bakongMerchantId: string;
  qrCustomImageUrl: string;
  bakongOpenApiToken: string;
  strictBakongVerification: boolean; // When true, money MUST be verified in Bakong before booking confirmation

  // 3. Rooms & Pricing
  rooms: RoomSetting[];
  breakfastPriceUSD: number;

  // 4. Locations & Tourist Destinations
  destinations: DestinationSetting[];

  // 5. Feature Toggles
  features: {
    enableDiningBooking: boolean;
    enableKhqrBakong: boolean;
    enableCard3DS: boolean;
    enablePayAtHotel: boolean;
    enableTelegramAlerts: boolean;
    enablePwaInstall: boolean;
    enableLeafletMap: boolean;
    enableAccessibilityPanel: boolean;
    enableWeatherWidget: boolean;
  };

  // 6. Telegram Bot
  telegramBotToken: string;
  telegramAdminChatId: string;
  telegramBotUsername: string;

  updatedAt: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  hotelNameKm: "សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
  hotelNameEn: "Vattanac Hotel (VVotel) Kampong Cham",
  hotelTaglineKm: "សណ្ឋាគារប្រណីតផ្កាយ ៥ មាត់ទន្លេមេគង្គ",
  hotelTaglineEn: "5-Star Luxury Riverside Resort & Spa",
  logoText: "VVOTEL",
  logoImageUrl: "",
  phone: "+855 (0) 42 982 999",
  email: "reservations@vvotel.com",
  addressKm: "ផ្ទះលេខ ២០៥២, ផ្លូវព្រះមុនីវង្ស, ភូមិ ៧, សង្កាត់បឹងកុក, ក្រុងកំពង់ចាម",
  addressEn: "No. 2052, Preah Monivong St., Phum 7, Sangkat Boeng Kok, Kampong Cham City",
  latitude: 11.9928,
  longitude: 105.4625,
  googleMapsUrl: "https://maps.google.com/?q=11.9928,105.4625",

  bankName: "ABA Bank (NBC Bakong Member)",
  bankAccountName: "VATTANAC HOTEL VVOTEL CO., LTD",
  bankAccountNumber: "001 982 999",
  bakongAccountId: "vvotel@abaa",
  bakongMerchantId: "030402_VVOTEL_KC",
  qrCustomImageUrl: "",
  bakongOpenApiToken: "",
  strictBakongVerification: true,

  breakfastPriceUSD: 15,

  rooms: [
    {
      id: "standard-city",
      nameKm: "បន្ទប់ស្តង់ដារ ទេសភាពទីក្រុង",
      nameEn: "Standard Room City View",
      categoryKm: "ផាសុកភាពបុរាណ",
      categoryEn: "Classic Comfort",
      basePrice: 85,
      originalPrice: 110,
      sizeSqm: 34,
      capacityAdults: 2,
      capacityChildren: 1,
      bedTypeKm: "គ្រែឃីង ១ ឬគ្រែទោល ២",
      bedTypeEn: "1 King Bed or 2 Twin Beds",
      viewKm: "ទេសភាពទីក្រុងកំពង់ចាម",
      viewEn: "Kampong Cham City Skyline",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      availableCount: 15,
      enabled: true,
    },
    {
      id: "superior-river",
      nameKm: "បន្ទប់ស៊ុភើរៀ ទេសភាពទន្លេមេគង្គ",
      nameEn: "Superior Room River View",
      categoryKm: "ទេសភាពទន្លេមេគង្គ",
      categoryEn: "River Panorama",
      basePrice: 125,
      originalPrice: 160,
      sizeSqm: 42,
      capacityAdults: 2,
      capacityChildren: 1,
      bedTypeKm: "គ្រែឃីងធំ ១ ពូកទន់ប្រណីត",
      bedTypeEn: "1 King Bed with Luxury Pillowtop",
      viewKm: "ទេសភាពទន្លេមេគង្គ និងស្ពានគីហ្សូណា",
      viewEn: "Direct Mekong River & Kizuna Bridge View",
      imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      availableCount: 12,
      enabled: true,
    },
    {
      id: "executive-suite",
      nameKm: "បន្ទប់ស្វ៊ីតប្រណីតមាត់ទន្លេ (១ បន្ទប់គេង)",
      nameEn: "Executive Mekong Suite (1 Bedroom)",
      categoryKm: "បន្ទប់ស្វ៊ីតថ្នាក់ដឹកនាំ",
      categoryEn: "Executive Living",
      basePrice: 195,
      originalPrice: 260,
      sizeSqm: 68,
      capacityAdults: 3,
      capacityChildren: 2,
      bedTypeKm: "គ្រែឃីងទំហំធំពិសេស ១ + សាឡុងគេង",
      bedTypeEn: "1 Master King Bed + Daybed Sofa",
      viewKm: "ទេសភាពមាត់ទន្លេ ១៨០ ដឺក្រេ និងបន្ទប់ទទួលភ្ញៀវ",
      viewEn: "180° Panoramic Riverfront with Private Balcony",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      availableCount: 8,
      enabled: true,
    },
    {
      id: "royal-family-suite",
      nameKm: "បន្ទប់ស្វ៊ីតគ្រួសារមាត់ទន្លេ (២ បន្ទប់គេង)",
      nameEn: "Royal Family River Suite (2 Bedroom)",
      categoryKm: "វិមានគ្រួសារប្រណីត",
      categoryEn: "Royal Family Residence",
      basePrice: 280,
      originalPrice: 380,
      sizeSqm: 110,
      capacityAdults: 4,
      capacityChildren: 3,
      bedTypeKm: "គ្រែឃីង ២ + គ្រែទោល ២",
      bedTypeEn: "2 King Master Bedrooms + 2 Twin Beds",
      viewKm: "ទេសភាពទន្លេមេគង្គពេញលេញ ផ្ទះបាយ និងអាងត្រាំទឹក",
      viewEn: "Full Mekong View with Dining Kitchen & Jacuzzi",
      imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
      availableCount: 4,
      enabled: true,
    },
  ],

  destinations: [
    {
      id: 1,
      slug: "koh-pen-bamboo-bridge",
      nameKm: "ស្ពានឫស្សីកោះប៉ែន",
      nameEn: "Koh Pen Bamboo Bridge Experience",
      category: "beaches-nature",
      categoryNameKm: "ឆ្នេរ និងធម្មជាតិ",
      categoryNameEn: "Nature & Islands",
      distanceKm: 2.1,
      travelTimeMinutes: 7,
      latitude: 11.9798,
      longitude: 105.4695,
      taglineKm: "ស្ពានឫស្សីធ្វើដោយដៃវែងជាងគេលើពិភពលោក",
      taglineEn: "World's longest seasonal handcrafted bamboo bridge",
      descriptionKm: "ដើរកម្សាន្ត ឬជិះកង់ឆ្លងកាត់ស្ពានឫស្សីបុរាណដែលកសាងឡើងដោយដើមឫស្សីជាង ៥០,០០០ ដើមរៀងរាល់រដូវប្រាំង ឆ្ពោះទៅកាន់កោះប៉ែនដ៏ស្រស់បំព្រង។",
      descriptionEn: "Cross the legendary seasonal bamboo bridge painstakingly crafted by local artisans with 50,000 bamboo poles every dry season.",
      imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      googleMapsUrl: "https://maps.google.com/?q=11.9798,105.4695",
      enabled: true,
    },
    {
      id: 2,
      slug: "wat-nokor-bachey",
      nameKm: "ប្រាសាទនគរបាជ័យ",
      nameEn: "Wat Nokor Bachey Temple",
      category: "culture-local-life",
      categoryNameKm: "វប្បធម៌ និងជីវភាព",
      categoryNameEn: "Culture & Heritage",
      distanceKm: 3.4,
      travelTimeMinutes: 10,
      latitude: 12.0089,
      longitude: 105.4385,
      taglineKm: "ប្រាសាទបុរាណសតវត្សរ៍ទី ១១ រួមបញ្ចូលជាមួយវត្តអារាមទំនើប",
      taglineEn: "11th-century Jayavarman VII sandstone temple with vibrant pagoda",
      descriptionKm: "ស្ថាបត្យកម្មដ៏កម្រនៃប្រាសាទថ្មភក់សម័យអង្គរដែលព័ទ្ធជុំវិញដោយព្រះវិហារពុទ្ធសាសនាដ៏ស្រស់ស្អាតនិងចម្លាក់ក្បាច់បុរាណ។",
      descriptionEn: "A magnificent juxtaposition where an ancient 11th-century Angkorian sandstone sanctuary integrates with an active modern Buddhist pagoda.",
      imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
      googleMapsUrl: "https://maps.google.com/?q=12.0089,105.4385",
      enabled: true,
    },
    {
      id: 3,
      slug: "phnom-srei-phnom-pros",
      nameKm: "ភ្នំស្រី ភ្នំប្រុស",
      nameEn: "Phnom Pros & Phnom Srei Cultural Hills",
      category: "culture-local-life",
      categoryNameKm: "វប្បធម៌ និងជីវភាព",
      categoryNameEn: "Culture & Legends",
      distanceKm: 7.0,
      travelTimeMinutes: 15,
      latitude: 12.0195,
      longitude: 105.4098,
      taglineKm: "ភ្នំភ្លោះនៃរឿងព្រេងខ្មែរដណ្តឹងប្តីប្រពន្ធដ៏ល្បីល្បាញ",
      taglineEn: "Twin sacred hills embodying Cambodia's most beloved marital legend",
      descriptionKm: "ទស្សនាទេសភាពខេត្តកំពង់ចាមពីលើកំពូលភ្នំ ព្រះវិហាររៀបរយ និងរឿងនិទានប្រពៃណីនៃការប្រណាំងលើកដីធ្វើភ្នំ។",
      descriptionEn: "Explore sacred hilltop stupas and monkeys, immersed in the centuries-old folk legend of the gender competition to build the highest hill.",
      imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
      googleMapsUrl: "https://maps.google.com/?q=12.0195,105.4098",
      enabled: true,
    },
    {
      id: 4,
      slug: "phnom-hanchey",
      nameKm: "វត្តភ្នំហាន់ជ័យ",
      nameEn: "Phnom Hanchey Mekong Hilltop Sanctuary",
      category: "beaches-nature",
      categoryNameKm: "ឆ្នេរ និងធម្មជាតិ",
      categoryNameEn: "Nature & Views",
      distanceKm: 21.0,
      travelTimeMinutes: 30,
      latitude: 12.1384,
      longitude: 105.5412,
      taglineKm: "ទិដ្ឋភាពទន្លេមេគង្គកោងដ៏ធំពីលើកំពូលភ្នំសតវត្សរ៍ទី ៨",
      taglineEn: "Pre-Angkorian Chenla shrine overlooking the serpentine Mekong bend",
      descriptionKm: "កន្លែងទេសភាពស្អាតបំផុតក្នុងខេត្តកំពង់ចាម មើលឃើញទន្លេមេគង្គដ៏ធំល្វឹងល្វើយ និងប្រាសាទឥដ្ឋសម័យចេនឡា។",
      descriptionEn: "Perched high above a sweeping Mekong bend, offering Cambodia's most breathtaking river vistas along with 8th-century Chenla brick sanctuaries.",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      googleMapsUrl: "https://maps.google.com/?q=12.1384,105.5412",
      enabled: true,
    },
  ],

  features: {
    enableDiningBooking: true,
    enableKhqrBakong: true,
    enableCard3DS: true,
    enablePayAtHotel: true,
    enableTelegramAlerts: true,
    enablePwaInstall: true,
    enableLeafletMap: true,
    enableAccessibilityPanel: true,
    enableWeatherWidget: true,
  },

  telegramBotToken: "9278143321:AAE73YdgWRNZQzwjBUZ1v7Lt4MdXmhGNImk",
  telegramAdminChatId: "683808125",
  telegramBotUsername: "vvotel_bot",

  updatedAt: new Date().toISOString(),
};
