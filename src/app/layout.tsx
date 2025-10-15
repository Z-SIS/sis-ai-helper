import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
<<<<<<< HEAD
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "@/lib/global-error-handler";
=======
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIS AI Helper - Security Services AI Assistant",
  description: "AI-powered dashboard for security services business automation and research",
  keywords: ["SIS", "AI Helper", "Security Services", "Business Automation", "AI Assistant"],
  authors: [{ name: "SIS Team" }],
  openGraph: {
    title: "SIS AI Helper",
    description: "AI-powered dashboard for security services business automation",
    url: "https://sis-ai-helper.com",
    siteName: "SIS AI Helper",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIS AI Helper",
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
<<<<<<< HEAD
        <ErrorBoundary>
          <QueryClientProviderWrapper>
            {children}
            <Toaster />
          </QueryClientProviderWrapper>
        </ErrorBoundary>
=======
        <QueryClientProviderWrapper>
          {children}
          <Toaster />
        </QueryClientProviderWrapper>
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
      </body>
    </html>
  );
}
