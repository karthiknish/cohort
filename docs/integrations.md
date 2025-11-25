# Ad Platform Integration Architecture

This document outlines how Cohorts links paid media accounts, ingests campaign data, and surfaces sync status inside the dashboard.

## Data Flow Overview

1. **Account linking (client)**
   - Users connect Google Ads, Meta Ads Manager, LinkedIn Ads, or TikTok Ads from the dashboard.
   - `AuthService.connect{Provider}AdsAccount` links the provider credential with Firebase Auth and persists tokens/scopes inside Firestore at `users/{userId}/adIntegrations/{providerId}`.
   - A `syncJobs` Firestore document is enqueued to request an initial 90-day backfill after each successful link.

  > **Meta redirect URI**
  >
  > When enabling the Meta Ads integration, set the authorized redirect URI inside Meta Business settings to `https://<your-domain>/api/integrations/meta/oauth/callback` (use `http://localhost:3000/api/integrations/meta/oauth/callback` during local development) and mirror that value in the `META_OAUTH_REDIRECT_URI` environment variable.

  > **TikTok redirect URI**
  >
  > When enabling the TikTok Ads integration, register your app in the [TikTok for Business Developer Portal](https://business-api.tiktok.com/portal/apps) and set the authorized redirect URI to `https://<your-domain>/api/integrations/tiktok/oauth/callback` (use `http://localhost:3000/api/integrations/tiktok/oauth/callback` during local development). Configure the following environment variables:
  > - `TIKTOK_CLIENT_KEY` - Your TikTok app's client key
  > - `TIKTOK_CLIENT_SECRET` - Your TikTok app's client secret
  > - `TIKTOK_OAUTH_REDIRECT_URI` - The redirect URI registered in TikTok Developer Portal
  > - `TIKTOK_OAUTH_SCOPES` - Comma-separated scopes (e.g., `ads.read,ads.management`)

2. **Automated scheduling (server)**
  - `/api/integrations/schedule` queues sync jobs for a single user or the entire tenant when invoked with the `x-cron-key` header (`INTEGRATIONS_CRON_SECRET`).
  - Scheduling respects per-integration preferences stored on `adIntegrations` (`autoSyncEnabled`, `syncFrequencyMinutes`, `scheduledTimeframeDays`) and skips providers that synced recently or already have queued jobs.
  - Force scheduling is available for on-demand backfills by passing `{"force": true}` in the request body; admin users can call this endpoint directly from the dashboard tooling.
  - Ads Hub features **Automation controls** so admins can toggle auto-sync and adjust cadence/lookback values per provider without touching Firestore directly.

3. **Job processing (server)**
  - Server-side jobs (Cloud Functions or App Router API routes) poll for queued records in `users/{userId}/syncJobs` with `status === 'queued'` and claim them atomically.
  - Each job exchanges stored access tokens for provider-specific API clients, requests spend/conversions/creative assets, normalizes the payload, and persists metrics in `users/{userId}/adMetrics/{yyyy-mm-dd}/{providerId}` documents.
  - After completion, the job document is updated with `status`, `processedAt`, and error details if any, while the integration doc receives `lastSyncedAt`, `lastSyncStatus`, `lastSyncMessage`, and `lastSyncRequestedAt`.

3. **Dashboard status (client)**
   - The dashboard calls `/api/integrations/status?userId=<uid>` to read the latest metadata from `adIntegrations` and drive the UI badges.
   - Future iterations should add polling or webhooks to reflect job progress in near real time.

## Firestore Collections

```
users/{userId}/adIntegrations/{providerId}
  accessToken: string | null
  idToken: string | null
  scopes: string[]
  linkedAt: Timestamp
  lastSyncStatus: 'pending' | 'success' | 'error' | 'never'
  lastSyncedAt: Timestamp | null
  lastSyncRequestedAt: Timestamp | null
  lastSyncMessage: string | null
  autoSyncEnabled: boolean | null
  syncFrequencyMinutes: number | null
  scheduledTimeframeDays: number | null

users/{userId}/syncJobs/{jobId}
  providerId: 'google' | 'facebook' | 'linkedin' | 'tiktok'
  jobType: 'initial-backfill' | 'scheduled-sync' | 'manual-sync'
  timeframeDays: number
  status: 'queued' | 'running' | 'success' | 'error'
  createdAt: Timestamp
  startedAt: Timestamp | null
  processedAt: Timestamp | null
  errorMessage: string | null

users/{userId}/adMetrics/{periodId}/{providerDocId}
  providerId: string
  date: string (YYYY-MM-DD)
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number | null
  creatives: Array<{ id: string; name: string; type: string; url?: string }>
  rawPayloadRef: string | null (path to storage object for full JSON)
```

## Server Job Responsibilities

- **Token Refresh**: When provider tokens support refresh operations (e.g., Google Ads), store refresh tokens in a secure location (Firestore with security rules or Cloud Secret Manager) and refresh before each sync.
- **Rate Limiting & Retry**: Use exponential backoff for provider API errors and write partial failures to `lastSyncMessage`.
- **Historical Backfill**: Initial queues request a 90-day range. Scheduled cron jobs can later enqueue 1-day incremental sync jobs.

## Security Considerations

- Store OAuth tokens in Firestore only if rules restrict access to the owning user and server processes.
- For production, prefer moving sensitive credentials to Cloud Secret Manager and keep Firestore documents as references.
- Ensure Next.js API routes that manipulate tokens validate the caller is authenticated and matches the `userId`.

## Ingestion Requirements & Assumptions

- **Supported sources**: Google Ads, Meta Ads Manager, LinkedIn Ads, TikTok Ads (expandable via `providerId`). Each source must supply spend, impressions, clicks, conversions, and creative metadata. Optional revenue is accepted when providers surface ROAS data.
- **Sync cadence**: Nightly incremental syncs (UTC) with optional manual triggers. Initial backfill spans 90 days to populate historical dashboards.
- **Attribution window**: Default 7-day click / 1-day view. Providers that expose alternative windows should persist raw values inside `rawPayloadRef` for downstream reconciliation.
- **Firestore contract**:
  - `adIntegrations` documents capture OAuth scopes, last sync timestamps, and human-readable status messaging.
  - `syncJobs` documents act as durable queues and must be updated atomically when workers claim jobs.
  - `adMetrics` collections store daily aggregates; document IDs should follow `YYYY-MM-DD_providerId` to simplify pagination and incremental reads.
- **Error handling**: Workers append diagnostic context to `lastSyncMessage` and set `status: 'error'` while leaving the job in place for manual retry.
- **Rate limits**: Assume 10 QPS per provider credential; workers maintain exponential backoff starting at 1s doubling to 64s with jitter.

### Normalized payload shape

```json
{
  "providerId": "google",
  "date": "2025-10-31",
  "currencyCode": "USD",
  "spend": 1234.56,
  "impressions": 98765,
  "clicks": 4321,
  "conversions": 210,
  "revenue": 3456.78,
  "creatives": [
    { "id": "123", "name": "Holiday Promo", "type": "video", "url": "https://example.com" }
  ],
  "campaign": {
    "id": "456",
    "name": "Q4 Awareness",
    "objective": "BRAND_AWARENESS"
  },
  "rawPayloadRef": "users/abc/integrationPayloads/2025-10-31-google.json"
}
```

### Validation checklist

- [ ] Provider connector returns data matching the normalized payload.
- [ ] Firestore rules allow workers to read/write `syncJobs` and `adMetrics` for the scoped agency.
- [ ] Dashboard queries (`/api/metrics`, `/api/analytics/insights`) tolerate empty days and sparse creative arrays.
- [ ] Integration errors are surfaced via `lastSyncStatus` and `lastSyncMessage` for the UI banner.

## Next Steps

- Evaluate adaptive scheduling heuristics that respond to spend or recent failures.
- Persist provider insights inside BigQuery or Postgres if advanced querying is required beyond Firestore aggregation.
- Emit analytics/logging events for monitoring sync health and alerting.

## API & Scheduling Notes

- All integration APIs (`/api/integrations/status`, `/api/metrics`, `/api/integrations/process`) require an authenticated Firebase ID token via the `Authorization: Bearer <token>` header.
- `POST /api/integrations/manual-sync` lets authenticated workspace owners queue a one-off sync for the specified provider (`providerId`). The endpoint forces scheduling immediately and is what the dashboard uses for the "Run sync now" button.
- Automation or cron jobs can use the `INTEGRATIONS_CRON_SECRET` environment variable and send it via `x-cron-key` header to bypass user tokens. Cron requests **must** specify `userId` explicitly.
- Cron setup:
  - **Queue jobs**: call `POST /api/integrations/schedule` with header `x-cron-key: ${INTEGRATIONS_CRON_SECRET}` every 6 hours (or desired cadence). Use `{ "allUsers": true }` to fan out across tenants.
  - **Process jobs**: call `POST /api/integrations/process` with the same header every 5 minutes in parallel workers (each invocation processes the next available job).
- Ensure SyncJobs are re-enqueued periodically (the scheduler handles this automatically based on `syncFrequencyMinutes`) to keep metrics fresh.
- Optional: configure `SCHEDULER_ALERT_WEBHOOK_URL` and (if needed) `SCHEDULER_ALERT_FAILURE_THRESHOLD` to receive webhook alerts when cron/worker runs fail repeatedly or observe stuck queues.
  - API calls provide an optional per-run override (`failureThresholdOverride`) so high-volume providers can relax or tighten alerting as traffic scales.
