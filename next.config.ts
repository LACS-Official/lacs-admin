import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 最小化配置以避免构建问题
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': path.resolve(__dirname, 'lib'),
    };
    return config;
  },
};

export default nextConfig;
