export interface Destination {
  id: number;
  slug: string;
  category: "beaches-nature" | "sports-activities" | "culture-local-life" | "restaurants";
  categoryName: {
    en: string;
    km: string;
  };
  title: {
    en: string;
    km: string;
  };
  tagline: {
    en: string;
    km: string;
  };
  summary: {
    en: string;
    km: string;
  };
  fullDescription: {
    en: string;
    km: string;
  };
  distanceFromHotel: {
    en: string;
    km: string;
  };
  address: {
    en: string;
    km: string;
  };
  latitude: number;
  longitude: number;
  phone?: string;
  googleMapsUrl: string;
  websiteUrl?: string;
  imageUrl: string;
  travelTimeMinutes: number;
  highlightBadge?: {
    en: string;
    km: string;
  };
}

export const HOTEL_INFO = {
  name: {
    en: "VVotel Kampong Cham Riverside Hotel",
    km: "សណ្ឋាគារ វីវ៉ូថែល កំពង់ចាម មាត់ទន្លេ",
  },
  tagline: {
    en: "Luxury Riverside Hotel on the Legendary Mekong River",
    km: "សណ្ឋាគារប្រណីតជាប់មាត់ទន្លេមេគង្គដ៏ស្រស់បំព្រងនៃខេត្តកំពង់ចាម",
  },
  address: {
    en: "Riverfront Road, Phum 3, Sangkat Veal Vong, Kampong Cham City, Kampong Cham Province, Cambodia",
    km: "ផ្លូវមាត់ទន្លេ, ភូមិ ៣, សង្កាត់វាលវង់, ក្រុងកំពង់ចាម, ខេត្តកំពង់ចាម, ប្រទេសកម្ពុជា",
  },
  latitude: 11.9930,
  longitude: 105.4635,
  phone: "+855 (0) 42 982 999",
  email: "reservations@vvotel-kampongcham.com",
  stars: 5,
};

