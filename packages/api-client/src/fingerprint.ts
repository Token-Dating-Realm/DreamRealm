/**
 * Device Fingerprinting Stub
 *
 * Phase 1 stub. In production this should compute a stable device
 * identifier from browser/user-agent / Expo-Constants fields and
 * compare against historical sign-ins to detect account takeovers.
 *
 * TODO: Implement real fingerprinting (expo-constants, FingerprintJS, etc.)
 * and integrate with Supabase auth hooks.
 */

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window !== "undefined") {
    const raw = [
      navigator.userAgent,
      navigator.language,
      window.screen.width,
      window.screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");
    // In production hash this with a stable algorithm
    return btoa(raw).slice(0, 32);
  }
  return "server-side";
}
