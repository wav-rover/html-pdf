import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: { default: "Fiches pratiques", template: "%s · Fiches pratiques" },
  description: "Fiches mémo pour réaliser simplement vos démarches en ligne.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={cn(notoSans.variable, playfairDisplay.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster theme="light" richColors position="top-center" />
      </body>
    </html>
  );
}
