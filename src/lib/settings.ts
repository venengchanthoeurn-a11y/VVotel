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
  viewTypeKm?: string;
  viewTypeEn?: string;
  imageUrl: string;
  availableCount: number;
  descriptionKm?: string;
  descriptionEn?: string;
  enabled: boolean;
}

export interface DiningItemSetting {
  id: string;
  nameKm: string;
  nameEn: string;
  cuisineKm: string;
  cuisineEn: string;
  hoursKm: string;
  hoursEn: string;
  dressCodeKm: string;
  dressCodeEn: string;
  taglineKm: string;
  taglineEn: string;
  descriptionKm: string;
  descriptionEn: string;
  signatureDishesKm: string | string[];
  signatureDishesEn: string | string[];
  priceRangeUSD?: string;
  imageUrl: string;
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
  adminPortalTitleKm?: string;
  adminPortalTitleEn?: string;
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

  // 4. Dining & Restaurants
  dining: DiningItemSetting[];

  // 5. Locations & Tourist Destinations
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

  _isUserCustomized?: boolean;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  hotelNameKm: "សណ្ឋាគារ វឌ្ឍនៈ (VVotel) កំពង់ចាម",
  hotelNameEn: "Vattanac Hotel (VVotel) Kampong Cham",
  hotelTaglineKm: "សណ្ឋាគារប្រណីតផ្កាយ ៥ មាត់ទន្លេមេគង្គ",
  hotelTaglineEn: "5-Star Luxury Riverside Resort & Spa",
  logoText: "VVOTEL",
  logoImageUrl: "/images/vvotel-logo.png?v=2",
  adminPortalTitleKm: "ប្រព័ន្ធគ្រប់គ្រងសណ្ឋាគារ និងភោជនីយដ្ឋាន VVotel",
  adminPortalTitleEn: "VVotel Central PMS Admin Portal",
  phone: "+855 (0) 42 982 999",
  email: "reservations@vvotel.com",
  addressKm: "ផ្ទះលេខ ២០៥២, ផ្លូវព្រះមុនីវង្ស, ភូមិ ៧, សង្កាត់បឹងកុក, ក្រុងកំពង់ចាម",
  addressEn: "No. 2052, Preah Monivong St., Phum 7, Sangkat Boeng Kok, Kampong Cham City",
  latitude: 11.99067,
  longitude: 105.46298,
  googleMapsUrl: "https://maps.google.com/?q=11.99067,105.46298",

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
      imageUrl: "/images/rooms/vv_standard_king.jpg",
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
      imageUrl: "/images/rooms/vv_superior_bed.jpg",
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
      imageUrl: "/images/rooms/vv_suite_bedroom.jpg",
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
      imageUrl: "/images/rooms/vv_family_space.jpg",
      availableCount: 4,
      enabled: true,
    },
  ],

  dining: [
    {
      id: "mekong-breeze",
      nameKm: "ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស",
      nameEn: "Mekong Breeze Restaurant",
      cuisineKm: "ម្ហូបខ្មែរបុរាណបែបព្រះបរមរាជវាំង & ម្ហូបអន្តរជាតិទំនើប",
      cuisineEn: "Authentic Khmer Royal Cuisine & Contemporary International",
      hoursKm: "អាហារពេលព្រឹក: ០៦:០០ - ១០:៣០ | ថ្ងៃត្រង់ & ពេលល្ងាច: ១១:៣០ - ២២:៣០",
      hoursEn: "Breakfast: 06:00 - 10:30 | Lunch & Dinner: 11:30 - 22:30",
      dressCodeKm: "សម្លៀកបំពាក់សមរម្យ",
      dressCodeEn: "Smart Casual",
      taglineKm: "ទទួលទានអាហារមាត់ទន្លេមេគង្គ ជាមួយត្រីទន្លេស្រស់ៗ និងបន្លែសរីរាង្គក្នុងតំបន់",
      taglineEn: "All-day riverside dining celebrating the freshest Mekong fish and organic produce",
      descriptionKm: "បែរមុខទៅរកផ្ទៃទន្លេមេគង្គ ភោជនីយដ្ឋាន មេគង្គប្រ៊ីស រួមបញ្ចូលគ្នានូវកេរដំណែលម្ហូបខ្មែរជាមួយរសជាតិបារាំងដ៏ឈ្ងុយឆ្ងាញ់។ ផ្តល់ជូនប៊ូហ្វេពេលព្រឹកស្រស់ៗ បង្កងទន្លេមេគង្គអាំង និងអាម៉ុកត្រីកែវប្រណីត។",
      descriptionEn: "Overlooking the sweeping waters of the Mekong, Mekong Breeze blends the rich culinary heritage of Cambodia with French gastronomic precision. Savor live-station buffet breakfasts, succulent river lobsters, and our renowned Steamed Fish Amok.",
      signatureDishesKm: "អាម៉ុកបង្កងទន្លេមេគង្គពិសេស, ការីសារ៉ាម៉ាន់សាច់គោផុយ, មឹកឆាម្រេចខ្ចីកំពត",
      signatureDishesEn: "Signature Mekong River Prawn Amok, Slow-Braised Beef Saraman Curry, Kampot Pepper Wok-Fried Squid",
      priceRangeUSD: "$12 - $45",
      imageUrl: "/images/rooms/vv_room_interior_1.jpg",
      enabled: true,
    },
    {
      id: "sunset-lounge",
      nameKm: "សាន់សិត រីវើឡោញ & បារបារី",
      nameEn: "Sunset River Lounge & Cigar Terrace",
      cuisineKm: "ស្រាក្រឡុកប្រណីត អាហារសម្រន់តាប៉ាស & ស្រាទំពាំងបាយជូរ",
      cuisineEn: "Artisan Cocktails, Tapas & Cellar Wines",
      hoursKm: "រៀងរាល់ថ្ងៃ: ១៦:០០ - ០០:០០ (អធ្រាត្រ)",
      hoursEn: "Daily: 16:00 - 00:00 (Midnight)",
      dressCodeKm: "សម្លៀកបំពាក់សុភាពទាន់សម័យ",
      dressCodeEn: "Casual Chic",
      taglineKm: "ចំណុចទស្សនាថ្ងៃលិចដ៏ស្រស់ស្អាតបំផុតក្នុងខេត្តកំពង់ចាម ជាមួយស្រាក្រឡុក",
      taglineEn: "The premier vantage point in Kampong Cham for golden sunset cocktails",
      descriptionKm: "ស្ថិតនៅលើរានឈើបែបទំនើបមាត់ទន្លេ សាន់សិត រីវើឡោញ គឺជាទីតាំងដ៏ស័ក្តិសមសម្រាប់លំហែកាយពេលព្រលប់។ រីករាយជាមួយស្រាក្រឡុកផ្សំពីក្រូចថ្លុងកោះប៉ែន ស្លឹកគ្រៃ និងម្រេចកំពត។",
      descriptionEn: "Perched above the riverfront with an open-air wooden deck, the Sunset Lounge is the ideal spot to unwind as the sky transforms into hues of violet and gold.",
      signatureDishesKm: "ស្រាក្រឡុកក្រូចថ្លុងកំពង់ចាម, ណែមទាស្លឹកគ្រៃមេគង្គបំពង, ឈីស & សាច់ក្រកស្ងួតអន្តរជាតិ",
      signatureDishesEn: "Kampong Cham Pomelo Spritz, Mekong Lemongrass Duck Spring Rolls, Artisan Cheese & Charcuterie Board",
      priceRangeUSD: "$8 - $28",
      imageUrl: "/images/rooms/vv_room_view.jpg",
      enabled: true,
    },
    {
      id: "palm-pool-bar",
      nameKm: "ផាម ភូលបារ & ហ្គ្រីល",
      nameEn: "Palm Pool Bar & Grill",
      cuisineKm: "ភេសជ្ជៈស្រស់ស្រាយ ទឹកផ្លែឈើស្រស់ & អាហារសម្រន់មាត់អាង",
      cuisineEn: "Tropical Smoothies, Wood-Fired Pizza & Poolside Bites",
      hoursKm: "រៀងរាល់ថ្ងៃ: ០៨:០០ - ២០:០០",
      hoursEn: "Daily: 08:00 - 20:00",
      dressCodeKm: "សម្លៀកបំពាក់ហែលទឹក / សមរម្យ",
      dressCodeEn: "Swimwear / Resort Casual",
      taglineKm: "សម្រាកក្បែរអាងហែលទឹកមាត់ទន្លេ ជាមួយដូងក្រអូប និងភីហ្សាដុតកម្តៅអុស",
      taglineEn: "Sun-drenched relaxation beside the infinity pool overlooking the Mekong",
      descriptionKm: "រីករាយជាមួយកម្តៅថ្ងៃក្បែរអាងហែលទឹកធំទូលាយ។ បម្រើជូនដូងស្រស់ពីកោះប៉ែន ស្រាក្រឡុកត្រូពិច ភីហ្សាដុតកម្តៅអុស និងប៊ឺហ្គឺសាច់គោប្រណីត។",
      descriptionEn: "Relax beside our riverside infinity pool while enjoying fresh coconut, wood-fired pizzas, gourmet burgers, and tropical refreshments.",
      signatureDishesKm: "ដូងស្រស់កោះប៉ែន, ភីហ្សាគ្រឿងសមុទ្រមេគង្គ, ប៊ឺហ្គឺសាច់គោវ៉ាក្យូអាំង",
      signatureDishesEn: "Fresh Koh Pen Coconut, Mekong Seafood Pizza, Wagyu Beef Burger",
      priceRangeUSD: "$6 - $22",
      imageUrl: "/images/rooms/vv_real_room_1280_4.jpg",
      enabled: true,
    },
    {
      id: "artisan-bakery",
      nameKm: "មេគង្គ អាទីសាន ខាហ្វេ & ប៊ែកខឺរី",
      nameEn: "Mekong Artisan Cafe & French Bakery",
      cuisineKm: "កាហ្វេតំបន់មណ្ឌលគិរី នំក្រូសង់បារាំង & តែរសជាតិខ្មែរ",
      cuisineEn: "Mondulkiri Single-Origin Coffee & Fresh Viennoiserie",
      hoursKm: "រៀងរាល់ថ្ងៃ: ០៦:៣០ - ១៨:០០",
      hoursEn: "Daily: 06:30 - 18:00",
      dressCodeKm: "សម្លៀកបំពាក់ធម្មតា",
      dressCodeEn: "Casual",
      taglineKm: "ក្លិនឈ្ងុយកាហ្វេស្រស់ និងនំប៉័ងដុតក្តៅៗរៀងរាល់ព្រឹក",
      taglineEn: "Morning aromas of fresh artisanal bakes and rich Cambodian coffee",
      descriptionKm: "កន្លែងទទួលទានកាហ្វេដ៏កក់ក្តៅ បម្រើជូនកាហ្វេប្រណីតពីខេត្តមណ្ឌលគិរី នំប៉័ងក្រូសង់បារាំងធ្វើថ្មីៗរាល់ថ្ងៃ និងបង្អែមខ្មែរទំនើប។",
      descriptionEn: "A charming boutique cafe offering handcrafted Mondulkiri coffee, authentic French viennoiseries, and contemporary Khmer desserts.",
      signatureDishesKm: "កាហ្វេទឹកដោះគោទឹកកកមណ្ឌលគិរី, នំក្រូសង់ប៊ឺរបារាំង, តាតផ្លែឈើត្រូពិច",
      signatureDishesEn: "Iced Mondulkiri Drip Coffee, Pure Butter French Croissant, Tropical Fruit Tart",
      priceRangeUSD: "$3.50 - $12",
      imageUrl: "/images/destinations/destiny-cafe.jpg",
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
      latitude: 11.9775,
      longitude: 105.4606,
      taglineKm: "ស្ពានឫស្សីធ្វើដោយដៃវែងជាងគេលើពិភពលោក",
      taglineEn: "World's longest seasonal handcrafted bamboo bridge",
      descriptionKm: "ដើរកម្សាន្ត ឬជិះកង់ឆ្លងកាត់ស្ពានឫស្សីបុរាណដែលកសាងឡើងដោយដើមឫស្សីជាង ៥០,០០០ ដើមរៀងរាល់រដូវប្រាំង ឆ្ពោះទៅកាន់កោះប៉ែនដ៏ស្រស់បំព្រង។",
      descriptionEn: "Cross the legendary seasonal bamboo bridge painstakingly crafted by local artisans with 50,000 bamboo poles every dry season.",
      imageUrl: "/images/destinations/bamboo-bridge.jpg",
      googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.99067,105.46298&destination=Koh+Pen+Bamboo+Bridge,+Kampong+Cham",
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
      latitude: 11.9999,
      longitude: 105.4391,
      taglineKm: "ប្រាសាទបុរាណសតវត្សរ៍ទី ១១ រួមបញ្ចូលជាមួយវត្តអារាមទំនើប",
      taglineEn: "11th-century Jayavarman VII sandstone temple with vibrant pagoda",
      descriptionKm: "ស្ថាបត្យកម្មដ៏កម្រនៃប្រាសាទថ្មភក់សម័យអង្គរដែលព័ទ្ធជុំវិញដោយព្រះវិហារពុទ្ធសាសនាដ៏ស្រស់ស្អាតនិងចម្លាក់ក្បាច់បុរាណ។",
      descriptionEn: "A magnificent juxtaposition where an ancient 11th-century Angkorian sandstone sanctuary integrates with an active modern Buddhist pagoda.",
      imageUrl: "/images/destinations/wat-nokor.jpg",
      googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.99067,105.46298&destination=Wat+Nokor+Bachey,+Kampong+Cham",
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
      latitude: 12.0303,
      longitude: 105.4167,
      taglineKm: "ភ្នំភ្លោះនៃរឿងព្រេងខ្មែរដណ្តឹងប្តីប្រពន្ធដ៏ល្បីល្បាញ",
      taglineEn: "Twin sacred hills embodying Cambodia's most beloved marital legend",
      descriptionKm: "ទស្សនាទេសភាពខេត្តកំពង់ចាមពីលើកំពូលភ្នំ ព្រះវិហាររៀបរយ និងរឿងនិទានប្រពៃណីនៃការប្រណាំងលើកដីធ្វើភ្នំ។",
      descriptionEn: "Explore sacred hilltop stupas and monkeys, immersed in the centuries-old folk legend of the gender competition to build the highest hill.",
      imageUrl: "/images/destinations/phnom-pros.jpg",
      googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.99067,105.46298&destination=Phnom+Pros,+Kampong+Cham",
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
      latitude: 12.1624,
      longitude: 105.5283,
      taglineKm: "ទិដ្ឋភាពទន្លេមេគង្គកោងដ៏ធំពីលើកំពូលភ្នំសតវត្សរ៍ទី ៨",
      taglineEn: "Pre-Angkorian Chenla shrine overlooking the serpentine Mekong bend",
      descriptionKm: "កន្លែងទេសភាពស្អាតបំផុតក្នុងខេត្តកំពង់ចាម មើលឃើញទន្លេមេគង្គដ៏ធំល្វឹងល្វើយ និងប្រាសាទឥដ្ឋសម័យចេនឡា។",
      descriptionEn: "Perched high above a sweeping Mekong bend, offering Cambodia's most breathtaking river vistas along with 8th-century Chenla brick sanctuaries.",
      imageUrl: "/images/destinations/phnom-hanchey.jpg",
      googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.99067,105.46298&destination=Wat+Hanchey,+Kampong+Cham",
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

  _isUserCustomized: false,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

/**
 * Aggressively sanitizes media URLs in SiteSettings to ensure local high-resolution
 * assets are always used, completely removing reliance on external CDN/Unsplash URLs.
 */
export function sanitizeMediaSettings(settings: any): SiteSettings {
  if (!settings || typeof settings !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const result: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    features: {
      ...DEFAULT_SETTINGS.features,
      ...(settings.features || {}),
    },
  };

  // 1. Hotel Logo: Ensure local high-resolution asset is used
  if (
    !result.logoImageUrl ||
    result.logoImageUrl.includes("website-files.com") ||
    result.logoImageUrl.includes("unsplash.com") ||
    result.logoImageUrl.startsWith("http://") ||
    result.logoImageUrl.startsWith("https://")
  ) {
    result.logoImageUrl = "/images/vvotel-logo.png?v=2";
  }

  // 2. Rooms: Enforce local room photography
  const roomFallbackMap: Record<string, string> = {
    "standard-city": "/images/rooms/vv_standard_king.jpg",
    "superior-river": "/images/rooms/vv_superior_bed.jpg",
    "executive-suite": "/images/rooms/vv_suite_bedroom.jpg",
    "royal-family-suite": "/images/rooms/vv_family_space.jpg",
    "royal-family": "/images/rooms/vv_family_space.jpg",
  };

  if (Array.isArray(result.rooms)) {
    result.rooms = result.rooms.map((r: any) => {
      const cleanRoom = { ...r };
      const fallback = roomFallbackMap[cleanRoom.id] || "/images/rooms/vv_deluxe_double.jpg";
      if (
        !cleanRoom.imageUrl ||
        cleanRoom.imageUrl.includes("unsplash.com") ||
        cleanRoom.imageUrl.includes("website-files.com") ||
        cleanRoom.imageUrl.startsWith("http://") ||
        cleanRoom.imageUrl.startsWith("https://")
      ) {
        cleanRoom.imageUrl = fallback;
      }
      return cleanRoom;
    });
  } else {
    result.rooms = DEFAULT_SETTINGS.rooms;
  }

  // 3. Dining: Enforce local restaurant and lounge photography
  const diningFallbackMap: Record<string, string> = {
    "mekong-breeze": "/images/rooms/vv_room_interior_1.jpg",
    "sunset-lounge": "/images/rooms/vv_room_view.jpg",
    "palm-pool-bar": "/images/rooms/vv_real_room_1280_4.jpg",
    "artisan-bakery": "/images/destinations/destiny-cafe.jpg",
  };

  if (Array.isArray(result.dining)) {
    result.dining = result.dining.map((d: any) => {
      const cleanDining = { ...d };
      const fallback = diningFallbackMap[cleanDining.id] || "/images/rooms/vv_room_interior_1.jpg";
      if (
        !cleanDining.imageUrl ||
        cleanDining.imageUrl.includes("unsplash.com") ||
        cleanDining.imageUrl.includes("website-files.com") ||
        cleanDining.imageUrl.startsWith("http://") ||
        cleanDining.imageUrl.startsWith("https://")
      ) {
        cleanDining.imageUrl = fallback;
      }
      return cleanDining;
    });
  } else {
    result.dining = DEFAULT_SETTINGS.dining;
  }

  // 4. Destinations: Enforce local attraction photography
  const destFallbackMap: Record<string, string> = {
    "koh-pen-bamboo-bridge": "/images/destinations/bamboo-bridge.jpg",
    "wat-nokor-bachey": "/images/destinations/wat-nokor.jpg",
    "phnom-srei-phnom-pros": "/images/destinations/phnom-pros.jpg",
    "phnom-hanchey": "/images/destinations/phnom-hanchey.jpg",
  };

  if (Array.isArray(result.destinations)) {
    result.destinations = result.destinations.map((d: any) => {
      const cleanDest = { ...d };
      const fallback = destFallbackMap[cleanDest.slug] || "/images/destinations/bamboo-bridge.jpg";
      if (
        !cleanDest.imageUrl ||
        cleanDest.imageUrl.includes("unsplash.com") ||
        cleanDest.imageUrl.includes("website-files.com") ||
        cleanDest.imageUrl.startsWith("http://") ||
        cleanDest.imageUrl.startsWith("https://")
      ) {
        cleanDest.imageUrl = fallback;
      }
      return cleanDest;
    });
  } else {
    result.destinations = DEFAULT_SETTINGS.destinations;
  }

  return result;
}

