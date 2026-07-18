import { getDb } from "./mongo";

export type AdminAction =
  | "login"
  | "delete_site"
  | "delete_user"
  | "unverify_site";

export async function logAdmin(action: AdminAction, target?: { type: string; id: string; meta?: unknown }) {
  const db = await getDb();
  await db.collection("admin_audit").insertOne({
    action,
    targetType: target?.type ?? null,
    targetId: target?.id ?? null,
    meta: target?.meta ?? null,
    at: new Date(),
  });
}
