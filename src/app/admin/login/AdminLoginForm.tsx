"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/ui/Turnstile";
import { StatefulButton } from "@/components/ui/StatefulButton";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, turnstileToken: captcha }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Failed");
        throw new Error("bad");
      }
      router.replace("/admin/panel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
      <label className="block">
        <span className="text-[12px] font-medium text-white/70">Password</span>
        <div className="relative mt-1.5">
          <input
            type={show ? "text" : "password"}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 pr-16 text-sm text-white outline-none focus:border-white/30"
            placeholder="At least 12 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-white/50 hover:text-white"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      <div className="mt-4">
        <Turnstile onToken={setCaptcha} />
      </div>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      <StatefulButton
        onClick={submit}
        disabled={loading || !captcha || password.length < 12}
        className="mt-4 w-full bg-accent py-3 text-white hover:bg-accent-hover"
      >
        {loading ? "Verifying…" : "Enter"}
      </StatefulButton>
    </div>
  );
}
