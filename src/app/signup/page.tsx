import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupRedirect() {
  if (await getSession()) redirect("/dashboard");
  redirect("/auth?tab=signup");
}
