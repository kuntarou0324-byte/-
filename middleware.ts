import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isAuthDisabled, verifySessionToken } from "./app/lib/session";

export const config = {
  matcher: ["/((?!_next/|favicon.ico|login|api/auth/).*)"],
};

export async function middleware(req: NextRequest) {
  if (isAuthDisabled()) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (valid) return NextResponse.next();

  const isApi = req.nextUrl.pathname.startsWith("/api/");
  if (isApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}
