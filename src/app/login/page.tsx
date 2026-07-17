import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  if (await getSession()) redirect("/dashboard");
  const next = searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : "";
  redirect(`/auth?tab=signin${next}`);
}
