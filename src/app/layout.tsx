import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IQ Score - Cognitive Assessment",
  description: "A 20-question cognitive assessment measuring pattern recognition, logic, and problem solving ability.",
  openGraph: {
    title: "IQ Score - Cognitive Assessment",
    description: "Measure your cognitive ability with our 20-question assessment.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#0a0a0b] text-white`}>
        <MetaPixel />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
