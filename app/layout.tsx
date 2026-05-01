import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SNS Hub - Dr.いわたつ",
  description: "Dr.いわたつ SNS管理ダッシュボード",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-900 text-gray-100">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6">
            <Link href="/" className="text-teal-400 font-black text-lg">
              SNS Hub
            </Link>
            <div className="flex items-center gap-3 sm:gap-6 order-3 sm:order-none">
              <Link href="/posts" className="text-gray-400 hover:text-white text-xs sm:text-sm transition">
                投稿一覧
              </Link>
              <Link href="/x-growth" className="text-blue-400 hover:text-white text-xs sm:text-sm transition font-bold">
                𝕏 Growth
              </Link>
              <Link href="/ooda" className="text-gray-400 hover:text-white text-xs sm:text-sm transition">
                🔄 OODA
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
