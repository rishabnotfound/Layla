import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.headers.set("Pragma", "no-cache");
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
