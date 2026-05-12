import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#034694',
}

export const metadata: Metadata = {
  title: "AgroNexus | Gestão Inteligente",
  description: "Sistema de gestão agropecuária integrado a dados climáticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-agro-light min-h-screen flex flex-col pb-20 md:pb-0`}>
        <main className="flex-1 w-full max-w-md mx-auto relative bg-white shadow-xl min-h-screen">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
