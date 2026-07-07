import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'dntech.id', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'www.dntech.id', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'api.dntech.id', pathname: '/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
