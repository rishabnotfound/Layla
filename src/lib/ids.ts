import crypto from "node:crypto";

export function newId(prefix = ""): string {
  const raw = crypto.randomBytes(12).toString("base64url");
  return prefix ? `${prefix}_${raw}` : raw;
}

export function normalizeOrigin(input: string): string {
  const u = new URL(input);
  return `${u.protocol}//${u.host}`;
}
