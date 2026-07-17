import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import TestClient from "./TestClient";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const session = await getSession();
  if (!session) redirect("/auth?tab=signin&next=/test");

  const db = await getDb();
  const sites = await db
    .collection("sites")
    .find({ userId: session.uid })
    .project({ _id: 0, siteId: 1, name: 1, origin: 1, verified: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  return <TestClient sites={sites as any} />;
}
