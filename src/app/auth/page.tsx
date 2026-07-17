import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { GridBackground } from "@/components/ui/GridBackground";
import AuthTabs from "./AuthTabs";

export const metadata = {
  title: "Sign in — Layla",
};

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <GridBackground />
      </div>

      {/* NAV */}
      <nav className="relative z-20 border-b border-border/50 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Layla" width={28} height={28} priority />
            <span className="text-lg font-semibold tracking-tight">Layla</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-white">
            ← Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-64px-56px)] w-full max-w-md items-center justify-center px-6 py-10">
        <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
          <AuthTabs />
        </Suspense>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border/50 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={16} height={16} />
            <span>Layla — layla.wtf</span>
          </div>
          <div>Made without cookies.</div>
        </div>
      </footer>
    </div>
  );
}
