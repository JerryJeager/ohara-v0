import { storeCookie } from "@/actions/handleCookies";
import DashboardPage from "@/components/dashboard-page";
import { getUser } from "@/lib/dal";
import { User } from "@/types/type";

export default async function Page() {
  const userData: User = await getUser();
  // console.log(userData)
  
  return <DashboardPage />;
}
