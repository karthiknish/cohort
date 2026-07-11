// Settings page utility functions
/**
 * Compute avatar initials from a name or email.
 */
export function getAvatarInitials(name?: string | null, email?: string | null): string {
    const source = name?.trim() || email?.trim() || 'C';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return 'C';
    }
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    const value = `${first}${last}`.toUpperCase();
    return value || 'C';
}
