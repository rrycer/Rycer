const encoder = new TextEncoder();
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const TOKEN_PREFIX = "authed";

function requireSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await getKey(requireSecret());
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(sig);
}

/** Creates a signed session token — no server-side session store needed. */
export async function createSessionToken(): Promise<string> {
  const payload = `${TOKEN_PREFIX}.${Date.now()}`;
  return `${payload}.${await sign(payload)}`;
}

/** Verifies a session token's signature and expiry. Edge-runtime safe (Web Crypto only). */
export async function verifySessionToken(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, timestamp, signature] = parts;
  if (prefix !== TOKEN_PREFIX) return false;

  const expectedSignature = await sign(`${prefix}.${timestamp}`);
  if (!timingSafeEqual(expectedSignature, signature)) return false;

  const age = Date.now() - Number(timestamp);
  return age >= 0 && age < SESSION_MAX_AGE_MS;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Constant-time-ish comparison for checking the submitted passcode. */
export function passcodeMatches(submitted: string, expected: string): boolean {
  return timingSafeEqual(submitted, expected);
}

export const SESSION_COOKIE_NAME = "rycer_session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;
