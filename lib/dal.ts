import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseurl =
  process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:8080/api/v1";

export const getUser = cache(async () => {
  const token = (await cookies()).get("ohara_token")?.value;
  const refresh = (await cookies()).get("ohara_refresh_token")?.value;
  if (!token) redirect("/");

  const res = await fetch(`${baseurl}/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if(res.status !== 200){
    const refreshRes = await fetch(`${baseurl}/users/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refresh}` },
        cache: "no-store",
      });
      if(refreshRes.status !== 201) redirect("/");
  }

  if (res.status !== 200) redirect("/");
  return res.json();
});

