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
  title: "Speaker Planner",
  description: "Speaker Planner",
  keywords: ["speaker", "planner", "conference", "talks"],
  authors: [
    {
      name: "Guillermo Andrada",
      url: "https://GA-Software.wuaze.com",
    },
  ],
  openGraph: {
    title: "Speaker Planner",
    description: "Speaker Planner",
    type: "website",
    locale: "en_US",
    siteName: "Speaker Planner",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
