import { SocialsPageLoadingFallback } from '@/features/dashboard/socials/components/socials-page-loading-fallback'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export default function SocialsLoading() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <SocialsPageLoadingFallback />
    </div>
  )
}
