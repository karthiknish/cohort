'use client';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
export function ProposalsPageSkeleton() {
    const proposalSlots = ['proposal-1', 'proposal-2', 'proposal-3', 'proposal-4'];
    const stepSlots = ['step-1', 'step-2', 'step-3', 'step-4'];
    return (<div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44"/>
          <Skeleton className="h-4 w-72"/>
        </div>
        <Skeleton className="h-10 w-40 rounded-md"/>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40">
          <div className="flex flex-wrap gap-2">
            {stepSlots.map((slot) => (<Skeleton key={slot} className="h-8 w-28 rounded-full"/>))}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-xl"/>
          <div className="space-y-3">
            <Skeleton className="h-5 w-40"/>
            <Skeleton className="h-4 w-full"/>
            <Skeleton className="h-4 w-5/6"/>
            <Skeleton className="h-10 w-32 rounded-md"/>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Skeleton className="h-5 w-36"/>
        {proposalSlots.map((slot) => (<Card key={slot} className="border-muted/60 bg-background">
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="size-12 rounded-lg"/>
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48"/>
                <Skeleton className="h-3 w-64"/>
              </div>
              <Skeleton className="h-9 w-24 rounded-md"/>
            </CardContent>
          </Card>))}
      </div>
    </div>);
}
