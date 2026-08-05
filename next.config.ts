import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    serverActions: {
      // El default es 1 MB y corta la subida de imágenes de configuración
      // antes de que la action pueda validar el tamaño.
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite cualquier hostname HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Permite cualquier hostname HTTP
      },
    ],
    unoptimized: true, // Desactiva optimización para simplificar
  },
};

export default nextConfig;