import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "デイサービス レクリエーション プランナー",
  description: "AIがデイサービス向けのレクリエーションを提案します",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-primary-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
