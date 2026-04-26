import { permanentRedirect } from 'next/navigation'

export default function ActivityPage() {
  permanentRedirect('/dashboard/for-you')
}