export const DESTINATIONS: Destination[] = [
  // 1. Beaches & Nature (ទន្លេ កោះ និងធម្មជាតិ)
  {
    id: 1,
    slug: "koh-pen-sandbars-beach",
    category: "beaches-nature",
    categoryName: {
      en: "Beaches & Nature",
      km: "ឆ្នេរខ្សាច់ និងធម្មជាតិ",
    },
    title: {
      en: "Koh Pen Island Beach & Sandbars",
      km: "ឆ្នេរខ្សាច់ និងកោះប៉ែន",
    },
    tagline: {
      en: "Golden river sandbars and tropical orchards",
      km: "ឆ្នេរខ្សាច់មាសកណ្តាលទន្លេ និងចម្ការផ្លែឈើត្រូពិច",
    },
    summary: {
      en: "Escape to Koh Pen for tranquil freshwater sandbars, shaded hammocks, and lush pomelo orchards right in the heart of the Mekong River.",
      km: "គេចចេញពីភាពអ៊ូអរមកកាន់កោះប៉ែន ដើម្បីទទួលយកបទពិសោធន៍ឆ្នេរខ្សាច់មាសទន្លេមេគង្គ សម្រាកលើអង្រឹងក្រោមម្លប់ និងចម្ការក្រូចថ្លុងដ៏ខៀវស្រងាត់។",
    },
    fullDescription: {
      en: "During the dry season, the receding Mekong River unveils vast sweeps of golden sandbars at Koh Pen. Guests can swim in calm river currents, lounge in thatched cabanas, rent floating tubes, and taste fresh Mekong river fish. The interior of the island is dotted with traditional Khmer stilt wooden houses, weaving workshops, and friendly farming villages. 10 minutes from VVotel across the bridge.",
      km: "នៅរដូវប្រាំង ផ្ទៃទឹកទន្លេមេគង្គស្រកចុះបានបង្កើតជាឆ្នេរខ្សាច់ដ៏ធំល្វឹងល្វើយនៅកោះប៉ែន។ ភ្ញៀវអាចហែលទឹកលេងយ៉ាងមានសុវត្ថិភាព សម្រាកលើរានស្បូវ ជួលពោងទឹក និងពិសាម្ហូបត្រីទន្លេស្រស់ៗ។ លើកោះសម្បូរផ្ទះបុរាណខ្មែរ កន្លែងត្បាញក្រមា និងភូមិកសិករដ៏រួសរាយ។ ចំណាយពេលត្រឹម ១០ នាទីពីសណ្ឋាគារ VVotel ឆ្លងកាត់ស្ពាន។",
    },
    distanceFromHotel: {
      en: "10 minutes by Tuk-Tuk / Bike",
      km: "១០ នាទី តាមម៉ូតូកង់បី ឬកង់",
    },
    address: {
      en: "Koh Pen Island, Kampong Siem District, Kampong Cham",
      km: "កោះប៉ែន, ស្រុកកំពង់សៀម, ខេត្តកំពង់ចាម",
    },
    latitude: 11.9790,
    longitude: 105.4715,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9790,105.4715",
    imageUrl: "/images/destinations/koh-pen-beach.jpg",
    travelTimeMinutes: 10,
    highlightBadge: {
      en: "Top Pick",
      km: "ពេញនិយមបំផុត",
    },
  },
  {
    id: 2,
    slug: "haong-waterfall-ecotourism",
    category: "beaches-nature",
    categoryName: {
      en: "Beaches & Nature",
      km: "ឆ្នេរខ្សាច់ និងធម្មជាតិ",
    },
    title: {
      en: "Haong Waterfall & Natural Resort",
      km: "រមណីយដ្ឋានទឹកធ្លាក់ហោង",
    },
    tagline: {
      en: "Forest streams and natural cascades",
      km: "ទឹកធ្លាក់ហូរត្រជាក់ស្រេងកណ្តាលព្រៃព្រឹក្សា",
    },
    summary: {
      en: "Nestled within rocky forest ravines in Memot district, Haong Waterfall is a serene getaway featuring multi-tiered natural cascades and a forested shrine.",
      km: "ព័ទ្ធជុំវិញដោយជ្រលងថ្ម និងព្រៃឈើខៀវស្រងាត់ ទឹកធ្លាក់ហោងជាទីឋានសម្រាកលំហែបែបធម្មជាតិ មានទឹកហូរច្រើនថ្នាក់ និងអាស្រមសក្ការៈបូជា។",
    },
    fullDescription: {
      en: "Surrounded by lush forest and scenic rubber hills, Haong Waterfall is a beloved natural retreat for families and nature lovers. Clear waters tumble over stepped rock formations into refreshing bathing pools. Picnic huts line the water's edge where visitors can savor bamboo sticky rice (Kralan), roasted organic chicken, and cold fresh coconuts. Guided half-day trips are bookable at VVotel Reception. Approximately 45 minutes by private taxi.",
      km: "ហ៊ុមព័ទ្ធដោយព្រៃឈើធម្មជាតិ និងជួរចម្ការកៅស៊ូ ទឹកធ្លាក់ហោងជារមណីយដ្ឋានធម្មជាតិដ៏ពេញនិយមសម្រាប់គ្រួសារ និងអ្នកស្រលាញ់បរិស្ថាន។ ទឹកថ្លាឈ្វេងហូរកាត់ផ្ទាំងថ្មធំៗ បង្កើតជាអាងទឹកធម្មជាតិត្រជាក់ស្រេង។ នៅតាមមាត់ទឹកមានខ្ចុះសម្រាកលំហែ និងមានលក់ក្រឡាន មាន់ដុតស្រែ និងដូងខ្ចី។ អាចកក់កញ្ចប់ទស្សនកិច្ចកន្លះថ្ងៃនៅ Reception សណ្ឋាគារ VVotel (ធ្វើដំណើរប្រមាណ ៤៥ នាទីតាមតាក់ស៊ី)។",
    },
    distanceFromHotel: {
      en: "45 minutes by taxi",
      km: "៤៥ នាទី តាមរថយន្តតាក់ស៊ី",
    },
    address: {
      en: "Haong Natural Park, Memot, Kampong Cham Province",
      km: "រមណីយដ្ឋានទឹកធ្លាក់ហោង, ស្រុកមេមត់, ខេត្តកំពង់ចាម",
    },
    latitude: 11.9214,
    longitude: 105.8562,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9214,105.8562",
    imageUrl: "/images/destinations/haong-waterfall.jpg",
    travelTimeMinutes: 45,
  },
  {
    id: 3,
    slug: "chup-rubber-plantation",
    category: "beaches-nature",
    categoryName: {
      en: "Beaches & Nature",
      km: "ឆ្នេរខ្សាច់ និងធម្មជាតិ",
    },
    title: {
      en: "Chup Rubber Plantation & Green Canopy",
      km: "ចម្ការកៅស៊ូជប់ និងផ្លូវរូងរុក្ខជាតិបៃតង",
    },
    tagline: {
      en: "Endless rows of historical rubber forests",
      km: "ជួរព្រៃកៅស៊ូដ៏ធំល្វឹងល្វើយប្រកបដោយប្រវត្តិសាស្ត្រ",
    },
    summary: {
      en: "One of the largest rubber plantations in Southeast Asia, offering endless shaded cathedral-like tree arches and peaceful cycling lanes.",
      km: "ចម្ការកៅស៊ូធំជាងគេមួយនៅអាស៊ីអាគ្នេយ៍ ដែលមានដើមឈើដុះជាជួរទ្រុបទ្រុលបង្កើតជាដំបូលរុក្ខជាតិដ៏ត្រជាក់ និងផ្លូវជិះកង់ដ៏ស្ងប់ស្ងាត់។",
    },
    fullDescription: {
      en: "Established during the French protectorate in the 1920s, Chup Rubber Plantation features miles of majestic, symmetrically planted rubber trees that create an enchanting natural canopy. Discover how natural latex is harvested by skilled tappers at dawn, and explore the red volcanic basaltic soil trails that are perfect for scenic photography and cycling adventures. 25 minutes from VVotel.",
      km: "បានបង្កើតឡើងក្នុងសម័យអាណានិគមបារាំងនៅទសវត្សរ៍ឆ្នាំ ១៩២០ ចម្ការកៅស៊ូជប់មានដើមកៅស៊ូរាប់លានដើមដាំជាជួរត្រង់ភ្លឹង បង្កើតបានជាដំបូលធម្មជាតិដ៏ស្រស់ត្រកាល។ ភ្ញៀវអាចទស្សនាការចៀរជ័រនៅពេលព្រលឹម និងជិះកង់លើផ្លូវដីក្រហមស្ងប់ស្ងាត់សម្រាប់ថតរូបអនុស្សាវរីយ៍។ ចម្ងាយ ២៥ នាទីពីសណ្ឋាគារ VVotel។",
    },
    distanceFromHotel: {
      en: "25 minutes by taxi / Tuk-Tuk",
      km: "២៥ នាទី តាមតាក់ស៊ី ឬកង់បី",
    },
    address: {
      en: "National Road 7, Tbong Khmum District, Kampong Cham Region",
      km: "ផ្លូវជាតិលេខ ៧, ត្បូងឃ្មុំ, តំបន់កំពង់ចាម",
    },
    latitude: 11.9682,
    longitude: 105.6543,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9682,105.6543",
    imageUrl: "/images/destinations/chup-rubber.jpg",
    travelTimeMinutes: 25,
  },
  {
    id: 4,
    slug: "upper-mekong-river-islands",
    category: "beaches-nature",
    categoryName: {
      en: "Beaches & Nature",
      km: "ឆ្នេរខ្សាច់ និងធម្មជាតិ",
    },
    title: {
      en: "Koh Samrong & Mekong River Ecosystem",
      km: "កោះសំរោង និងប្រព័ន្ធអេកូឡូស៊ីទន្លេមេគង្គ",
    },
    tagline: {
      en: "Pristine freshwater river islands and migratory bird sanctuary",
      km: "កោះធម្មជាតិកណ្តាលទន្លេមេគង្គ និងជម្រកសត្វស្លាបទឹក",
    },
    summary: {
      en: "An idyllic, car-free river island north of the city offering organic vegetable gardens, quiet bamboo groves, and refreshing river currents.",
      km: "កោះធម្មជាតិគ្មានផ្សែងរថយន្តនៅភាគខាងជើងក្រុង សម្បូរទៅដោយចម្ការបន្លែសរីរាង្គ គុម្ពឫស្សី និងចរន្តទឹកទន្លេដ៏ស្រស់ស្រាយ។",
    },
    fullDescription: {
      en: "Koh Samrong is an authentic rural sanctuary connected by a newly built bridge and ferry docks. Stroll among fertile alluvial farms growing sweet mangoes, passionfruit, and river herbs. In the late afternoon, white egrets and kingfishers gather along the sandy banks. Guests can take an eco-friendly wooden boat cruise from VVotel's private pier directly to Koh Samrong.",
      km: "កោះសំរោងជាតំបន់កោះធម្មជាតិដ៏ស្ងប់ស្ងាត់ ភ្ជាប់ដោយស្ពានបេតុងថ្មី និងសាឡាងចម្លង។ ភ្ញៀវអាចដើរកម្សាន្តក្នុងចម្ការដំណាំដីល្បាប់មាន ស្វាយ, ផ្លូវត្រសក់, និងបន្លែបង្ការគ្រប់មុខ។ នៅពេលរសៀល សត្វកុក និងសត្វស្លាបទន្លេប្រមូលផ្តុំគ្នានៅតាមឆ្នេរខ្សាច់។ អាចជិះទូកឈើអេកូទេសចរណ៍ពីផែផ្ទាល់របស់ VVotel ទៅដល់ទីនោះ។",
    },
    distanceFromHotel: {
      en: "15 minutes by boat or car",
      km: "១៥ នាទី តាមទូក ឬរថយន្ត",
    },
    address: {
      en: "Koh Samrong Commune, Kampong Siem, Kampong Cham",
      km: "ឃុំកោះសំរោង, ស្រុកកំពង់សៀម, ខេត្តកំពង់ចាម",
    },
    latitude: 12.0450,
    longitude: 105.4780,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=12.0450,105.4780",
    imageUrl: "/images/destinations/koh-samrong.jpg",
    travelTimeMinutes: 15,
  },

  // 2. Culture & Local Life (វប្បធម៌ និងជីវភាពរស់នៅ)
  {
    id: 5,
    slug: "wat-nokor-bachey",
    category: "culture-local-life",
    categoryName: {
      en: "Culture & Local Life",
      km: "វប្បធម៌ និងជីវភាពរស់នៅ",
    },
    title: {
      en: "Wat Nokor Bachey Temple",
      km: "ប្រាសាទវត្តនគរបាជ័យ",
    },
    tagline: {
      en: "11th-century Angkorian sandstone masterpiece",
      km: "ស្នាដៃស្ថាបត្យកម្មថ្មភក់សម័យអង្គរនៃសតវត្សរ៍ទី ១១",
    },
    summary: {
      en: "A mesmerizing historical complex where an ancient 11th-century Mahayana Buddhist temple blends seamlessly with a vibrant contemporary Khmer pagoda.",
      km: "រមណីយដ្ឋានប្រវត្តិសាស្ត្រដ៏អស្ចារ្យដែលប្រាសាទថ្មបុរាណសម័យអង្គរស្ថិតនៅបញ្ចូលគ្នាជាមួយវត្តអារាមព្រះពុទ្ធសាសនាខ្មែរសម័យទំនើប។",
    },
    fullDescription: {
      en: "Built during the reign of King Jayavarman VII, Wat Nokor Bachey showcases intricately carved black sandstone bas-reliefs, lotus flower towers, and peaceful cloisters. Inside the ancient inner sanctuary, colorful modern Buddhist frescoes and golden statues have been built harmoniously within the millennium-old stone corridors. A truly spiritual and architectural wonder, only 10 minutes from VVotel.",
      km: "កសាងឡើងក្នុងរជ្ជកាលព្រះបាទជ័យវរ្ម័នទី ៧ ប្រាសាទនគរបាជ័យមានចម្លាក់ថ្មភក់ពណ៌ខ្មៅរៀបរាប់ពីរឿងរ៉ាវទេវកថា កំពូលផ្កាឈូក និងថែវបុរាណ។ នៅខាងក្នុងប្រាសាទថ្មបុរាណ មានវត្តអារាមទំនើបដែលមានគំនូរបុរាណពណ៌ស្រស់ឆើតឆាយ និងព្រះពុទ្ធបដិមាពណ៌មាស។ ជាទីតាំងសក្ការៈ និងជាអច្ឆរិយវប្បធម៌ដែលស្ថិតនៅត្រឹម ១០ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "10 minutes by Tuk-Tuk / Taxi",
      km: "១០ នាទី តាមម៉ូតូកង់បី ឬតាក់ស៊ី",
    },
    address: {
      en: "National Road 7, Sangkat Sambour Meas, Kampong Cham City",
      km: "ផ្លូវជាតិលេខ ៧, សង្កាត់សំបួរមាស, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9967,
    longitude: 105.4339,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9967,105.4339",
    imageUrl: "/images/destinations/wat-nokor.jpg",
    travelTimeMinutes: 10,
    highlightBadge: {
      en: "Must Visit",
      km: "កន្លែងត្រូវតែទៅ",
    },
  },
  {
    id: 6,
    slug: "phnom-hanchey-temple",
    category: "culture-local-life",
    categoryName: {
      en: "Culture & Local Life",
      km: "វប្បធម៌ និងជីវភាពរស់នៅ",
    },
    title: {
      en: "Phnom Hanchey / Wat Hanchey",
      km: "វត្តភ្នំហាន់ជ័យ",
    },
    tagline: {
      en: "Pre-Angkorian hilltop sanctuary with panoramic Mekong views",
      km: "វត្តបុរាណលើកំពូលភ្នំសម័យមុនអង្គរ អមដោយទេសភាពទន្លេមេគង្គ ៣៦០ ដឺក្រេ",
    },
    summary: {
      en: "Perched high on a scenic hill overlooking a sweeping bend of the Mekong River, Phnom Hanchey features 8th-century Chenla brick temples and serene gardens.",
      km: "ស្ថិតនៅលើកំពូលភ្នំខ្ពស់ដែលមើលឃើញកំហោងទន្លេមេគង្គយ៉ាងស្រស់ស្អាត វត្តភ្នំហាន់ជ័យមានប្រាសាទឥដ្ឋសម័យចេនឡាពីសតវត្សរ៍ទី ៨ និងសួនច្បារដ៏ស្ងប់ស្ងាត់។",
    },
    fullDescription: {
      en: "Wat Hanchey dates back to the Chenla Empire (8th century) and offers one of the most breathtaking panoramic views in all of Cambodia. Wander among ancient red-brick shrines, giant whimsical fruit and animal statues, and enjoy chanting monks at sunrise. VVotel organizes morning blessing tours to Phnom Hanchey followed by a picnic breakfast over the Mekong. 35 minutes by car or 45 minutes by riverboat.",
      km: "វត្តភ្នំហាន់ជ័យមានប្រភពដើមតាំងពីសម័យអាណាចក្រចេនឡា (សតវត្សរ៍ទី ៨) និងផ្តល់នូវទេសភាពមាត់ទន្លេមេគង្គយ៉ាងធំល្វឹងល្វើយស្រស់ស្អាតបំផុតនៅកម្ពុជា។ ភ្ញៀវអាចទស្សនាប្រាសាទឥដ្ឋបុរាណ រូបចម្លាក់ផ្លែឈើ និងសត្វយក្សប្លែកៗ និងស្តាប់ព្រះសង្ឃសូត្រធម៌ពេលព្រឹក។ សណ្ឋាគារ VVotel មានរៀបចំទួរស្រោចទឹកសុំពរជ័យ និងអាហារពេលព្រឹក Picnic នៅលើភ្នំនេះ។ ចំណាយពេល ៣៥ នាទីតាមរថយន្ត។",
    },
    distanceFromHotel: {
      en: "35 minutes by taxi / car",
      km: "៣៥ នាទី តាមរថយន្ត",
    },
    address: {
      en: "Hanchey Mountain, Kampong Siem District, Kampong Cham",
      km: "ភ្នំហាន់ជ័យ, ស្រុកកំពង់សៀម, ខេត្តកំពង់ចាម",
    },
    latitude: 12.1150,
    longitude: 105.5120,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=12.1150,105.5120",
    imageUrl: "/images/destinations/phnom-hanchey.jpg",
    travelTimeMinutes: 35,
    highlightBadge: {
      en: "Top Scenery",
      km: "ទេសភាពស្អាតដាច់គេ",
    },
  },
  {
    id: 7,
    slug: "phnom-pros-phnom-srei",
    category: "culture-local-life",
    categoryName: {
      en: "Culture & Local Life",
      km: "វប្បធម៌ និងជីវភាពរស់នៅ",
    },
    title: {
      en: "Phnom Pros & Phnom Srei",
      km: "រមណីយដ្ឋានភ្នំប្រុស ភ្នំស្រី",
    },
    tagline: {
      en: "Twin legendary hills rich in Khmer folklore",
      km: "ភ្នំភ្លោះនៃរឿងព្រេងនិទានប្រពៃណីខ្មែរ",
    },
    summary: {
      en: "Famous twin hills tied to the legendary Khmer folk story about wedding proposal customs, crowned with golden pagodas, monkeys, and Buddha statues.",
      km: "ភ្នំភ្លោះដ៏ល្បីល្បាញជាប់ទាក់ទងនឹងរឿងព្រេងបុរាណស្តីពីទំនៀមទម្លាប់ចូលស្តីដណ្តឹងរៀបការ មានវត្តអារាមពណ៌មាស ហ្វូងសត្វស្វា និងព្រះពុទ្ធបដិមាធំៗ។",
    },
    fullDescription: {
      en: "Phnom Pros (Man Hill) and Phnom Srei (Woman Hill) are rooted in a famous Khmer folk tale where men and women competed to build a hill before the morning star rose to decide who would propose marriage. Today, Phnom Pros features playful macaque monkeys, shaded stupas, and a reclining Buddha, while Phnom Srei offers 308 steps leading to a breathtaking hilltop view across the plains. 15 minutes from VVotel.",
      km: "ភ្នំប្រុស និងភ្នំស្រី កើតចេញពីរឿងព្រេងដែលបុរស និងស្ត្រីប្រកួតគ្នាលើកភ្នំឱ្យហើយមុនផ្កាយព្រឹករះ ដើម្បីកំណត់ថាខាងណាត្រូវចូលស្តីដណ្តឹងមុន។ បច្ចុប្បន្ន ភ្នំប្រុសមានហ្វូងសត្វស្វារួសរាយ ចេតិយបុរាណ និងព្រះពុទ្ធចូលនិព្វាន រីឯភ្នំស្រីមានជណ្តើរ ៣០៨ កាំឡើងទៅកាន់កំពូលភ្នំដើម្បីគយគន់ទេសភាពស្រែចម្ការដ៏ខៀវស្រងាត់។ ធ្វើដំណើរត្រឹម ១៥ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "15 minutes by Tuk-Tuk / Taxi",
      km: "១៥ នាទី តាមម៉ូតូកង់បី ឬតាក់ស៊ី",
    },
    address: {
      en: "Krala Commune, Kampong Siem District, Kampong Cham",
      km: "ឃុំក្រឡា, ស្រុកកំពង់សៀម, ខេត្តកំពង់ចាម",
    },
    latitude: 12.0167,
    longitude: 105.4056,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=12.0167,105.4056",
    imageUrl: "/images/destinations/phnom-pros.jpg",
    travelTimeMinutes: 15,
  },
  {
    id: 8,
    slug: "french-colonial-watchtower-quarter",
    category: "culture-local-life",
    categoryName: {
      en: "Culture & Local Life",
      km: "វប្បធម៌ និងជីវភាពរស់នៅ",
    },
    title: {
      en: "Old French Watchtower & Colonial Quarter",
      km: "ប៉មយាមបារាំងបុរាណ និងអគារសម័យអាណានិគម",
    },
    tagline: {
      en: "1900s riverside heritage and architectural legacy",
      km: "បេតិកភណ្ឌមាត់ទន្លេសតវត្សរ៍ទី ២០ និងស្ថាបត្យកម្មសម័យអាណានិគម",
    },
    summary: {
      en: "A historic red-brick lookout tower built on the banks of the Mekong in the early 1900s, surrounded by French colonial shophouses and yellow-shuttered villas.",
      km: "ប៉មសង្កេតការណ៍ឥដ្ឋក្រហមបុរាណកសាងនៅដើមទសវត្សរ៍ឆ្នាំ ១៩០០ នៅមាត់ទន្លេមេគង្គ ហ៊ុមព័ទ្ធដោយអគារពាណិជ្ជកម្ម និងផ្ទះវីឡាបារាំងបុរាណពណ៌លឿង។",
    },
    fullDescription: {
      en: "Constructed to monitor traffic along the Mekong River during the French Protectorate, this iconic red brick tower has weathered over a century of history. Visitors can climb the narrow metal stairs to the observation platform for a scenic vista of the river and Kizuna Bridge. The adjacent neighborhood contains Kampong Cham's best-preserved French colonial administrative buildings and nostalgic coffee shops. Just a 5-minute riverside walk from VVotel.",
      km: "កសាងឡើងដើម្បីតាមដានចរាចរណ៍នាវាតាមដងទន្លេមេគង្គក្នុងសម័យបារាំង ប៉មឥដ្ឋក្រហមប្រវត្តិសាស្ត្រនេះមានអាយុកាលជាងមួយសតវត្សរ៍។ ភ្ញៀវអាចឡើងជណ្តើរដែកខាងក្នុងទៅកាន់វេទិកាសង្កេតការណ៍ដើម្បីទស្សនាទិដ្ឋភាពទន្លេ និងស្ពានគីហ្សូណា។ ជុំវិញនោះមានអគាររដ្ឋបាលបារាំងបុរាណ និងហាងកាហ្វេរសជាតិដើម។ អាចដើរត្រឹម ៥ នាទីពីមាត់ទន្លេសណ្ឋាគារ VVotel។",
    },
    distanceFromHotel: {
      en: "5 minutes walk along the riverfront",
      km: "៥ នាទី ដើរថ្មើរជើងតាមមាត់ទន្លេ",
    },
    address: {
      en: "Riverfront Promenade, Village 2, Sangkat Boeng Kok, Kampong Cham City",
      km: "ផ្លូវមាត់ទន្លេ, ភូមិ ២, សង្កាត់បឹងកុក, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9880,
    longitude: 105.4640,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9880,105.4640",
    imageUrl: "/images/destinations/french-watchtower.jpg",
    travelTimeMinutes: 5,
  },
  {
    id: 9,
    slug: "kampong-cham-central-market-psar-thom",
    category: "culture-local-life",
    categoryName: {
      en: "Culture & Local Life",
      km: "វប្បធម៌ និងជីវភាពរស់នៅ",
    },
    title: {
      en: "Psar Thom Central Market & Night Market",
      km: "ផ្សារធំកំពង់ចាម និងផ្សាររាត្រី",
    },
    tagline: {
      en: "Authentic local market energy and street food paradise",
      km: "ផ្សារប្រពៃណីដ៏អ៊ូអរ និងឋានសួគ៌ម្ហូបអាហារតាមដងផ្លូវ",
    },
    summary: {
      en: "Immerse yourself in everyday Cambodian commerce at Psar Thom, filled with tropical fruits, local krama textiles, river fish, and evening street food.",
      km: "ស្វែងយល់ពីជីវភាពរស់នៅពិតប្រាកដរបស់ពលរដ្ឋកំពង់ចាមនៅផ្សារធំ សម្បូរទៅដោយផ្លែឈើស្រស់ៗ ក្រមាត្បាញដោយដៃ ត្រីទន្លេ និងអាហារសម្រន់ពេលរាត្រី។",
    },
    fullDescription: {
      en: "Psar Thom is the lively commercial heartbeat of Kampong Cham. In the morning, watch local vendors bargain over freshly caught giant Mekong river prawns, sweet mangosteens, and fragrant spices. At night, the riverside square transforms into a vibrant night bazaar with sizzling Khmer pancakes (Banh Chhev), skewers, noodle soups, and sugarcane juice. Included in VVotel's Guided City Walking Tour. 6 minutes by Tuk-Tuk.",
      km: "ផ្សារធំជាបេះដូងពាណិជ្ជកម្មដ៏រស់រវើកនៃក្រុងកំពង់ចាម។ ពេលព្រឹក ភ្ញៀវអាចទស្សនាទិដ្ឋភាពទិញលក់បង្កងទន្លេធំៗ ផ្លែឈើស្រស់ៗ និងគ្រឿងទេសឈ្ងុយឆ្ងាញ់។ ពេលយប់ បរិវេណមាត់ទន្លែក្លាយជាផ្សាររាត្រីដ៏អ៊ូអរ មានលក់នំគ្រក់ បាញ់ឆែវ សាច់អាំង មីគោក និងទឹកអំពៅ។ ស្ថិតនៅក្នុងកម្មវិធី City Walking Tour របស់ VVotel (៦ នាទីតាមកង់បី)។",
    },
    distanceFromHotel: {
      en: "6 minutes by Tuk-Tuk",
      km: "៦ នាទី តាមម៉ូតូកង់បី",
    },
    address: {
      en: "Center of Kampong Cham City, Near Preah Sihanouk Boulevard",
      km: "កណ្តាលក្រុងកំពង់ចាម, ក្បែរមហាវិថីព្រះសីហនុ",
    },
    latitude: 11.9912,
    longitude: 105.4601,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9912,105.4601",
    imageUrl: "/images/destinations/central-market.jpg",
    travelTimeMinutes: 6,
  },

  // 3. Sports & Activities (កីឡា និងសកម្មភាពកម្សាន្ត)
  {
    id: 10,
    slug: "koh-pen-bamboo-bridge",
    category: "sports-activities",
    categoryName: {
      en: "Sports & Activities",
      km: "កីឡា និងសកម្មភាពកម្សាន្ត",
    },
    title: {
      en: "Koh Pen Bamboo Bridge Experience",
      km: "ស្ពានឫស្សីកោះប៉ែន និងដំណើរថ្មើរជើង",
    },
    tagline: {
      en: "World's most famous handcrafted seasonal bamboo bridge",
      km: "ស្ពានឫស្សីបុរាណធ្វើដោយដៃដ៏ល្បីល្បាញបំផុតលើពិភពលោក",
    },
    summary: {
      en: "Walk across the legendary seasonal bamboo bridge meticulously built by local artisans using 50,000 bamboo poles every dry season.",
      km: "ដើរឆ្លងកាត់ស្ពានឫស្សីតាមរដូវកាលដ៏អស្ចារ្យ ដែលសាងសង់ឡើងដោយដៃអ្នកភូមិដោយប្រើដើមឫស្សីជាង ៥០,០០០ ដើមជារៀងរាល់រដូវប្រាំង។",
    },
    fullDescription: {
      en: "For generations, the people of Kampong Cham rebuilt the world's longest bamboo bridge across the raging Mekong every dry season, only to watch it wash away during monsoon floods. Walking or bicycling across this engineering marvel with the rhythmic creak of bamboo underfoot is an unforgettable sensory experience. Bicycles can be borrowed complimentary from VVotel Concierge. 7 minutes from VVotel.",
      km: "អស់ជាច្រើនជំនាន់មកហើយ អ្នកភូមិកំពង់ចាមបានរួមគ្នាសង់ស្ពានឫស្សីវែងជាងគេលើពិភពលោកឆ្លងកាត់ទន្លេមេគង្គក្នុងរដូវប្រាំង ហើយរុះរើវិញនៅរដូវវស្សា។ ការដើរ ឬជិះកង់កាត់ស្ពាននេះ អមដោយសូរសៀងរលកទឹក និងសំឡេងឫស្សីកកិតគ្នា គឺជាបទពិសោធន៍ដ៏រំភើបអស្ចារ្យ។ ភ្ញៀវសណ្ឋាគារ VVotel អាចខ្ចីកង់ជិះដោយឥតគិតថ្លៃនៅផ្នែក Concierge។ ៧ នាទីពីសណ្ឋាគារ។",
    },
    distanceFromHotel: {
      en: "7 minutes by bicycle / Tuk-Tuk",
      km: "៧ នាទី តាមកង់ ឬម៉ូតូកង់បី",
    },
    address: {
      en: "Riverfront at Koh Pen Crossing, Kampong Cham City",
      km: "មាត់ទន្លេ កន្លែងឆ្លងទៅកោះប៉ែន, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9835,
    longitude: 105.4678,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9835,105.4678",
    imageUrl: "/images/destinations/bamboo-bridge.jpg",
    travelTimeMinutes: 7,
    highlightBadge: {
      en: "Iconic Experience",
      km: "បទពិសោធន៍និមិត្តរូប",
    },
  },
  {
    id: 11,
    slug: "koh-pen-island-cycling-tour",
    category: "sports-activities",
    categoryName: {
      en: "Sports & Activities",
      km: "កីឡា និងសកម្មភាពកម្សាន្ត",
    },
    title: {
      en: "Koh Pen Island Cycling Tour",
      km: "ដំណើរកម្សាន្តជិះកង់ជុំវិញកោះប៉ែន",
    },
    tagline: {
      en: "Shaded pastoral bike trails through traditional village life",
      km: "ជិះកង់តាមផ្លូវលំម្លប់ត្រឈឹងត្រឈៃកាត់ភូមិឋានបុរាណខ្មែរ",
    },
    summary: {
      en: "Pedal along tranquil dirt paths shaded by betel palms, visit silk weaving co-ops, sample fresh sugarcane, and experience genuine rural hospitality.",
      km: "ជិះកង់តាមផ្លូវលំស្ងប់ស្ងាត់ក្រោមម្លប់ដើមស្លា ទស្សនាកន្លែងត្បាញសូត្រ និងក្រមា ភ្លក់ទឹកអំពៅស្រស់ និងទទួលយកស្នាមញញឹមដ៏កក់ក្តៅរបស់អ្នកស្រុក។",
    },
    fullDescription: {
      en: "VVotel offers daily guided half-day cycling tours around the island of Koh Pen. Riders will pass through traditional stilt-house villages, meet artisans weaving cotton scarves on wooden looms, and pedal through fruit orchards laden with dragonfruit and pomelo. The terrain is flat, relaxing, and suitable for all fitness levels and families. Quality multi-gear helmets and hybrid touring bicycles are provided.",
      km: "សណ្ឋាគារ VVotel មានរៀបចំទួរជិះកង់កន្លះថ្ងៃជារៀងរាល់ថ្ងៃជុំវិញកោះប៉ែន។ អ្នកជិះកង់នឹងបានឆ្លងកាត់ភូមិផ្ទះបុរាណខ្មែរ ជួបសិប្បករត្បាញក្រមាលើកីតម្បាញឈើ និងជិះកាត់ចម្ការផ្លែស្រកានាគ និងក្រូចថ្លុង។ ផ្លូវរាបស្មើ ងាយស្រួលជិះ និងស័ក្តិសមសម្រាប់មនុស្សគ្រប់វ័យ និងក្រុមគ្រួសារ។ មានបំពាក់មួកសុវត្ថិភាព និងកង់ទេសចរណ៍គុណភាពខ្ពស់។",
    },
    distanceFromHotel: {
      en: "Starts directly from VVotel Tour Desk",
      km: "ចេញដំណើរផ្ទាល់ពីតុទេសចរណ៍ VVotel",
    },
    address: {
      en: "VVotel Tour Hub, Riverfront Road, Kampong Cham",
      km: "ការិយាល័យទេសចរណ៍ VVotel, ផ្លូវមាត់ទន្លេ, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9930,
    longitude: 105.4635,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9930,105.4635",
    imageUrl: "/images/destinations/koh-pen-cycling.jpg",
    travelTimeMinutes: 5,
  },
  {
    id: 12,
    slug: "mekong-sunset-boat-cruise",
    category: "sports-activities",
    categoryName: {
      en: "Sports & Activities",
      km: "កីឡា និងសកម្មភាពកម្សាន្ត",
    },
    title: {
      en: "Mekong Sunset Boat Cruise",
      km: "ទូកកម្សាន្តទស្សនាថ្ងៃលិចលើដងទន្លេមេគង្គ",
    },
    tagline: {
      en: "Sunset cocktails, gentle breezes, and river scenery",
      km: "ក្រេបស្រាក្រឡុកគយគន់ថ្ងៃរៀបលិច និងខ្យល់ត្រជាក់លើផ្ទៃទឹកទន្លេ",
    },
    summary: {
      en: "Board a traditional teakwood cruiser at dusk for a 90-minute voyage beneath Kizuna Bridge and along the serene riverbanks with drinks and canapés.",
      km: "ឡើងជិះទូកឈើប្រណីតនៅពេលរសៀល ដើម្បីធ្វើដំណើរ ៩០ នាទីកាត់ក្រោមស្ពានគីហ្សូណា និងតាមដងទន្លេ អមដោយភេសជ្ជៈ និងអាហារសម្រន់។",
    },
    fullDescription: {
      en: "Experience the timeless beauty of the Mekong River aboard the VVotel Sunset Cruiser. As the sun dips into liquid gold over the horizon, glide past fishermen hauling in their cast nets, golden pagodas illuminated on distant bluffs, and the illuminated arches of Kizuna Bridge. Free-flow chilled wine, craft beers, fruit skewers, and Khmer savory snacks are served on board. Departs daily at 4:45 PM from VVotel Private Pier.",
      km: "ទទួលយកបទពិសោធន៍ដ៏រ៉ូមែនទិកលើផ្ទៃទន្លេមេគង្គជាមួយទូក VVotel Sunset Cruiser។ នៅពេលព្រះអាទិត្យរៀបលិចពណ៌មាសឆ្អិនឆ្អៅ ទូកនឹងជិះកាត់អ្នកនេសាទកំពុងបង់សំណាញ់ ទស្សនាវត្តអារាមលើច្រាំងទន្លេ និងពន្លឺភ្លើងស្ពានគីហ្សូណា។ មានបម្រើស្រាក្រហម ស្រាបៀរ និងអាហារសម្រន់ខ្មែរឆ្ងាញ់ៗ។ ចេញដំណើរជារៀងរាល់ថ្ងៃនៅម៉ោង ៤:៤៥ រសៀលពីផែទូកសណ្ឋាគារ VVotel។",
    },
    distanceFromHotel: {
      en: "Departs from VVotel Riverfront Pier",
      km: "ចេញដំណើរពីផែទូកផ្ទាល់របស់សណ្ឋាគារ VVotel",
    },
    address: {
      en: "VVotel River Pier, Riverfront Road, Kampong Cham",
      km: "ផែទូក VVotel, ផ្លូវមាត់ទន្លេ, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9935,
    longitude: 105.4642,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9935,105.4642",
    imageUrl: "/images/destinations/sunset-cruise.jpg",
    travelTimeMinutes: 2,
    highlightBadge: {
      en: "Signature Tour",
      km: "សេវាកម្មពិសេស",
    },
  },
  {
    id: 13,
    slug: "riverfront-jogging-path-kampong-cham",
    category: "sports-activities",
    categoryName: {
      en: "Sports & Activities",
      km: "កីឡា និងសកម្មភាពកម្សាន្ត",
    },
    title: {
      en: "Mekong Riverfront Jogging Path",
      km: "ផ្លូវរត់ហាត់ប្រាណមាត់ទន្លេមេគង្គ",
    },
    tagline: {
      en: "Breezy riverside promenade for morning runs",
      km: "ផ្លូវថ្មើរជើងមាត់ទន្លេដ៏ស្រស់ស្រាយសម្រាប់ការរត់ហាត់ប្រាណពេលព្រឹក",
    },
    summary: {
      en: "A continuous 4-kilometer landscaped riverside promenade equipped with public exercise stations, wide walking paths, and sweeping river views.",
      km: "ផ្លូវថ្មើរជើងកែលម្អយ៉ាងស្រស់ស្អាតប្រវែង ៤ គីឡូម៉ែត្រតាមមាត់ទន្លេ មានឧបករណ៍ហាត់ប្រាណសាធារណៈ និងទេសភាពទន្លេធំទូលាយ។",
    },
    fullDescription: {
      en: "Directly accessible from VVotel's front entrance, the Kampong Cham riverfront promenade is the favorite morning and evening gathering spot for joggers, brisk walkers, and fitness enthusiasts. Enjoy the brisk dawn breeze blowing off the Mekong, watch monks walking on morning alms rounds, and cool down with a fresh young coconut from waterfront fruit vendors. Illuminated at night for secure evening strolls.",
      km: "អាចដើរចេញផ្ទាល់ពីច្រកចូលខាងមុខសណ្ឋាគារ VVotel ផ្លូវថ្មើរជើងមាត់ទន្លេក្រុងកំពង់ចាមជាទីកន្លែងពេញនិយមបំផុតសម្រាប់អ្នករត់ហាត់ប្រាណ និងដើរលំហែពេលព្រឹក និងពេលល្ងាច។ ទទួលយកខ្យល់អាកាសបរិសុទ្ធបក់ពីទន្លេមេគង្គ ទស្សនាព្រះសង្ឃនិមន្តបិណ្ឌបាតពេលព្រឹកព្រលឹម និងពិសារទឹកដូងស្រស់ពីអ្នកលក់តាមមាត់ទឹក។ មានភ្លើងបំភ្លឺពេញមួយយប់ប្រកបដោយសុវត្ថិភាព។",
    },
    distanceFromHotel: {
      en: "Immediate access right in front of the hotel",
      km: "នៅមុខសណ្ឋាគារ VVotel ផ្ទាល់",
    },
    address: {
      en: "Riverfront Boulevard, Kampong Cham City",
      km: "មហាវិថីមាត់ទន្លេ, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9925,
    longitude: 105.4638,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9925,105.4638",
    imageUrl: "/images/destinations/riverfront-jogging.jpg",
    travelTimeMinutes: 1,
  },
  {
    id: 14,
    slug: "mekong-kayaking-adventure",
    category: "sports-activities",
    categoryName: {
      en: "Sports & Activities",
      km: "កីឡា និងសកម្មភាពកម្សាន្ត",
    },
    title: {
      en: "Mekong Kayaking & Paddle Adventure",
      km: "ជិះទូកកាយ៉ាក់ផ្សងព្រេងលើដងទន្លេមេគង្គ",
    },
    tagline: {
      en: "Explore hidden sandbars and island channels by paddle",
      km: "ចែវទូកកាយ៉ាក់រុករកឆ្នេរខ្សាច់ និងប្រឡាយធម្មជាតិកណ្តាលកោះ",
    },
    summary: {
      en: "Rent single or double touring kayaks from VVotel to explore the gentle channels between Koh Pen, sandbanks, and small fishing hamlets.",
      km: "ជួលទូកកាយ៉ាក់សម្រាប់ជិះម្នាក់ឯង ឬពីរនាក់ពីសណ្ឋាគារ VVotel ដើម្បីចែវរុករកប្រឡាយទឹកធម្មជាតិចន្លោះកោះប៉ែន និងភូមិនេសាទ។",
    },
    fullDescription: {
      en: "Paddle at your own pace through calm river coves and seasonal sandbanks around Koh Pen and Koh Thma. Equipped with life vests, dry bags, and professional route maps, our watersport center provides safety briefings and support boats. Ideal for both beginners and experienced paddlers wanting an active, immersive nature experience. Bookable at VVotel Concierge.",
      km: "ចែវទូកតាមចំណង់ចំណូលចិត្តកាត់តាមដៃទន្លេស្ងប់ស្ងាត់ និងកូនកោះខ្សាច់ជុំវិញកោះប៉ែន និងកោះថ្ម។ មានបំពាក់អាវពោងសុវត្ថិភាព កាតាបការពារជម្រាបទឹក និងផែនទីផ្លូវទឹកច្បាស់លាស់ ព្រមទាំងមានទូកអមការពារសុវត្ថិភាព។ ស័ក្តិសមសម្រាប់ទាំងអ្នកទើបចាប់ផ្តើមដំបូង និងអ្នកមានបទពិសោធន៍។ អាចកក់បាននៅផ្នែក Concierge នៃសណ្ឋាគារ VVotel។",
    },
    distanceFromHotel: {
      en: "Departs from VVotel Water Sports Desk",
      km: "ចេញដំណើរពីមណ្ឌលកីឡាទឹក VVotel",
    },
    address: {
      en: "VVotel River Pier, Kampong Cham",
      km: "ផែទឹក VVotel, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9932,
    longitude: 105.4645,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9932,105.4645",
    imageUrl: "/images/destinations/mekong-kayaking.jpg",
    travelTimeMinutes: 2,
  },

  // 4. Restaurants & Dining (ភោជនីយដ្ឋាន និងអាហារដ្ឋាន)
  {
    id: 15,
    slug: "moon-river-restaurant-lounge",
    category: "restaurants",
    categoryName: {
      en: "Restaurants & Dining",
      km: "ភោជនីយដ្ឋាន និងអាហារដ្ឋាន",
    },
    title: {
      en: "Moon River Restaurant & Lounge",
      km: "ភោជនីយដ្ឋាន ម៉ូនរីវើ (Moon River)",
    },
    tagline: {
      en: "Exquisite French-Khmer fusion overlooking the river",
      km: "ម្ហូបខ្មែរ-បារាំងបែបច្នៃប្រឌិតខ្ពស់ អមដោយទេសភាពទន្លេ",
    },
    summary: {
      en: "A premier riverside dining institution offering Kampot pepper river fish, French duck confit, premium steaks, and an exceptional global wine cellar.",
      km: "ភោជនីយដ្ឋានមាត់ទន្លេដ៏ល្បីល្បាញ បម្រើម្ហូបត្រីទន្លេម្រេចកំពត ទាខ្វៃបារាំង សាច់គោស្តេក និងស្រាក្រហមនាំចូលលំដាប់ពិភពលោក។",
    },
    fullDescription: {
      en: "Set in a beautifully restored two-story colonial building along the riverfront, Moon River is celebrated for its romantic ambiance and culinary finesse. Signature dishes include fresh Mekong fish amok steamed in banana leaves, ribeye steak with green pepper sauce, and mango flambé. Enjoy alfresco balcony seating with sweeping vistas of Kizuna Bridge sparkling at night. 4 minutes from VVotel.",
      km: "ស្ថិតនៅក្នុងអគារអាណានិគមបារាំងកម្ពស់ ២ ជាន់ដ៏ស្រស់ស្អាតជាប់មាត់ទន្លេ ភោជនីយដ្ឋាន Moon River ល្បីល្បាញខាងបរិយាកាសរ៉ូមែនទិក និងរសជាតិម្ហូបដ៏ឆ្ងាញ់ពិសា។ មុខម្ហូបប្រចាំហាងរួមមាន អាម៉ុកត្រីទន្លេខ្ចប់ស្លឹកចេក សាច់គោស្តេកទឹកជ្រលក់ម្រេចខ្ចី និងបង្អែមស្វាយដុតភ្លើង។ មានកន្លែងអង្គុយលើរានហាលមើលឃើញស្ពានគីហ្សូណាបំភ្លឺភ្លើងពេលយប់។ ៤ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "4 minutes by Tuk-Tuk / walk",
      km: "៤ នាទី តាមកង់បី ឬដើរថ្មើរជើង",
    },
    address: {
      en: "Riverfront Street, Sangkat Kampong Cham, Kampong Cham City",
      km: "ផ្លូវមាត់ទន្លេ, សង្កាត់កំពង់ចាម, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9902,
    longitude: 105.4641,
    phone: "+855 (0) 42 941 238",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9902,105.4641",
    websiteUrl: "https://vvotel-kampongcham.com/dining/moon-river",
    imageUrl: "/images/destinations/moon-river.jpg",
    travelTimeMinutes: 4,
    highlightBadge: {
      en: "Fine Dining",
      km: "អាហារកម្រិតខ្ពស់",
    },
  },
  {
    id: 16,
    slug: "mekong-crossing-bistro-bar",
    category: "restaurants",
    categoryName: {
      en: "Restaurants & Dining",
      km: "ភោជនីយដ្ឋាន និងអាហារដ្ឋាន",
    },
    title: {
      en: "Mekong Crossing Restaurant & Bar",
      km: "ភោជនីយដ្ឋាន មេគង្គ ក្រសស៊ីង",
    },
    tagline: {
      en: "Lively hub for artisan burgers, craft beers, and authentic curries",
      km: "ប៊ីស្ត្រូមាត់ទន្លេដ៏រីករាយ សម្បូរបឺហ្គឺរសាច់គោ ស្រាបៀរ និងការីខ្មែរ",
    },
    summary: {
      en: "A longtime expat and traveler favorite located directly across from the riverfront park, serving hearty Western pub fare, woodfired pizzas, and cold draft beers.",
      km: "ទីតាំងពេញនិយមជាយូរមកហើយសម្រាប់ភ្ញៀវទេសចរអន្តរជាតិ បម្រើភីហ្សាដុតកម្តៅភ្លើងអុស បឺហ្គឺរ និងស្រាបៀរត្រជាក់ៗ។",
    },
    fullDescription: {
      en: "With its breezy open-air layout and friendly international team, Mekong Crossing is the social heartbeat of town. Feast on homemade pasta, authentic Cambodian Lok Lak with Kampot black pepper, and thin-crust pizzas baked to crispy perfection. It is a fantastic spot to swap travel stories, catch live sports games, or sip cold sundowner cocktails. 5 minutes walk from VVotel.",
      km: "មានទីធ្លាបើកចំហទទួលខ្យល់ទន្លេ និងបុគ្គលិករួសរាយរាក់ទាក់ ភោជនីយដ្ឋាន Mekong Crossing ជាកន្លែងជួបជុំដ៏កក់ក្តៅ។ មុខម្ហូបល្បីៗមាន ប៉ាស្តាធ្វើដោយដៃ ឡុកឡាក់សាច់គោម្រេចខ្មៅកំពត និងភីហ្សាបែបអ៊ីតាលី។ ជាទីកន្លែងដ៏ល្អសម្រាប់ជជែកកម្សាន្ត មើលកីឡា និងក្រេបស្រាក្រឡុកពេលល្ងាច។ ដើរត្រឹម ៥ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "5 minutes walk",
      km: "៥ នាទី ដើរថ្មើរជើង",
    },
    address: {
      en: "Street 3, Riverfront Corner, Kampong Cham City",
      km: "ផ្លូវលេខ ៣, កែងមាត់ទន្លេ, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9895,
    longitude: 105.4644,
    phone: "+855 (0) 42 730 088",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9895,105.4644",
    imageUrl: "/images/destinations/mekong-crossing.jpg",
    travelTimeMinutes: 5,
  },
  {
    id: 17,
    slug: "smile-restaurant-training-center",
    category: "restaurants",
    categoryName: {
      en: "Restaurants & Dining",
      km: "ភោជនីយដ្ឋាន និងអាហារដ្ឋាន",
    },
    title: {
      en: "Smile Restaurant (Vocational Training Center)",
      km: "ភោជនីយដ្ឋាន ស្មាយ (Smile Restaurant)",
    },
    tagline: {
      en: "Heartwarming Cambodian dining supporting underprivileged youth",
      km: "ម្ហូបខ្មែរឈ្ងុយឆ្ងាញ់ប្រកបដោយក្តីស្រឡាញ់ គាំទ្រដល់យុវជនខ្វះខាត",
    },
    summary: {
      en: "A social enterprise vocational training restaurant run by Buddhism for Social Development Action (BSDA), serving delightful traditional Khmer recipes.",
      km: "ភោជនីយដ្ឋានសង្គមបណ្តុះបណ្តាលវិជ្ជាជីវៈដំណើរការដោយអង្គការ BSDA បម្រើម្ហូបប្រពៃណីខ្មែរដ៏ឆ្ងាញ់ពិសា និងសេវាកម្មប្រកបដោយស្នាមញញឹម។",
    },
    fullDescription: {
      en: "Similar to Sandan in Sihanoukville, Smile Restaurant is a non-profit training cafe empowering disadvantaged local youth with professional culinary and hospitality skills. Diners rave about the aromatic banana blossom salad, fragrant chicken curry with crusty baguettes, and fresh seasonal fruit shakes. Dining here directly supports education and sustainable livelihoods in Kampong Cham province. 6 minutes by Tuk-Tuk.",
      km: "ស្រដៀងគ្នានឹងភោជនីយដ្ឋាន Sandan នៅខេត្តព្រះសីហនុដែរ ភោជនីយដ្ឋាន Smile គឺជាមជ្ឈមណ្ឌលបណ្តុះបណ្តាលវិជ្ជាជីវៈមិនស្វែងរកប្រាក់ចំណេញ ជួយបង្រៀនយុវជនក្រីក្រឱ្យចេះជំនាញធ្វើម្ហូប និងបដិសណ្ឋារកិច្ច។ ភ្ញៀវកោតសរសើរញាំត្រយូងចេក ការីសាច់មាន់ញ៉ាំជាមួយនំប៉័ងស្រួយ និងទឹកក្រឡុកផ្លែឈើស្រស់ៗ។ រាល់ការពិសាអាហារនៅទីនេះ គឺបានជួយឧបត្ថម្ភដល់ការអប់រំយុវជនកម្ពុជា។ ៦ នាទីតាមកង់បី។",
    },
    distanceFromHotel: {
      en: "6 minutes by Tuk-Tuk",
      km: "៦ នាទី តាមម៉ូតូកង់បី",
    },
    address: {
      en: "Riverfront North Road, Village 1, Kampong Cham City",
      km: "ផ្លូវមាត់ទន្លេខាងជើង, ភូមិ ១, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9980,
    longitude: 105.4618,
    phone: "+855 (0) 42 941 455",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9980,105.4618",
    imageUrl: "/images/destinations/smile-restaurant.jpg",
    travelTimeMinutes: 6,
    highlightBadge: {
      en: "Social Impact",
      km: "ជួយសង្គម",
    },
  },
  {
    id: 18,
    slug: "hao-an-chinese-dim-sum",
    category: "restaurants",
    categoryName: {
      en: "Restaurants & Dining",
      km: "ភោជនីយដ្ឋាន និងអាហារដ្ឋាន",
    },
    title: {
      en: "Hao An Restaurant (Chinese & Dim Sum)",
      km: "ភោជនីយដ្ឋាន ហាវអាន (ចិន & ឌីមសាំ)",
    },
    tagline: {
      en: "Handmade morning dim sum and Cantonese specialties",
      km: "ឌីមសាំចំហុយក្តៅៗធ្វើដោយដៃ និងម្ហូបក្វាងទុងរសជាតិដើម",
    },
    summary: {
      en: "A bustling morning favorite renowned for steaming bamboo baskets of shrimp dumplings (Har Gow), pork buns, and handmade noodle soups.",
      km: "ហាងអាហារពេលព្រឹកដ៏ល្បីល្បាញប្រចាំក្រុង សម្បូរទៅដោយឌីមសាំចំហុយក្នុងឡាំងឫស្សី ហាកាវបង្កង នំប៉ាវ និងមីស៊ុបធ្វើដោយដៃ។",
    },
    fullDescription: {
      en: "Hao An continues Kampong Cham's century-old Chinese culinary traditions. Early risers gather here for authentic Siu Mai, Xiao Long Bao soup dumplings, crispy roasted pork, and fragrant jasmine tea. The air-conditioned interior is bright, clean, and family-friendly, making it an ideal venue for large family gatherings or a quick hearty breakfast before setting out on your day tours. 5 minutes from VVotel.",
      km: "ហាងហាវអានរក្សានូវប្រពៃណីម្ហូបចិនដែលមានអាយុកាលរាប់សិបឆ្នាំនៅកំពង់ចាម។ អ្នកចូលចិត្តអាហារពេលព្រឹកតែងមកទីនេះដើម្បីពិសាស៊ីវម៉ៃ នំប៉ាវស៊ុប សាច់ជ្រូកខ្វៃស្រួយ និងតែផ្កាម្លិះឈ្ងុយឆ្ងាញ់។ បន្ទប់ម៉ាស៊ីនត្រជាក់ស្អាតទូលាយ ស័ក្តិសមសម្រាប់គ្រួសារ និងការញ៉ាំអាហារពេលព្រឹកមុនពេលចេញដំណើរដើរកម្សាន្ត។ ៥ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "5 minutes by Tuk-Tuk / Taxi",
      km: "៥ នាទី តាមម៉ូតូកង់បី ឬតាក់ស៊ី",
    },
    address: {
      en: "Street 5, Near Central Market, Kampong Cham City",
      km: "ផ្លូវលេខ ៥, ក្បែរផ្សារធំ, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9918,
    longitude: 105.4589,
    phone: "+855 (0) 42 941 789",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9918,105.4589",
    imageUrl: "/images/destinations/hao-an-dimsum.jpg",
    travelTimeMinutes: 5,
  },
  {
    id: 19,
    slug: "mekong-riverside-bbq-and-fish",
    category: "restaurants",
    categoryName: {
      en: "Restaurants & Dining",
      km: "ភោជនីយដ្ឋាន និងអាហារដ្ឋាន",
    },
    title: {
      en: "Mekong Riverside Fish & BBQ",
      km: "អាហារដ្ឋានត្រីអាំង និងសាច់អាំងមាត់ទន្លេមេគង្គ",
    },
    tagline: {
      en: "Freshly caught river fish and authentic charcoal grills",
      km: "ត្រីទន្លេស្រស់ៗអាំងលើចង្ក្រានធ្យូង និងទឹកត្រីកោះកុងរសជាតិមុតស្រួច",
    },
    summary: {
      en: "An open-air evening culinary hotspot right on the water's edge, renowned for whole grilled river fish wrapped in fresh herbs and sweet rice paper.",
      km: "ទីតាំងញ៉ាំអាហារពេលល្ងាចជាប់មាត់ទឹកដ៏ពេញនិយម ល្បីល្បាញដោយសារត្រីដំរី និងត្រីប្រាអាំងស្រស់ៗ ញ៉ាំជាមួយបន្លែស្រស់ និងទឹកត្រីកោះកុង។",
    },
    fullDescription: {
      en: "For an authentic Cambodian evening experience, this riverside open-air eatery specializes in live river fish selected directly from water tanks. Order a whole grilled Sandat or Trei Damrei seasoned with coarse sea salt and lemongrass, wrapped with green bananas, starfruit, and local mint. Paired with ice-cold Angkor beer, it offers an unpretentious, lively dining atmosphere popular with local foodies. 3 minutes from VVotel.",
      km: "សម្រាប់បទពិសោធន៍ញ៉ាំអាហារបែបស្រុកស្រែពិតៗពេលល្ងាច អាហារដ្ឋានមាត់ទឹកនេះមានអាងចិញ្ចឹមត្រីទន្លេរស់ៗ។ មុខម្ហូបពិសេសគឺត្រីដំរី ឬត្រីសណ្តាយអាំងអំបិលម្ទេសញ៉ាំផ្ទាប់ជាមួយផ្លែចេកខ្ចី ផ្លែខ្វិត និងជីរគ្រប់មុខ ជ្រលក់ទឹកត្រីអំពិលទុំ ឬទឹកត្រីកោះកុង។ រីករាយជាមួយស្រាបៀរត្រជាក់ៗ និងខ្យល់ទន្លេ។ ៣ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "3 minutes walk along the river",
      km: "៣ នាទី ដើរតាមផ្លូវមាត់ទន្លេ",
    },
    address: {
      en: "Riverside Promenade South, Kampong Cham City",
      km: "ផ្លូវមាត់ទន្លេខាងត្បូង, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9865,
    longitude: 105.4655,
    phone: "+855 (0) 12 888 234",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9865,105.4655",
    imageUrl: "/images/destinations/mekong-bbq.jpg",
    travelTimeMinutes: 3,
  },
  {
    id: 20,
    slug: "destiny-cafe-and-bakery",
    category: "restaurants",
    categoryName: {
      en: "Restaurants & Dining",
      km: "ភោជនីយដ្ឋាន និងអាហារដ្ឋាន",
    },
    title: {
      en: "Destiny Café & Artisan Bakery",
      km: "ដេសទីនី កាហ្វេ និងហាងនំប៉័ង (Destiny Cafe)",
    },
    tagline: {
      en: "Specialty Mondulkiri coffee, French croissants, and air-conditioned tranquility",
      km: "កាហ្វេពិសេសមណ្ឌលគិរី នំក្រូសង់បារាំង និងបន្ទប់ម៉ាស៊ីនត្រជាក់ដ៏ស្ងប់ស្ងាត់",
    },
    summary: {
      en: "A chic, contemporary boutique cafe offering freshly roasted Cambodian highland coffee, sourdough paninis, cold pressed juices, and decadent pastries.",
      km: "ហាងកាហ្វេដ៏ទាក់ទាញ បម្រើកាហ្វេលីងថ្មីៗពីតំបន់ភ្នំមណ្ឌលគិរី នំប៉័ងបែបបារាំង ទឹកផ្លែឈើច្របាច់ស្រស់ និងនំខេកឆ្ងាញ់ៗ។",
    },
    fullDescription: {
      en: "When you crave a specialty flat white, iced coconut latte, or flaky butter croissant, Destiny Café is your haven. Complete with blazing-fast Wi-Fi, cozy reading corners, and sustainable organic ingredients, it is a favorite pitstop for digital nomads and hotel guests alike. Takeaway picnic baskets for island excursions can be ordered here. Only 4 minutes walk from VVotel.",
      km: "នៅពេលដែលអ្នកចង់ក្រេបកាហ្វេឡាតេទឹកដូង ឬកាហ្វេទឹកដោះគោត្រជាក់ និងនំក្រូសង់ប៊័រស្រួយៗ ហាង Destiny Café គឺជាជម្រើសដ៏ល្អឥតខ្ចោះ។ បំពាក់ដោយ Wi-Fi ល្បឿនលឿន កន្លែងអានសៀវភៅ និងគ្រឿងផ្សំសរីរាង្គ។ ភ្ញៀវអាចកុម្ម៉ង់កន្ត្រកអាហារ Picnic យកទៅកោះប៉ែនបានផងដែរ។ ដើរត្រឹម ៤ នាទីពី VVotel។",
    },
    distanceFromHotel: {
      en: "4 minutes walk",
      km: "៤ នាទី ដើរថ្មើរជើង",
    },
    address: {
      en: "Street 2, Near Riverside Boulevard, Kampong Cham City",
      km: "ផ្លូវលេខ ២, ក្បែរមហាវិថីមាត់ទន្លេ, ក្រុងកំពង់ចាម",
    },
    latitude: 11.9908,
    longitude: 105.4625,
    phone: "+855 (0) 42 941 112",
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&origin=11.9930,105.4635&destination=11.9908,105.4625",
    imageUrl: "/images/destinations/destiny-cafe.jpg",
    travelTimeMinutes: 4,
  },
];
