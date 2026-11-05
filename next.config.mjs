/** @type {import('next').NextConfig} */
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
