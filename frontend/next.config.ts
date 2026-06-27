import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://divine-mane-naturals.onrender.com/api' 
        : 'http://localhost:5000/api');
    const cleanUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    return [
      {
        source: '/api/:path*',
        destination: `${cleanUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
