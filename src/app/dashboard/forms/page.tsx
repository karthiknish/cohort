import { redirect } from 'next/navigation'

export default function DashboardFormsRedirectPage() {
  redirect('/dashboard/projects?operations=forms')
}
