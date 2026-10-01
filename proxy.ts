// proxy.ts
import { NextRequest, NextResponse } from "next/server";

const baseurl =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8080/api/v1";

const opts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const toLogin = (req: NextRequest) => {
  const res = NextResponse.redirect(new URL("/", req.url));
  ["ohara_token", "ohara_refresh_token", "ohara_user_id"].forEach((c) => res.cookies.delete(c));
  return res;
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("ohara_token")?.value;
  const refresh = request.cookies.get("ohara_refresh_token")?.value;

  if (!token && !refresh) return toLogin(request);

  if (token) {
    const res = await fetch(`${baseurl}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) return NextResponse.next();
  }

  if (!refresh) return toLogin(request);

  const refreshRes = await fetch(`${baseurl}/users/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
    cache: "no-store",
  });
  if (!refreshRes.ok) return toLogin(request);

  const data = await refreshRes.json();

  request.cookies.set("ohara_token", data.access_token);
  request.cookies.set("ohara_refresh_token", data.refresh_token);

  const response = NextResponse.next({ request });
  response.cookies.set("ohara_token", data.token.access_token, { ...opts, maxAge: 3600 });
  response.cookies.set("ohara_refresh_token", data.token.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 7 });
  return response;
}

export const config = { matcher: ["/dashboard/:path*"] };