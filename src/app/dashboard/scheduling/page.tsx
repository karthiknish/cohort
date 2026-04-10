import { redirect } from 'next/navigation'

export default function DashboardSchedulingRedirectPage() {
  redirect('/dashboard/projects?operations=scheduling')
}
