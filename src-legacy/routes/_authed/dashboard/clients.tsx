import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authed/dashboard/clients')({
  component: DashboardClientsRedirect,
})

function DashboardClientsRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    void navigate({ to: '/admin/clients', replace: true })
  }, [navigate])
  return null
}
