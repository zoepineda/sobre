import type { Metadata, Viewport } from "next";
import "./globals.css";
import "lineicons/dist/lineicons.css";
import { Analytics } from "@vercel/analytics/next";
import AppShell from "@/components/AppShell";
import BottomNav from "@/components/BottomNav";
import { getSessionUser } from "@/lib/supabase/server";
import { Fraunces, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Every peso accounted for. Your money sorted into envelopes across all your banks, wallets, and cards.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <html lang="en" className={cn("font-sans", geist.variable, fraunces.variable)}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <BottomNav user={user} />
        <Analytics />
      </body>
    </html>
  );
}
