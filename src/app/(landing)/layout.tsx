import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@/styles/transition.css";
import { Header } from "@/components/modules/landing/header";
import { PageTransition } from "@/components/modules/landing/page-transition";
import { MenuOverlay } from "@/components/modules/landing/menu-overlay";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrimeEditz - Post Production Management",
  description: "Manage your photo and video post-production workflow",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistMono.variable} antialiased`}>
      <PageTransition />
      <Header />
      {children}
      <MenuOverlay />
    </div>
  );
}
