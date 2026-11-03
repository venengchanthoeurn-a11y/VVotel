import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#0c2340",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Destination Guide - VVotel Kampong Cham Cambodia",
  description:
    "Discover Kampong Cham and its surroundings with VVotel Kampong Cham Riverside Resort. Explore Wat Nokor Bachey, Koh Pen Bamboo Bridge, Phnom Hanchey, Mekong sunset cruises, fine riverside dining, and rich cultural heritage.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VVotel",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  keywords: [
    "VVotel Kampong Cham",
    "Kampong Cham Hotel",
    "Mekong Riverside Resort",
    "Koh Pen Bamboo Bridge",
    "Wat Nokor Bachey",
    "Phnom Hanchey",
    "Kampong Cham Tourism",
    "Cambodia Destination Guide",
  ],
  authors: [{ name: "VVotel Hospitality Group" }],
  openGraph: {
    title: "Destination Guide - VVotel Kampong Cham Cambodia",
    description:
      "Explore Cambodia's Legendary Mekong Heartland with VVotel Kampong Cham. 20 Authentic local attractions, interactive map, and guided tours.",
    url: "https://vvotel-kampongcham.com/about-us/destination-guide/",
    siteName: "VVotel Kampong Cham Resort",
    locale: "km_KH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <AccessibilityProvider>
            {children}
            {/* PWA Floating Install Action */}
            <PwaInstallPrompt />
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
