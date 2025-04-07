import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G Market x Poizon Calculator",
  description: "Калькулятор стоимости товаров",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}