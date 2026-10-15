// proxy.ts
import { NextRequest, NextResponse } from "next/server";

const baseurl =
  process.env.NODE_ENV === "production" ? "https://ohara-be-production.up.railway.app/api/v1" : "http://localhost:8080/api/v1";

const opts = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const toLogin = (req: NextRequest) => {
  const res = NextResponse.redirect(new URL("/", req.url));
  ["ohara_token", "ohara_refresh_token", "ohara_user_id"].forEach((c) => res.cookies.delete(c));
  return res;
};
const isAuthFail = (s: number) => s === 401 || s === 403;
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("ohara_token")?.value;
  const refresh = request.cookies.get("ohara_refresh_token")?.value;

  if (!token && !refresh) return toLogin(request);

  if (token) {
    try {
      const res = await fetch(`${baseurl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) return NextResponse.next();
      console.log("[proxy] check failed:", res.status, await res.text());
      // 5xx etc: don't log the user out because of a backend hiccup
      if (!isAuthFail(res.status)) return NextResponse.next();
    } catch (e) {
      console.error("[proxy] fetch error", e);
      return NextResponse.next();
    }
  }

  if (!refresh) return toLogin(request);

  const refreshRes = await fetch(`${baseurl}/users/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
    cache: "no-store",
  });
  if (!refreshRes.ok) {
    console.log("[proxy] refresh failed:", refreshRes.status, await refreshRes.text());
    return toLogin(request);
  }

  const data = await refreshRes.json();
  const auth = data?.token ?? data;
  if (!auth?.access_token || !auth?.refresh_token) return toLogin(request);

  // make the new tokens visible to the page rendering THIS request
  request.cookies.set("ohara_token", auth.access_token);
  request.cookies.set("ohara_refresh_token", auth.refresh_token);

  const response = NextResponse.next({ request });
  response.cookies.set("ohara_token", auth.access_token, { ...opts, maxAge: 3600 });
  response.cookies.set("ohara_refresh_token", auth.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 7 });
  return response;
}

export const config = { matcher: ["/dashboard/:path*"] };