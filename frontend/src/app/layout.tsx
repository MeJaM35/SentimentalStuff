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
      <body className="min-h-screen bg-brand-bg text-brand-text font-sans antialiased">{children}</body>
    </html>
  );
}
