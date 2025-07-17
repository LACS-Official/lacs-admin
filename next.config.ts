import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 性能优化配置
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom'],
  },

  // 图片优化配置
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7天缓存
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 压缩配置
  compress: true,

  // 静态资源优化
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // 构建优化 (swcMinify 在 Next.js 13+ 中默认启用)
  // 字体优化 (在 Next.js 13+ 中默认启用)

  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 重定向配置
  async redirects() {
    return []
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
