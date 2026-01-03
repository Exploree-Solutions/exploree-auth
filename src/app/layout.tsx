import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exploree Account",
  description: "One account for all Exploree services",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
