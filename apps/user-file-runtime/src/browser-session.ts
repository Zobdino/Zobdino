export const SESSION_TTL_SECONDS = 15 * 60;
export const SESSION_REQUEST_LIMIT = 64;

export interface BrowserSessionRecord {
  id: string;
  tokenSha256: string;
  origin: string;
  createdAt: string;
  expiresAt: string;
  requestCount: number;
  revokedAt: string | null;
}

export function parseAllowedOrigins(value: string | undefined) {
  return new Set(
    String(value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function allowedBrowserOrigin(origin: string | null, configured: string | undefined) {
  if (!origin) return false;
  return parseAllowedOrigins(configured).has(origin);
}

export function sessionUsable(session: BrowserSessionRecord, origin: string, now = new Date()) {
  return session.origin === origin &&
    session.revokedAt === null &&
    session.requestCount < SESSION_REQUEST_LIMIT &&
    Date.parse(session.expiresAt) > now.getTime();
}

export function randomSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function newBrowserSession(origin: string, tokenSha256: string, now = new Date()): BrowserSessionRecord {
  const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  return {
    id: crypto.randomUUID(),
    tokenSha256,
    origin,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    requestCount: 0,
    revokedAt: null,
  };
}
