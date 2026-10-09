import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Fiches pratiques", template: "%s · Fiches pratiques" },
  description: "Fiches mémo pour réaliser simplement vos démarches en ligne.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster theme="light" richColors position="top-center" />
      </body>
    </html>
  );
}
