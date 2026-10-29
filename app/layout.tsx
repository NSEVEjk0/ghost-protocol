import type { Metadata } from "next";
import { Host_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const host = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host",
  display: "swap",
});
const geist = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GHOST://PROTOCOL",
  description:
    "A 1989 payment system, kept alive by an open-weight model on your machine. Ask it anything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${host.variable} ${geist.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
