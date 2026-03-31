import Link from 'next/link'

const KPI_CARDS = [
  { id: 'clients', label: 'Total Clients', value: '48', delta: '+12%', deltaClass: 'bg-info/20 text-info' },
  { id: 'campaigns', label: 'Active Campaigns', value: '23', delta: '+4', deltaClass: 'bg-success/20 text-success' },
  { id: 'revenue', label: 'Revenue (MTD)', value: '$84k', delta: '+18%', deltaClass: 'bg-warning/20 text-warning' },
] as const

const CHART_BARS = [
  { id: 'mon', cls: 'h-[60%]' },
  { id: 'tue', cls: 'h-[80%]' },
  { id: 'wed', cls: 'h-[45%]' },
  { id: 'thu', cls: 'h-[90%]' },
  { id: 'fri', cls: 'h-[65%]' },
  { id: 'sat', cls: 'h-[75%]' },
  { id: 'sun', cls: 'h-[85%]' },
] as const

const RECENT_CLIENTS = [
  { id: 'apex', name: 'Apex Media' },
  { id: 'bluewave', name: 'BlueWave Co.' },
  { id: 'stratsoft', name: 'StratSoft' },
  { id: 'novex', name: 'Novex' },
] as const

const SIDEBAR_ICONS = ['home', 'clients', 'campaigns', 'analytics', 'inbox'] as const

export function DashboardPreview() {
  return (
    <div className="group relative mx-auto w-full max-w-4xl">
      <Link
        href="/dashboard"
        aria-label="Open Cohorts Dashboard"
        className="block overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 bg-secondary px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-warning/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <div className="ml-3 flex-1 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/40">
            app.cohorts.ai/dashboard
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="flex h-72 bg-background sm:h-80 md:h-96">
          {/* Left sidebar */}
          <div className="flex w-12 flex-col items-center gap-3 bg-primary py-4 sm:w-14">
            <div className="h-7 w-7 rounded-lg bg-white/25" />
            {SIDEBAR_ICONS.map((icon) => (
              <div key={icon} className="h-5 w-5 rounded bg-white/10" />
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden p-3 sm:p-4">
            {/* Top bar */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="h-6 w-36 rounded-lg bg-muted sm:w-48" />
              <div className="h-6 w-24 rounded-lg bg-primary/10 sm:w-28" />
            </div>

            {/* KPI cards */}
            <div className="mb-3 grid grid-cols-3 gap-2 sm:gap-3">
              {KPI_CARDS.map((card) => (
                <div key={card.id} className="rounded-xl border border-border bg-background p-2 shadow-sm sm:p-3">
                  <p className="text-[9px] font-medium text-muted-foreground sm:text-[10px]">{card.label}</p>
                  <p className="mt-0.5 text-base font-bold text-primary sm:mt-1 sm:text-xl">{card.value}</p>
                  <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:text-[10px] ${card.deltaClass}`}>
                    {card.delta}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart + clients row */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {/* Bar chart */}
              <div className="col-span-3 rounded-xl border border-border bg-background p-2 shadow-sm sm:p-3">
                <p className="mb-2 text-[9px] font-medium text-muted-foreground sm:text-[10px]">Campaign Performance</p>
                <div className="flex h-14 items-end gap-1 sm:h-16 sm:gap-1.5">
                  {CHART_BARS.map((bar) => (
                    <div
                      key={bar.id}
                      className={`flex-1 rounded-t-sm bg-primary/20 ${bar.cls}`}
                    />
                  ))}
                </div>
              </div>

              {/* Recent clients */}
              <div className="col-span-2 rounded-xl border border-border bg-background p-2 shadow-sm sm:p-3">
                <p className="mb-2 text-[9px] font-medium text-muted-foreground sm:text-[10px]">Recent Clients</p>
                <div className="space-y-1.5">
                  {RECENT_CLIENTS.map((client) => (
                    <div key={client.id} className="flex items-center gap-1.5">
                      <div className="h-4 w-4 shrink-0 rounded-full bg-primary/20" />
                      <div className="h-2.5 flex-1 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
        >
          <div className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg">
            Open Dashboard →
          </div>
        </div>
      </Link>
    </div>
  )
}
