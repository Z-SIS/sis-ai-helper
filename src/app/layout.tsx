import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { GlobalErrorProvider } from "@/components/providers/global-error-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIS Group Enterprises - Security, Facility Management & Cash Logistics",
  description: "A Market Leader in Security, Cash Logistics & Facility Management. Indian multinational conglomerate providing world-class security and facility management services.",
  keywords: ["SIS Group", "Security Services", "Facility Management", "Cash Logistics", "Indian Multinational", "Security Solutions"],
  authors: [{ name: "SIS Group Enterprises" }],
  openGraph: {
    title: "SIS Group Enterprises",
    description: "A Market Leader in Security, Cash Logistics & Facility Management",
    url: "https://sisgroup.in",
    siteName: "SIS Group Enterprises",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIS Group Enterprises",
    description: "A Market Leader in Security, Cash Logistics & Facility Management",
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
        <ErrorBoundary>
          <QueryClientProviderWrapper>
            <GlobalErrorProvider />
            {children}
            <Toaster />
          </QueryClientProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
