import { permanentRedirect } from 'next/navigation'

/** Legacy URL; For You now lives under the dashboard shell. */
export default function ForYouLegacyRedirect() {
  permanentRedirect('/dashboard/for-you')
}
