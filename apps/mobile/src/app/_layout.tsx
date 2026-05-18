/**
 * Root layout for mobile app (Expo Router).
 *
 * Wraps all routes with the AuthProvider so session state is available
 * across the entire native navigation tree.
 */

import { AuthProvider } from "../context/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
