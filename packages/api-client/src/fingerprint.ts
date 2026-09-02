/**
 * Device Fingerprinting
 *
 * Computes a stable per-device identifier used to detect account takeovers
 * and geo/device anomalies. On the web this hashes browser signals; there is
 * no equivalent browser fingerprint surface on native, so callers there
 * should supply a `storage` adapter (e.g. expo-secure-store) and we persist
 * a random device id instead.
 */

export interface FingerprintStorage {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
}

const DEVICE_ID_STORAGE_KEY = "dreamrealm_device_id";

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Deterministic non-cryptographic fallback (djb2) if SubtleCrypto is unavailable.
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function randomDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getDeviceFingerprint(storage?: FingerprintStorage): Promise<string> {
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    const raw = [
      navigator.userAgent,
      navigator.language,
      window.screen?.width,
      window.screen?.height,
      new Date().getTimezoneOffset(),
    ].join("|");
    return sha256Hex(raw);
  }

  if (storage) {
    const existing = await storage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return sha256Hex(existing);

    const id = randomDeviceId();
    await storage.setItem(DEVICE_ID_STORAGE_KEY, id);
    return sha256Hex(id);
  }

  return "unknown-device";
}
