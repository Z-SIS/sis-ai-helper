import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add output standalone for better deployment compatibility
  output: 'standalone',
<<<<<<< HEAD
  // Fix Content Security Policy issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: https://vercel.live",
              "font-src 'self' data:",
              "connect-src 'self' https://api.google.com https://generativelanguage.googleapis.com https://api.tavily.com https://vercel.live wss://ws-us3.pusher.com wss://*.pusher.com",
              "frame-src 'self' https://vercel.live",
              "child-src 'self' https://vercel.live",
              "default-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
=======
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
};

export default nextConfig;
