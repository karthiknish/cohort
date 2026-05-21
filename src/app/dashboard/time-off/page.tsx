import { redirect } from 'next/navigation'

/** Time off removed; keep old links working. */
export default function TimeOffPageRedirect() {
  redirect('/dashboard/projects')
}
