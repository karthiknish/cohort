export function getElapsedTime(startTime: number, endTime?: number): string {
  const end = endTime ?? Date.now()
  const elapsed = end - startTime

  if (elapsed < 1000) return `${elapsed}ms`
  if (elapsed < 60000) return `${Math.floor(elapsed / 1000)}s`
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)}m ${Math.floor((elapsed % 60000) / 1000)}s`

  const hours = Math.floor(elapsed / 3600000)
  const minutes = Math.floor((elapsed % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}
