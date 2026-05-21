import { redirect } from 'next/navigation'

/** Time & attendance removed; keep old links working. */
export default function TimePageRedirect() {
  redirect('/dashboard/projects')
}
