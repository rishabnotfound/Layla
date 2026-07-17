import { getDb } from "./mongo";

export async function checkLoginRate(ip: string, max = 8): Promise<boolean> {
  const db = await getDb();
  const col = db.collection("login_attempts");
  const now = new Date();
  await col.insertOne({ ip, at: now });
  const count = await col.countDocuments({
    ip,
    at: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
  });
  return count <= max;
}

export function ipFrom(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}
