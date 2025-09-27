import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable TypeScript checking during build only for deployment
  // Keep it enabled in development for safety
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
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