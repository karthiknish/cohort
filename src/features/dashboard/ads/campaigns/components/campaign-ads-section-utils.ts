export function isAdEnabled(status: string) {
    const normalizedStatus = status.toUpperCase();
    return normalizedStatus === 'ACTIVE' || normalizedStatus === 'ENABLED' || normalizedStatus === 'ENABLE';
}
