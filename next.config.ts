import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Reserva de derechos sobre el contenido (ver LICENSE).
        // noai/noimageai y TDM-Reservation no afectan la indexación de Google Search.
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noai, noimageai' },
          { key: 'TDM-Reservation', value: '1' },
          {
            key: 'TDM-Policy',
            value: 'https://github.com/Chetti666/electro/blob/main/LICENSE',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
