import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "ScraperFlow - Workflow Automation",
  description: "Advanced web scraping and workflow automation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl={"/sign-in"}
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-sm !shadow-none"
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${syne.variable} font-sans`}>
          <AppProviders>{children}</AppProviders>
        </body>
        <Toaster richColors/>
      </html>
      
    </ClerkProvider>

  );
}
