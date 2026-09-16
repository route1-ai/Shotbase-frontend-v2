import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { JetBrains_Mono } from "next/font/google";
import { LenisProvider } from "@/components/lenis-provider";
import { ThemeProvider } from "@/components/theme-provider";
import GridBackground from "@/components/grid-background";
import "./globals.css";
import "./sections.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shotbase — Browser infrastructure for AI & automation developers",
  description:
    "One API and MCP capability that renders any webpage and returns a screenshot, page content, and structured extracted data. REST + MCP, built for AI and automation developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-ibm-plex), monospace" }} suppressHydrationWarning>
        <ThemeProvider>
          <GridBackground />
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <LenisProvider>
              {children}
            </LenisProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
