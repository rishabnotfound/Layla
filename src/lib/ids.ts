import crypto from "node:crypto";

export function newId(prefix = ""): string {
  const raw = crypto.randomBytes(12).toString("base64url");
  return prefix ? `${prefix}_${raw}` : raw;
}

export function normalizeOrigin(input: string): string {
  const u = new URL(input);
  const isLocalhost = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (u.protocol !== "https:" && !(u.protocol === "http:" && isLocalhost)) {
    throw new Error("https_required");
  }
  return `${u.protocol}//${u.host}`;
}
