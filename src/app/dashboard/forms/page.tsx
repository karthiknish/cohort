import { redirect } from 'next/navigation'

/** Forms moved into project workflows; keep old links working. */
export default function FormsPageRedirect() {
  redirect('/dashboard/projects')
}
