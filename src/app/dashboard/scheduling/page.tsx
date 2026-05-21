import { redirect } from 'next/navigation'

/** Team scheduling removed; keep old links working. */
export default function SchedulingPageRedirect() {
  redirect('/dashboard/projects')
}
