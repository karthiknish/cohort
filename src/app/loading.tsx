import { Skeleton } from '@/shared/ui/skeleton'

const HERO_LINE_SLOTS = ['hero-line-1', 'hero-line-2', 'hero-line-3']
const FEATURE_CARD_SLOTS = ['feature-card-1', 'feature-card-2', 'feature-card-3']

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </header>

        <main className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-5">
            <Skeleton className="h-12 w-3/4" />
            {HERO_LINE_SLOTS.map((slot) => (
              <Skeleton key={slot} className="h-4 w-full max-w-2xl" />
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-11 w-36 rounded-md" />
              <Skeleton className="h-11 w-32 rounded-md" />
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 p-6">
            <Skeleton className="h-[320px] w-full rounded-xl" />
          </section>
        </main>

        <section className="grid gap-4 md:grid-cols-3">
          {FEATURE_CARD_SLOTS.map((slot) => (
            <div key={slot} className="space-y-3 rounded-xl border border-border/60 p-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
