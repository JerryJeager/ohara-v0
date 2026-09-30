import DashboardPage from '@/components/dashboard-page'
import { getUser } from '@/lib/dal'

export default async function Page() {
  const userData = await getUser()
  console.log(userData)
  return <DashboardPage />
}
