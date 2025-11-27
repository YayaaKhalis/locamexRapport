import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.matixweb.fr',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
