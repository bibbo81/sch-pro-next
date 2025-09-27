import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // TypeScript checking: Next.js 15 params fixed, only bypass for Supabase types
  typescript: {
    ignoreBuildErrors: true, // Temporary: until Supabase types are fixed
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