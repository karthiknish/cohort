export interface PptViewerProps {
    url: string;
    /** Optional callback to fetch a fresh signed URL when the current one expires (503). */
    refreshUrl?: () => Promise<string | null>;
    className?: string;
    title?: string;
}
