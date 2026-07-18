import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  redirect("/admin/panel");
}
