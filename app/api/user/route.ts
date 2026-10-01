// app/api/user/route.ts
import { BASE_URL } from "@/data/websites";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ohara_token")?.value;
  const refresh = cookieStore.get("ohara_refresh_token")?.value;

  if (!token && !refresh) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();
    return NextResponse.json(data);
  }

  const refreshRes = await fetch(`${BASE_URL}/users/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh}` },
    cache: "no-store",
  });

  if (refreshRes.ok) {
    const data = await refreshRes.json();

    cookieStore.set("ohara_token", data.token.access_token, { maxAge: 3600 });
    cookieStore.set("ohara_refresh_token", data.token.refresh_token, {
      maxAge: 86400,
    });
    cookieStore.set("ohara_user_id", data.user.id, { maxAge: 3600 });

    return NextResponse.json({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      profile_picture: data.user.profile_picture,
      created_at: data.user.created_at,
      access_token: data.token.access_token,
      refresh_token: data.token.refresh_token,
    });
  }

  return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
}
