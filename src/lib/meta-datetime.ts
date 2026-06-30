/** Convert a browser `datetime-local` value to Meta-compatible ISO 8601 UTC. */
export function metaDatetimeLocalToIso(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime()))
        return undefined;
    return parsed.toISOString();
}
/** Convert Meta ISO timestamp to `datetime-local` input value (local timezone). */
export function metaIsoToDatetimeLocal(value?: string): string {
    if (!value?.trim())
        return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()))
        return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
