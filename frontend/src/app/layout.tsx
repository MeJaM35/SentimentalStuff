import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentimental Stuff",
  description: "AI-powered customer service sentiment analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}
