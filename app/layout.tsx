import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SNS Content Hub",
  description: "Dr.いわたつ SNS管理ダッシュボード",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-900 text-gray-100">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="text-teal-400 font-black text-lg">
              SNS Hub
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
              カレンダー
            </Link>
            <Link href="/pipeline" className="text-teal-300 hover:text-white text-sm font-bold transition">
              パイプライン
            </Link>
            <Link href="/posts" className="text-gray-400 hover:text-white text-sm transition">
              投稿一覧
            </Link>
            <Link
              href="/posts/new"
              className="ml-auto bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold px-3 py-1.5 rounded transition"
            >
              + 新規作成
            </Link>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
