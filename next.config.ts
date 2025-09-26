import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Rimuovi completamente la configurazione turbo per ora
  // La configurazione corretta per Turbopack stabile è diversa
  
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