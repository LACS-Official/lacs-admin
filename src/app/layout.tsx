import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LACS Admin - GitHub OAuth 登录",
  description: "安全、快速的 GitHub OAuth 身份验证系统",
  keywords: ["GitHub", "OAuth", "登录", "身份验证", "LACS"],
  authors: [{ name: "LACS Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "LACS Admin - GitHub OAuth 登录",
    description: "安全、快速的 GitHub OAuth 身份验证系统",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#4f46e5" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                colorPrimary: '#6366f1',
                colorSuccess: '#10b981',
                colorWarning: '#f59e0b',
                colorError: '#ef4444',
                colorInfo: '#3b82f6',
                borderRadius: 8,
                borderRadiusLG: 12,
                borderRadiusSM: 6,
                fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 14,
                fontSizeLG: 16,
                fontSizeSM: 12,
                lineHeight: 1.5,
                colorBgContainer: '#ffffff',
                colorBgElevated: '#ffffff',
                colorBgLayout: '#f5f5f5',
                colorBorder: '#e5e7eb',
                colorBorderSecondary: '#f3f4f6',
                colorText: '#1f2937',
                colorTextSecondary: '#6b7280',
                colorTextTertiary: '#9ca3af',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
              components: {
                Button: {
                  borderRadius: 8,
                  controlHeight: 40,
                  fontWeight: 500,
                  primaryShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
                },
                Input: {
                  borderRadius: 8,
                  controlHeight: 40,
                  paddingInline: 12,
                },
                Card: {
                  borderRadius: 12,
                  paddingLG: 24,
                  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
                },
                Menu: {
                  borderRadius: 8,
                  itemBorderRadius: 6,
                  itemHeight: 40,
                  itemPaddingInline: 16,
                },
                Modal: {
                  borderRadius: 12,
                  paddingLG: 24,
                },
                Form: {
                  itemMarginBottom: 20,
                  verticalLabelPadding: '0 0 8px',
                },
                Tag: {
                  borderRadius: 12,
                  paddingInline: 8,
                },
                Layout: {
                  headerBg: '#ffffff',
                  headerPadding: '0 24px',
                  siderBg: '#ffffff',
                },
                Typography: {
                  titleMarginBottom: '0.5em',
                  titleMarginTop: '1.2em',
                },
              },
            }}
          >
            <div id="root">
              {children}
            </div>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
