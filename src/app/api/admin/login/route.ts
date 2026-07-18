import { NextResponse } from "next/server";
import { checkLoginRate, ipFrom } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { verifyAdminPassword, createAdminSession } from "@/lib/admin-auth";
import { logAdmin } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = ipFrom(req);
  const ok = await checkLoginRate(`admin:${ip}`, 5);
  if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { password, turnstileToken } = body ?? {};

  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) return NextResponse.json({ error: "Captcha failed" }, { status: 400 });

  if (typeof password !== "string" || password.length < 12 || password.length > 200) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await createAdminSession();
  await logAdmin("login", { type: "ip", id: ip });
  return NextResponse.json({ ok: true });
}
