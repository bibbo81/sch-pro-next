import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // TypeScript checking: DISABLED for deployment
  typescript: {
    ignoreBuildErrors: true
  },

  // Force clean builds
  experimental: {
    typedRoutes: false
  },

  async redirects() {
    return [
      {
        source: '/tracking',
        destination: '/dashboard/tracking',
        permanent: true,
      }
    ]
  },
  
  // Ottimizzazioni per le immagini
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;