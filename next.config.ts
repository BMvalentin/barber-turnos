import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    serverActions: {
      // Permite recibir imágenes de configuración de hasta 20 MB antes de
      // validarlas y optimizarlas para su almacenamiento en Cloudinary.
      bodySizeLimit: '20mb',
    },
  },
  images: {
    // Dominios reales de imágenes del proyecto (verificados con grep en Fase 1.5)
    remotePatterns: [
      // Fondos por defecto (Hero, login, register)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Subidas vía src/lib/cloudinary-uploader.ts (secure_url)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Avatares de sesiones con Google OAuth (Header/Footer)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // Decisión Fase 1.5: se mantiene unoptimized: true. Todo el tráfico sale de CDN
    // (Unsplash/Cloudinary) y activar el optimizer global es un cambio de riesgo sin
    // ganancia acá. Pendiente opcional: f_auto/q_auto en URLs de Cloudinary.
    unoptimized: true,
  },
  // Headers de seguridad (Fase 7.3): el plan eligió next.config.ts en lugar de middleware.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // CSP moderada y funcional:
            // - 'unsafe-inline' en script/style: Next.js inyecta scripts de bootstrap inline
            //   (__next_f) y el proyecto usa estilos inline (style={{}}) + next/font.
            // - img-src https:: imágenes de CDN (images.unsplash.com, res.cloudinary.com,
            //   lh3.googleusercontent.com) y data:/blob: para recursos embebidos.
            // - connect-src https:: llamadas a APIs (Mercado Pago: api.mercadopago.com,
            //   auth.mercadopago.com.ar; webhooks propios). wa.me solo se navega, no aplica.
            // - frame-src https://www.google.com: único iframe del proyecto es el mapa
            //   (src/components/inicio/LocationSection.tsx, configurable vía mapsUrl).
            //   El checkout de MP se abre con window.open (pestaña nueva), sin iframe.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-src 'self' https://www.google.com",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            // Vercel sirve el sitio por https; preload requiere 2 años de vigencia.
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            // SAMEORIGIN permite el iframe del mapa (Google embebe el sitio ajeno, no al revés).
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
