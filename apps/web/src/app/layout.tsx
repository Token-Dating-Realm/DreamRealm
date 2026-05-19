/**
 * Root layout for the Next.js web app.
 *
 * Wraps the entire application in the AuthProvider so that session state
 * and Supabase client are available to all pages. Also sets global metadata
 * and dark-mode-friendly body styles aligned with the DreamRealm theme.
 */

import type { Metadata } from "next";
import { AuthProvider } from "./components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DreamRealm — Enter the Digital World",
  description: "A digital world where creators, dreamers, and connectors build communities across realms. Powered by DreamCoin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-text min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
