import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { JetBrains_Mono } from "next/font/google";
import { LenisProvider } from "@/components/lenis-provider";
import GridBackground from "@/components/grid-background";
import "./globals.css";
import "./sections.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shotbase — Screenshot any URL. One API call.",
  description: "Pass a URL, get a permanent screenshot back in milliseconds.",
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
        <GridBackground />
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <LenisProvider>
            {children}
          </LenisProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
