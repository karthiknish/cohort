import { AdminPageShell } from '@/features/admin/components/admin-page-shell'

import { SystemHealthView } from './components/system-health-view'

export const metadata = {
  title: 'System Health · Admin',
  description: 'Real-time monitoring of all platform services and background systems.',
}

export default function SystemHealthPage() {
  return (
    <AdminPageShell
      title="System health"
      description="Monitor real-time connectivity and performance of your core infrastructure and integrations."
    >
      <SystemHealthView />
    </AdminPageShell>
  )
}
