'use client';
import { Skeleton } from '@/shared/ui/skeleton';
export function MarketingHomePageSkeleton() {
    const logoSlots = ['logo-1', 'logo-2', 'logo-3', 'logo-4', 'logo-5'];
    const featureSlots = ['feature-1', 'feature-2', 'feature-3', 'feature-4', 'feature-5', 'feature-6'];
    return (<div className="w-full bg-background">
      <section className="border-b border-primary/10 px-6 pb-16 pt-24 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="mx-auto h-12 w-72 max-w-full"/>
          <Skeleton className="mx-auto h-6 w-96 max-w-full"/>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Skeleton className="h-12 w-36 rounded-full"/>
            <Skeleton className="h-12 w-36 rounded-full"/>
          </div>
        </div>
        <Skeleton className="mx-auto mt-12 h-[280px] w-full max-w-5xl rounded-2xl"/>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-8">
          {logoSlots.map((slot) => (<Skeleton key={slot} className="h-8 w-24"/>))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureSlots.map((slot) => (<Skeleton key={slot} className="h-48 w-full rounded-2xl"/>))}
        </div>
      </section>
    </div>);
}
