import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Location | Degvora",
  description: "Accurate real-time location mapping and custom geolocational tools developed by Degvora.",
  keywords: ["what is my location", "my current location", "find my coordinates", "current GPS coordinates", "my IP address"],
  openGraph: {
    title: "What is My Location? — Current GPS Coordinates",
    description: "Find your current location and exact coordinates instantly.",
    url: "https://my-location.degvora.com",
    siteName: "Degvora Tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7650628729482645"
     crossOrigin="anonymous"></script>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
