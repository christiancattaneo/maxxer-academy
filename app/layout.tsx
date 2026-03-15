import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://maxxer.academy"),
  title: "Maxxer Academy — Real Playbooks for AI Agent Businesses",
  description:
    "Learn how founders are using OpenClaw agents to build real businesses. Playbooks, tools, and workflows — organized by what you want to build.",
  openGraph: {
    type: "website",
    url: "https://maxxer.academy/",
    title: "Maxxer Academy — Real Playbooks for AI Agent Businesses",
    description:
      "Step-by-step playbooks from real founders making real money with AI agents. Every tool tested, every cost calculated.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maxxer Academy — Real Playbooks for AI Agent Businesses",
    description:
      "Step-by-step playbooks from real founders making real money with AI agents.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
