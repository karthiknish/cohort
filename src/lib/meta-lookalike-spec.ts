/** Meta lookalike_spec.country — ISO 3166-1 alpha-2. */
export const META_LOOKALIKE_COUNTRIES = [
    { code: 'US', label: 'United States' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'AU', label: 'Australia' },
    { code: 'DE', label: 'Germany' },
    { code: 'FR', label: 'France' },
    { code: 'IN', label: 'India' },
    { code: 'BR', label: 'Brazil' },
    { code: 'MX', label: 'Mexico' },
    { code: 'JP', label: 'Japan' },
] as const;
export type MetaLookalikeCountryCode = (typeof META_LOOKALIKE_COUNTRIES)[number]['code'];
/** Preset audience sizes as fraction of country population (Meta `custom_ratio`). */
export const META_LOOKALIKE_RATIO_PRESETS = [
    { ratio: 0.01, label: '1% (most similar)' },
    { ratio: 0.02, label: '2%' },
    { ratio: 0.05, label: '5%' },
    { ratio: 0.1, label: '10%' },
] as const;
const MIN_RATIO = 0.01;
const MAX_RATIO = 0.2;
export function buildMetaLookalikeSpec(country: string, ratio: number): {
    type: 'custom_ratio';
    country: string;
    ratio: number;
} {
    const normalizedCountry = country.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalizedCountry)) {
        throw new Error('Country must be a 2-letter ISO code');
    }
    const normalizedRatio = Number(ratio);
    if (!Number.isFinite(normalizedRatio) || normalizedRatio < MIN_RATIO || normalizedRatio > MAX_RATIO) {
        throw new Error(`Lookalike ratio must be between ${MIN_RATIO} and ${MAX_RATIO}`);
    }
    return {
        type: 'custom_ratio',
        country: normalizedCountry,
        ratio: normalizedRatio,
    };
}
