# VVotel Kampong Cham Riverside Resort — Official Website & Destination Guide

A high-performance, luxury hospitality web platform built for **VVotel Kampong Cham**, replicating all features, UI/UX components, interactive mapping, booking engine, and destination guide from Accor's Novotel platform, tailored to **Kampong Cham, Cambodia**.

---

## 🚀 Technology Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router) + React 18** | Server-side rendering (SSR), static generation, and high-performance client interactivity. |
| **Styling** | **Tailwind CSS + Kantumruy Pro & Montserrat** | Authentic luxury Novotel design system with full bilingual Khmer & Latin typography. |
| **Backend** | **Node.js API Routes** | RESTful endpoints for destinations, single-item lookups, bookings, and newsletters. |
| **Caching Layer** | **Redis (ioredis) + Resilient In-Memory LRU Fallback** | Instant microsecond response times with TTL-based invalidation (`X-Cache: HIT-REDIS`). |
| **CDN & Edge** | **Edge Caching & Stale-While-Revalidate Headers** | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. |
| **Mapping** | **Leaflet & OpenStreetMap** | Interactive vector map with custom VVotel pin and 20 categorized destination markers. |

---

## 🌟 Key Features

1. **Accessibility Toolbar (ដូច Novotel 100%):**
   - **Contrast Modes:** Black & White (`contrast-bw`), Black & Yellow (`contrast-by`), and Default.
   - **Font & Spacing:** Dyslexia-friendly font toggle (`font-dyslexia`) and Large line/letter spacing (`spacing-large`).
   - **Reset All:** Instant one-click reset to default settings.

2. **Bilingual Khmer & English (ភាសាខ្មែរ & English):**
   - Full native Khmer translation for all navigation, titles, taglines, summaries, and descriptions.
   - Instant language switch modal including links to 14+ international language portals.

3. **Booking Engine & Instant Rate Calculator:**
   - Real-time arrival and departure date picker.
   - Room count and adult/children counter with individual child age dropdowns (0–12 years).
   - ALL loyalty card (16-digit) and Promo code discount calculator.
   - Instant confirmation popup with booking reference and free perks.

4. **Interactive Destination Map & Guide (២០ ទីតាំងពិតប្រាកដក្នុងខេត្តកំពង់ចាម):**
   - **Beaches & Nature (ឆ្នេរខ្សាច់ និងធម្មជាតិ):** Koh Pen Sandbars, Haong Waterfall, Chup Rubber Plantation, Koh Samrong River Island.
   - **Culture & Local Life (វប្បធម៌ និងជីវភាពរស់នៅ):** Wat Nokor Bachey (11th century), Phnom Hanchey / Wat Hanchey, Phnom Pros & Phnom Srei, Old French Watchtower, Psar Thom Central Market.
   - **Sports & Activities (កីឡា និងសកម្មភាព):** Koh Pen Bamboo Bridge, Koh Pen Cycling Tour, Mekong Sunset Boat Cruise, Riverfront Jogging Path, Mekong Kayaking Adventure.
   - **Restaurants & Dining (ភោជនីយដ្ឋាន និងអាហារដ្ឋាន):** Moon River Restaurant, Mekong Crossing Bistro, Smile Training Restaurant, Hao An Dim Sum, Mekong Riverside BBQ, Destiny Café & Bakery.

5. **Detail Slide-Over Modal:**
   - Rich descriptions, GPS coordinates, exact addresses, travel times, clickable phone numbers, and direct Google Maps navigation links.

6. **Loyalty Program & Newsletter:**
   - VVotel ALL - Accor Live Limitless promotional banner.
   - Newsletter subscription form connected to live backend API.

---

## 🛠️ How to Run Locally

```bash
# 1. Navigate to project directory
cd c:\xampp\htdocs\VVotel

# 2. Start production server (already built)
npm run start
# Website available at: http://localhost:3000

# 3. For development mode
npm run dev
```
