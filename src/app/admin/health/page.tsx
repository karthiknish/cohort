import { SystemHealthView } from './components/system-health-view'

export const metadata = {
    title: 'System Health · Admin',
    description: 'Real-time monitoring of all platform services and background systems.',
}

export default function SystemHealthPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">System health</h1>
                <p className="text-sm text-muted-foreground">
                    Monitor real-time connectivity and performance of your core infrastructure and integrations.
                </p>
            </div>
            <SystemHealthView />
        </div>
    )
}
