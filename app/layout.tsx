import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleAuthProvider } from "@/components/google-auth-provider";

export const metadata: Metadata = {
  title: "Ohara — AI support for your website",
  description:
    "Turn your website into an AI support assistant. Ohara learns from your content and helps visitors find answers instantly.",
  generator: "Ohara",
  icons: {
    icon: [
      {
        url: "/ohara-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/ohara-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/ohara-logo.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body className="antialiased">
          <GoogleAuthProvider>{children}</GoogleAuthProvider>
          {process.env.NODE_ENV === "production" && <Analytics />}
        </body>
      </html>
    </>
  );
}
