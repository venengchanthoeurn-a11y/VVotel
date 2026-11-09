import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#0c2340",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vvhotel.vercel.app"),
  title: "Destination Guide - Vattanac Hotel (VVotel) Kampong Cham Cambodia",
  description:
    "Discover Kampong Cham with Vattanac Hotel (VVotel) located at No. 2052, Preah Monivong St., Phum 7, 030402, Kampong Cham City. Explore Wat Nokor Bachey, Koh Pen Bamboo Bridge, Phnom Hanchey, Mekong sunset cruises, fine dining, and luxury accommodation.",
  manifest: "/manifest.json?v=2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VVotel",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/images/vvotel-logo.svg?v=2", type: "image/svg+xml" },
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [{ url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
  },
  keywords: [
    "សណ្ឋាគារ វឌ្ឍនៈ",
    "VVotel",
    "Vattanac Hotel",
    "VVotel Kampong Cham",
    "No. 2052 Preah Monivong St",
    "Kampong Cham Hotel",
    "Koh Pen Bamboo Bridge",
    "Wat Nokor Bachey",
    "Phnom Hanchey",
    "Kampong Cham Tourism",
    "Cambodia Destination Guide",
  ],
  authors: [{ name: "Vattanac Hotel (VVotel) Group" }],
  openGraph: {
    title: "Destination Guide - Vattanac Hotel (VVotel) Kampong Cham Cambodia",
    description:
      "Explore Cambodia's Legendary Mekong Heartland with Vattanac Hotel (VVotel) Kampong Cham. Located at No. 2052, Preah Monivong St., Phum 7, 030402.",
    url: "https://vvhotel.vercel.app",
    siteName: "Vattanac Hotel (VVotel) Kampong Cham",
    images: [
      {
        url: "/icons/icon-512.png?v=2",
        width: 512,
        height: 512,
        alt: "Vattanac Hotel (VVotel) Logo",
      },
    ],
    locale: "km_KH",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vattanac Hotel (VVotel) Kampong Cham",
    description: "5-Star Luxury Riverside Resort & Spa in Kampong Cham, Cambodia",
    images: ["/icons/icon-512.png?v=2"],
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
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/svg+xml" href="/images/vvotel-logo.svg?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/manifest.json?v=2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Google Structured Data / Organization Schema for Search Result Logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hotel",
              "name": "Vattanac Hotel (VVotel) Kampong Cham",
              "alternateName": "សណ្ឋាគារ វឌ្ឍនៈ (VVotel)",
              "url": "https://vvhotel.vercel.app",
              "logo": "https://vvhotel.vercel.app/icons/icon-512.png?v=2",
              "image": "https://vvhotel.vercel.app/icons/icon-512.png?v=2",
              "description": "5-Star Luxury Riverside Resort & Spa in Kampong Cham City, Cambodia.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "No. 2052, Preah Monivong St., Phum 7, Sangkat Boeng Kok",
                "addressLocality": "Kampong Cham",
                "postalCode": "030402",
                "addressCountry": "KH",
              },
              "telephone": "+85542982999",
            }),
          }}
        />
      </head>
      <body>
        <SettingsProvider>
          <LanguageProvider>
            <AccessibilityProvider>
              {children}
              {/* PWA Floating Install Action */}
              <PwaInstallPrompt />
            </AccessibilityProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
