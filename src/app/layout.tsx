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
<<<<<<< HEAD
  title: "SSS AI Helper - Security Services AI Assistant",
  description: "AI-powered dashboard for security services business automation and research",
  keywords: ["SSS", "AI Helper", "Security Services", "Business Automation", "AI Assistant"],
  authors: [{ name: "SSS Team" }],
  openGraph: {
    title: "SSS AI Helper",
    description: "AI-powered dashboard for security services business automation",
    url: "https://sss-ai-helper.com",
    siteName: "SSS AI Helper",
=======
  title: "SIS AI Helper - Security Services AI Assistant",
  description: "AI-powered dashboard for security services business automation and research",
  keywords: ["SIS", "AI Helper", "Security Services", "Business Automation", "AI Assistant"],
  authors: [{ name: "SIS Team" }],
  openGraph: {
    title: "SIS AI Helper",
    description: "AI-powered dashboard for security services business automation",
    url: "https://sis-ai-helper.com",
    siteName: "SIS AI Helper",
>>>>>>> a2e2a6c76f13a7d105f2a332da938e23d0affaaf
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
<<<<<<< HEAD
    title: "SSS AI Helper",
=======
    title: "SIS AI Helper",
>>>>>>> a2e2a6c76f13a7d105f2a332da938e23d0affaaf
    description: "AI-powered dashboard for security services business automation",
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
