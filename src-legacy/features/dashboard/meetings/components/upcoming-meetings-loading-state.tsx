import { Skeleton } from '@/shared/ui/skeleton';
export function UpcomingMeetingsLoadingState() {
    return <div className="space-y-3">{[0, 1, 2].map((slot) => <Skeleton key={slot} className="h-24 w-full rounded-lg"/>)}</div>;
}
