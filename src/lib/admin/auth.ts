import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const ADMIN_COOKIE = "photowall_admin";
export const OWNER_COOKIE_PREFIX = "photowall_owner_";

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PIN;
  if (!secret) {
    throw new Error("ADMIN_PIN manquant dans .env.local");
  }
  return secret;
}

export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN;
  if (!pin) {
    throw new Error("ADMIN_PIN manquant dans .env.local");
  }
  return pin;
}

export function verifyAdminPin(pin: string): boolean {
  const expected = getAdminPin();
  if (pin.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(pin), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return createHmac("sha256", sessionSecret()).update("photowall-admin-v1").digest("hex");
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isAdminAuthenticated(cookieStore: ReadonlyRequestCookies): boolean {
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function ownerCookieName(photoId: string): string {
  return `${OWNER_COOKIE_PREFIX}${encodeURIComponent(photoId)}`;
}

/** Creates a stateless, unforgeable ownership token for one uploaded photo. */
export function createOwnerToken(photoId: string): string {
  const nonce = randomBytes(24).toString("hex");
  const signature = createHmac("sha256", sessionSecret())
    .update(`photo-owner:${photoId}:${nonce}`)
    .digest("hex");
  return `${nonce}.${signature}`;
}

export function isValidOwnerToken(photoId: string, token: string | undefined): boolean {
  if (!token) return false;
  const [nonce, signature] = token.split(".");
  if (!nonce || !signature || !/^[a-f0-9]{48}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", sessionSecret())
    .update(`photo-owner:${photoId}:${nonce}`)
    .digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
