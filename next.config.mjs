/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://api-bakong.nbc.gov.kh https://api.telegram.org https://maps.googleapis.com https://nominatim.openstreetmap.org https://checkout.payway.com.kh https://checkout-sandbox.payway.com.kh;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://checkout.payway.com.kh https://checkout-sandbox.payway.com.kh;
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Skew Protection: Prevent Frontend-Backend Mismatches recommended by Vercel
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
  async headers() {
    return [
      {
        // Global security headers for all routes including root /
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Dynamic API routes must NEVER be cached stale at CDN edge to guarantee fresh real-time data
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "X-VVotel-API-Mode",
            value: "REALTIME-PMS-SYNC",
          },
        ],
      },
      {
        // Static assets CDN caching headers
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
