import { redirect } from 'next/navigation'

export default function DashboardTimeRedirectPage() {
  redirect('/dashboard/tasks?operations=time')
}
