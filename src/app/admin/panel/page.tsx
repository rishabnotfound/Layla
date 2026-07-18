import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPanelPage() {
  if (!(await getAdminSession())) redirect("/admin/login");
  return <AdminPanel />;
}
