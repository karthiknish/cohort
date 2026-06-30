/**
 * Meta ad CTA types — canonical enum values and human-readable labels.
 * Always prefer API `type` over localized `name` (e.g. BOOK_NOW vs "Book Travel").
 */
export const META_CTA_LABELS: Record<string, string> = {
    LEARN_MORE: 'Learn More',
    SHOP_NOW: 'Shop Now',
    BOOK_NOW: 'Book Now',
    BOOK_TRAVEL: 'Book Travel',
    SIGN_UP: 'Sign Up',
    APPLY_NOW: 'Apply Now',
    INSTALL_NOW: 'Install Now',
    INSTALL_MOBILE_APP: 'Install App',
    USE_APP: 'Use App',
    GET_OFFER: 'Get Offer',
    DOWNLOAD: 'Download',
    WATCH_MORE: 'Watch More',
    WATCH_VIDEO: 'Watch Video',
    CONTACT_US: 'Contact Us',
    SEND_MESSAGE: 'Send Message',
    MESSAGE_PAGE: 'Send Message',
    LISTEN_NOW: 'Listen Now',
    SUBSCRIBE: 'Subscribe',
    GET_QUOTE: 'Get Quote',
    GET_SHOWTIMES: 'Get Showtimes',
    REQUEST_TIME: 'Request Time',
    SEE_MENU: 'See Menu',
    ORDER_NOW: 'Order Now',
    BUY_NOW: 'Buy Now',
    DONATE_NOW: 'Donate Now',
    GET_DIRECTIONS: 'Get Directions',
    CALL_NOW: 'Call Now',
    WHATSAPP_MESSAGE: 'WhatsApp',
    NO_BUTTON: 'No Button',
};
const META_CTA_TYPE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
/** Extract canonical Meta CTA enum from API fields or stored strings. */
export function normalizeMetaCallToActionType(raw: string | undefined | null): string | undefined {
    if (typeof raw !== 'string')
        return undefined;
    const trimmed = raw.trim();
    if (!trimmed)
        return undefined;
    const parenMatch = trimmed.match(/\(([A-Z][A-Z0-9_]+)\)\s*$/);
    if (parenMatch?.[1] && META_CTA_LABELS[parenMatch[1]]) {
        return parenMatch[1];
    }
    const upperSnake = trimmed.toUpperCase().replace(/[\s-]+/g, '_');
    if (META_CTA_TYPE_PATTERN.test(upperSnake) && META_CTA_LABELS[upperSnake]) {
        return upperSnake;
    }
    if (META_CTA_TYPE_PATTERN.test(trimmed) && META_CTA_LABELS[trimmed]) {
        return trimmed;
    }
    return undefined;
}
export function formatMetaCallToActionLabel(raw: string | undefined | null): string | undefined {
    const type = normalizeMetaCallToActionType(raw);
    if (type) {
        return META_CTA_LABELS[type] ?? type;
    }
    if (typeof raw === 'string' && raw.trim()) {
        return raw.trim();
    }
    return undefined;
}
export function resolveMetaCallToActionType(callToAction?: {
    type?: string;
    name?: string;
} | null, fallbackType?: string): string | undefined {
    const fromObject = normalizeMetaCallToActionType(callToAction?.type);
    if (fromObject)
        return fromObject;
    const fromFallback = normalizeMetaCallToActionType(fallbackType);
    if (fromFallback)
        return fromFallback;
    // Do not map display-only names — they are localized and often wrong for the enum.
    return undefined;
}
