import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Beat Generator - Create Music with AI",
  description: "Generate beats and music using AI. Create trap, hip-hop, lo-fi, house, and techno beats with our retro-styled beat generator platform.",
  keywords: "AI, beat generator, music production, trap, hip-hop, lo-fi, house, techno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ paddingBottom: '40px' }}>
        {children}
      </body>
    </html>
  );
}
