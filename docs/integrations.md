# Ad Platform Integration Architecture

This document outlines how Cohorts links paid media accounts, ingests campaign data, and surfaces sync status inside the dashboard.

## Data Flow Overview

1. **Account linking (client)**
   - Users connect Google Ads, Meta Ads Manager, or LinkedIn Ads from the dashboard.
   - `AuthService.connect{Provider}AdsAccount` links the provider credential with Firebase Auth and persists tokens/scopes inside Firestore at `users/{userId}/adIntegrations/{providerId}`.
   - A `syncJobs` Firestore document is enqueued to request an initial 90-day backfill after each successful link.

  > **Meta redirect URI**
  >
  > When enabling the Meta Ads integration, set the authorized redirect URI inside Meta Business settings to `https://<your-domain>/api/integrations/meta/oauth/callback` (use `http://localhost:3000/api/integrations/meta/oauth/callback` during local development) and mirror that value in the `META_OAUTH_REDIRECT_URI` environment variable.

2. **Job processing (server)**
   - Server-side jobs (Cloud Functions or Next.js API routes run on the App Router) poll for queued records in `users/{userId}/syncJobs` with `status === 'queued'` and claim them atomically.
   - Each job exchanges stored access tokens for provider-specific API clients, requests spend/conversions/creative assets, normalizes the payload, and persists metrics in `users/{userId}/adMetrics/{yyyy-mm-dd}/{providerId}` documents.
   - After completion, the job document is updated with `status`, `processedAt`, and error details if any, while the integration doc receives `lastSyncedAt`, `lastSyncStatus`, and an optional `lastSyncMessage`.

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

users/{userId}/syncJobs/{jobId}
  providerId: 'google' | 'facebook' | 'linkedin'
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

## Next Steps

- Implement cron-driven Cloud Function (e.g., `processSyncJobs`) to iterate over users and run outstanding jobs.
- Persist provider insights inside BigQuery or Postgres if advanced querying is required beyond Firestore aggregation.
- Emit analytics/logging events for monitoring sync health and alerting.

## API & Scheduling Notes

- All integration APIs (`/api/integrations/status`, `/api/metrics`, `/api/integrations/process`) require an authenticated Firebase ID token via the `Authorization: Bearer <token>` header.
- Automation or cron jobs can use the `INTEGRATIONS_CRON_SECRET` environment variable and send it via `x-cron-key` header to bypass user tokens. Cron requests **must** specify `userId` explicitly.
- Recommended schedule: run `/api/integrations/process` every 5 minutes per agency tenant until the queue is empty. Each call processes a single job; scale horizontally by dispatching multiple concurrent workers if necessary.
- Ensure SyncJobs are re-enqueued periodically for incremental updates (e.g., nightly) to keep metrics fresh.
