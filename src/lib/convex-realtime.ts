export function isConvexRealtimeEnabled(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_CONVEX_URL) &&
    process.env.NEXT_PUBLIC_USE_BETTER_AUTH === 'true' &&
    process.env.NEXT_PUBLIC_COHORTS_USE_CONVEX_REALTIME === 'true'
  )
}
