import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "node:crypto";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-me-please-32bytes!"
);

const COOKIE = "layla_session";
const CODE_COOKIE = "layla_code";

export function generateCode(): string {
  const digits = Array.from(crypto.randomBytes(16))
    .map((b) => (b % 10).toString())
    .join("");
  return digits.match(/.{4}/g)!.join("-");
}

export function normalizeCode(input: string): string {
  return input.replace(/\D/g, "").slice(0, 16);
}

export function hashCode(code: string): string {
  const digits = normalizeCode(code);
  const pepper = process.env.CODE_PEPPER || "layla-pepper";
  return crypto.createHash("sha256").update(digits + ":" + pepper).digest("hex");
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession(): Promise<{ uid: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { uid: String(payload.uid) };
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE);
  cookies().delete(CODE_COOKIE);
}

export function setCodeRecoveryCookie(code: string) {
  cookies().set(CODE_COOKIE, normalizeCode(code), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
