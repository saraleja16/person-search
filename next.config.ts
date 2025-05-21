import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Only enable turbopack in development
  ...(process.env.NODE_ENV === 'development' ? {
    turbopack: {
      rules: {
        include: ['**/*'],
      },
      resolveAlias: {}
    }
  } : {}),
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;

