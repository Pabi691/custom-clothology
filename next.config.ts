import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  
  output: 'export',
  trailingSlash: true,

  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'purepng.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kyletest.in',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
