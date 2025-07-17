import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
