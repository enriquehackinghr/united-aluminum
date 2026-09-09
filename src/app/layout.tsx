import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "United Aluminum | Arizona Storage Sheds & Building Products",
    template: "%s | United Aluminum",
  },
  description:
    "Since 1968, United Aluminum has supplied Arizona with custom aluminum storage sheds, pergolas, patio covers, and building materials built to withstand the desert heat.",
  keywords: [
    "aluminum storage sheds",
    "Phoenix sheds",
    "Arizona patio covers",
    "aluminum pergolas",
    "United Aluminum",
  ],
  openGraph: {
    title: "United Aluminum | Built for Arizona. Built to Last.",
    description:
      "Custom aluminum storage sheds, pergolas, and building products for the greater Phoenix area since 1968.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
