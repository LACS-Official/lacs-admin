import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 最小化配置以避免构建问题
  async rewrites() {
    return [
      {
        source: '/api/activation-codes/:path*',
        destination: 'https://api-g.lacs.cc/api/activation-codes/:path*',
      },
    ];
  },
};

export default nextConfig;
