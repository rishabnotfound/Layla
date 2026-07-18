import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin/panel");
  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-6">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] text-accent">Restricted</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-white/50">Moderation & operator tools.</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
