import { getUser } from "@/lib/dal";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await getUser();
  return <>{children}</>;
}