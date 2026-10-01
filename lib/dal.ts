import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseurl =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8080/api/v1";

export const getUser = cache(async () => {
  const token = (await cookies()).get("ohara_token")?.value;
  const refresh = (await cookies()).get("ohara_refresh_token")?.value;
  if (!token && !refresh) redirect("/");

  try {
    const res = await fetch(`${baseurl}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }

    const refreshRes = await fetch(`${baseurl}/users/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refresh}` },
      cache: "no-store",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profile_picture: data.user.profile_picture,
        created_at: data.user.created_at,
      };
    }
  } catch (error) {
    throw error;
  }

  redirect("/");
});
