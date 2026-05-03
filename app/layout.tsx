import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { LenisProvider } from "@/components/lenis-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
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
      className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <LenisProvider>
            {children}
          </LenisProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
