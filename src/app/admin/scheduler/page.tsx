import { SchedulerEventsView } from './components/scheduler-events-view'

export const metadata = {
  title: 'Scheduler Activity · Admin',
  description: 'Review cron and worker runs with processing metrics and severity indicators.',
}

export default function SchedulerActivityPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Scheduler activity</h1>
        <p className="text-sm text-muted-foreground">
          Monitor cron and background worker executions, inspect queue health, and review recent failures.
        </p>
      </div>
      <SchedulerEventsView />
    </div>
  )
}
