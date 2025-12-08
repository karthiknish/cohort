export function formatDate(value: string | null | undefined): string {
    if (!value) return 'Date unavailable'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable'
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
