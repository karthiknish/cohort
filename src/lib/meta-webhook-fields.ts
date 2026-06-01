/** Meta Marketing API `subscribed_fields` for ad account webhooks. */
export const META_AD_ACCOUNT_WEBHOOK_FIELDS = [
    'adaccount',
    'campaigns',
    'adsets',
    'ads',
    'creatives',
] as const;
export type MetaAdAccountWebhookField = (typeof META_AD_ACCOUNT_WEBHOOK_FIELDS)[number];
