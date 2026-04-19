const SESSION_COOKIE = "facility_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is not configured (must be at least 16 characters).",
    );
  }
  return secret;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(value: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return bytesToHex(new Uint8Array(sig));
}

export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmac(issuedAt, getSecret());
  return `${issuedAt}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [issuedAt, sig] = parts;
  const issuedAtNum = Number(issuedAt);
  if (!Number.isFinite(issuedAtNum)) return false;
  if (Date.now() - issuedAtNum > SESSION_MAX_AGE_SEC * 1000) return false;
  try {
    const expected = await hmac(issuedAt, getSecret());
    if (expected.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export function isAuthDisabled(): boolean {
  const pw = process.env.FACILITY_PASSWORD;
  return !pw || pw.length === 0;
}

export function checkFacilityPassword(input: string): boolean {
  const expected = process.env.FACILITY_PASSWORD ?? "";
  if (expected.length === 0) return true;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return diff === 0;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_SEC;
