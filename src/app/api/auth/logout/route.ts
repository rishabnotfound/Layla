import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  clearSession();
  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
