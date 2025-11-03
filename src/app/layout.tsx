import type { Metadata } from "next";
import "@fontsource/geist";
import "@fontsource/geist-mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { GlobalErrorProvider } from "@/components/providers/global-error-provider";

const geistSans = {
  variable: '--font-geist-sans'
};

const geistMono = {
  variable: '--font-geist-mono'
};

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
