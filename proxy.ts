import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const userId = request.cookies.get("ohara_user_id");
  const token = request.cookies.get("ohara_token");
  const refreshToken = request.cookies.get("ohara_refresh_token");

  if (!userId || !token || !refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", ],
};