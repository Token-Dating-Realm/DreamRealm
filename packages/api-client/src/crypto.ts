/**
 * End-to-end encryption primitives for messaging.
 *
 * ECDH (P-256) key agreement + AES-KW key wrapping + AES-GCM message
 * encryption, built entirely on SubtleCrypto so it runs unmodified in
 * browsers and Node. React Native (Hermes) has no SubtleCrypto without an
 * added polyfill, so `isE2EEAvailable()` reports false there and callers
 * fall back to storing plaintext `content` — never a requirement, always an
 * upgrade when both sides support it.
 *
 * Identity key persistence here targets the browser (localStorage). Native
 * apps should call the primitives directly with their own secure storage
 * (e.g. expo-secure-store) once a WebCrypto polyfill is installed.
 */

const ECDH_ALGORITHM = { name: "ECDH", namedCurve: "P-256" } as const;

export interface IdentityKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export function isE2EEAvailable(): boolean {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
}

function bufToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function generateIdentityKeyPair(): Promise<IdentityKeyPair> {
  const pair = await crypto.subtle.generateKey(ECDH_ALGORITHM, true, ["deriveKey", "deriveBits"]);
  return { publicKey: pair.publicKey, privateKey: pair.privateKey };
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("spki", key);
  return bufToBase64(raw);
}

export async function importPublicKey(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("spki", base64ToBuf(b64), ECDH_ALGORITHM, true, []);
}

async function exportPrivateKeyJwk(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", key);
}

async function importPrivateKeyJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, ECDH_ALGORITHM, true, ["deriveKey", "deriveBits"]);
}

async function importPublicKeyFromPrivateJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  const { kty, crv, x, y } = jwk;
  return crypto.subtle.importKey("jwk", { kty, crv, x, y, ext: true }, ECDH_ALGORITHM, true, []);
}

/** Derives the order-independent AES-KW key shared by two ECDH keypairs. */
async function deriveWrappingKey(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-KW", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

export async function generateConversationKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function wrapConversationKey(
  conversationKey: CryptoKey,
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<string> {
  const wrappingKey = await deriveWrappingKey(myPrivateKey, theirPublicKey);
  const wrapped = await crypto.subtle.wrapKey("raw", conversationKey, wrappingKey, "AES-KW");
  return bufToBase64(wrapped);
}

export async function unwrapConversationKey(
  wrappedB64: string,
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKey(myPrivateKey, theirPublicKey);
  return crypto.subtle.unwrapKey(
    "raw",
    base64ToBuf(wrappedB64),
    wrappingKey,
    "AES-KW",
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypts `plaintext`, returning a single `<iv>.<ciphertext>` base64 payload. */
export async function encryptMessage(conversationKey: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    conversationKey,
    new TextEncoder().encode(plaintext)
  );
  return `${bufToBase64(iv.buffer)}.${bufToBase64(ciphertext)}`;
}

export async function decryptMessage(conversationKey: CryptoKey, payload: string): Promise<string> {
  const [ivB64, ctB64] = payload.split(".");
  if (!ivB64 || !ctB64) throw new Error("Malformed encrypted payload");
  const iv = new Uint8Array(base64ToBuf(ivB64));
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, conversationKey, base64ToBuf(ctB64));
  return new TextDecoder().decode(plaintext);
}

// ---------------------------------------------------------------------------
// Identity key persistence (browser only — see file header)
// ---------------------------------------------------------------------------

const IDENTITY_KEY_STORAGE_PREFIX = "dreamrealm_identity_key_";

/**
 * Returns the caller's persistent identity keypair, generating and storing
 * one on first use. Returns null where E2EE or persistent storage isn't
 * available, so callers can gracefully skip encryption.
 */
export async function getOrCreateIdentityKeyPair(userId: string): Promise<IdentityKeyPair | null> {
  if (!isE2EEAvailable() || typeof localStorage === "undefined") return null;

  const storageKey = `${IDENTITY_KEY_STORAGE_PREFIX}${userId}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const jwk = JSON.parse(stored) as JsonWebKey;
    const [privateKey, publicKey] = await Promise.all([
      importPrivateKeyJwk(jwk),
      importPublicKeyFromPrivateJwk(jwk),
    ]);
    return { privateKey, publicKey };
  }

  const pair = await generateIdentityKeyPair();
  const jwk = await exportPrivateKeyJwk(pair.privateKey);
  localStorage.setItem(storageKey, JSON.stringify(jwk));
  return pair;
}
