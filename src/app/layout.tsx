import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "One Donation, Change Two Lives | Sombhabona × SDC",
  description:
    "A joint initiative of Sombhabona and Skills Development Centre (SDC). One donation of USD 250 gives a child one year of education and a woman 3 months of caregiver training — fully transparent, fully accountable.",
  keywords: [
    "Sombhabona",
    "Skills Development Centre",
    "SDC",
    "donation",
    "child education",
    "women empowerment",
    "caregiver training",
    "Bangladesh charity",
    "transparency",
  ],
  authors: [{ name: "Sombhabona × SDC" }],
  icons: {
    icon: "/sombhabona_logo.webp",
  },
  openGraph: {
    title: "One Donation, Change Two Lives",
    description:
      "One donation of USD 250 transforms two lives: a child's education and a woman's livelihood.",
    siteName: "Sombhabona × SDC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Donation, Change Two Lives",
    description:
      "A joint initiative of Sombhabona and SDC — transparent, measurable, lasting impact.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
