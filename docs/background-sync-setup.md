# Background Sync Jobs Setup Guide

This guide covers how to set up and configure automated background sync jobs for the Cohorts platform. Background sync jobs are **critical** for keeping analytics data fresh by automatically pulling metrics from connected ad platforms (Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads).

## Quick Start

### 1. Environment Configuration

Add these required environment variables to your `.env.local`:

```bash
# Critical for sync jobs
INTEGRATIONS_CRON_SECRET=generate-a-secure-random-key-here
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # or http://localhost:3000 for development
ADMIN_EMAILS=admin@example.com,admin2@example.com
SCHEDULER_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...  # optional webhook for alerts
SCHEDULER_ALERT_FAILURE_THRESHOLD=3  # global default (overrides optional per provider/event)
```

### 2. Generate a Secure Cron Secret

```bash
# Generate a secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Test Health Check

```bash
curl https://yourdomain.com/api/health
```

### 4. Manual Sync Test

```bash
# Test manual scheduling (requires admin email)
curl -X POST https://yourdomain.com/api/integrations/schedule \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allUsers": true, "timeframeDays": 1}'
```

### 5. Configure Automation Preferences

- Open the dashboard and navigate to **Ads Hub → Automation controls**.
- Toggle **Enable automatic sync** per provider and choose the preferred cadence/lookback window.
- Changes update Firestore metadata and inform the cron scheduler on the next run.

## Architecture Overview

The background sync system consists of several API endpoints:

1. **`/api/integrations/cron`** - Main cron handler for job management
2. **`/api/integrations/worker`** - Batch job processor  
3. **`/api/integrations/schedule`** - Manual job scheduling
4. **`/api/integrations/process`** - Individual job processor (existing)
5. **`/api/health`** - System health monitoring

## Scheduling Options

### Option 1: Cloud Scheduler (Recommended for Production)

Create Cloud Scheduler jobs in Google Cloud:

```bash
# 1. Nightly sync at 2 AM UTC (processes all users)
gcloud scheduler jobs create http nightly-sync \
  --schedule="0 2 * * *" \
  --uri="https://yourdomain.com/api/integrations/cron" \
  --http-method=POST \
  --headers="Content-Type=application/json,x-cron-key=YOUR_CRON_SECRET" \
  --message-body='{"operation":"process_all_users","timeframeDays":1}'

# 2. Continuous processing every 5 minutes
gcloud scheduler jobs create http sync-worker \
  --schedule="*/5 * * * *" \
  --uri="https://yourdomain.com/api/integrations/worker" \
  --http-method=POST \
  --headers="Content-Type=application/json,x-cron-key=YOUR_CRON_SECRET" \
  --message-body='{"maxJobs":10}'

# 3. Weekly cleanup on Sundays at 3 AM UTC
gcloud scheduler jobs create http cleanup-jobs \
  --schedule="0 3 * * 0" \
  --uri="https://yourdomain.com/api/integrations/cron" \
  --http-method=POST \
  --headers="Content-Type=application/json,x-cron-key=YOUR_CRON_SECRET" \
  --message-body='{"operation":"cleanup_old_jobs"}'

# 4. Hourly stale job recovery
gcloud scheduler jobs create http reset-stale \
  --schedule="0 * * * *" \
  --uri="https://yourdomain.com/api/integrations/cron" \
  --http-method=POST \
  --headers="Content-Type=application/json,x-cron-key=YOUR_CRON_SECRET" \
  --message-body='{"operation":"reset_stale_jobs"}'
```

### Option 2: External Cron Services

#### GitHub Actions (Free tier available)

Create `.github/workflows/sync-jobs.yml`:

```yaml
name: Background Sync Jobs
on:
  schedule:
    # Every 5 minutes for worker
    - cron: '*/5 * * * *'
    # Daily at 2 AM UTC for full sync
    - cron: '0 2 * * *'
    # Weekly cleanup on Sundays
    - cron: '0 3 * * 0'

jobs:
  sync-worker:
    if: github.event.schedule == '*/5 * * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Process Sync Jobs
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/integrations/worker \
            -H "Content-Type: application/json" \
            -H "x-cron-key: ${{ secrets.CRON_SECRET }}" \
            -d '{"maxJobs": 10}'
  
  nightly-sync:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Schedule Daily Sync
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/integrations/cron \
            -H "Content-Type: application/json" \
            -H "x-cron-key: ${{ secrets.CRON_SECRET }}" \
            -d '{"operation": "process_all_users", "timeframeDays": 1}'
  
  weekly-cleanup:
    if: github.event.schedule == '0 3 * * 0'
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup Old Jobs
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/integrations/cron \
            -H "Content-Type: application/json" \
            -H "x-cron-key: ${{ secrets.CRON_SECRET }}" \
            -d '{"operation": "cleanup_old_jobs"}'
```

#### EasyCron / Cron-Job.org

Set up HTTP cron jobs with these configurations:

1. **Worker (every 5 minutes)**:
   - URL: `https://yourdomain.com/api/integrations/worker`
   - Method: POST
   - Headers: `Content-Type: application/json`, `x-cron-key: YOUR_SECRET`
   - Body: `{"maxJobs": 10}`

2. **Daily Sync (2 AM UTC)**:
   - URL: `https://yourdomain.com/api/integrations/cron`
   - Method: POST
   - Headers: `Content-Type: application/json`, `x-cron-key: YOUR_SECRET`
   - Body: `{"operation": "process_all_users", "timeframeDays": 1}`

### Option 3: Vercel Cron Functions

Create `api/cron/sync.js` in your Vercel project:

```javascript
// Requires Vercel Pro plan for cron functions
export default async function handler(req, res) {
  if (req.headers['x-vercel-cron-signature'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/worker`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-key': process.env.INTEGRATIONS_CRON_SECRET
    },
    body: JSON.stringify({ maxJobs: 10 })
  });
  
  const result = await response.json();
  res.status(200).json(result);
}
```

Then add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## API Endpoints Reference

### POST /api/integrations/cron

Main cron handler for job management operations.

**Authentication**: Requires `x-cron-key` header with `INTEGRATIONS_CRON_SECRET`

**Request Body**:
```json
{
  "operation": "process_all_users|cleanup_old_jobs|reset_stale_jobs",
  "maxUsers": 50,
  "jobType": "scheduled-sync|manual-sync|initial-backfill",
  "timeframeDays": 1
}
```

**Operations**:
- `process_all_users`: Enqueue sync jobs for all users with active integrations
- `cleanup_old_jobs`: Remove completed/failed jobs older than 7 days
- `reset_stale_jobs`: Reset jobs running longer than 30 minutes

### POST /api/integrations/worker

Batch job processor that handles multiple sync jobs per invocation.

**Authentication**: Requires `x-cron-key` header

**Request Body**:
```json
{
  "maxJobs": 10,
  "maxUsers": 50
}
```

### POST /api/integrations/schedule

Manual job scheduling (admin only).

**Authentication**: Requires Firebase ID token OR `x-cron-key` header

**Request Body**:
```json
{
  "userId": "user123",
  "providerId": "google", // optional, schedules for all if omitted
  "jobType": "manual-sync",
  "timeframeDays": 7,
  "allUsers": false // set to true to schedule for all users
}
```

### GET /api/health

System health check endpoint.

**No authentication required**

**Response**:
```json
{
  "status": "healthy|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "responseTime": 150,
  "checks": {
    "firebase": { "status": "ok", "responseTime": 50 },
    "stripe": { "status": "ok", "responseTime": 100 },
    "environment": { "status": "ok" }
  },
  "version": "0.1.0"
}
```

## Monitoring and Troubleshooting

### Check System Health

```bash
curl https://yourdomain.com/api/health
```

### View Integration Status

```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  https://yourdomain.com/api/integrations/status
```

### Manual Job Scheduling (Admin)

```bash
# Schedule sync for specific user
curl -X POST https://yourdomain.com/api/integrations/schedule \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "timeframeDays": 7}'

# Schedule for all users
curl -X POST https://yourdomain.com/api/integrations/schedule \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allUsers": true, "timeframeDays": 1}'
```

### Process Single Job (Cron)

```bash
curl -X POST https://yourdomain.com/api/integrations/process \
  -H "x-cron-key: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

## Development Setup

### Local Testing

1. Set `INTEGRATIONS_CRON_SECRET` in `.env.local`
2. Start the development server: `npm run dev`
3. Test endpoints using curl or Postman

### Manual Testing Commands

```bash
# Test health check
curl http://localhost:3000/api/health

# Test cron job scheduling
curl -X POST http://localhost:3000/api/integrations/cron \
  -H "x-cron-key: your-local-secret" \
  -H "Content-Type: application/json" \
  -d '{"operation": "process_all_users", "maxUsers": 1}'

# Test worker processing
curl -X POST http://localhost:3000/api/integrations/worker \
  -H "x-cron-key: your-local-secret" \
  -H "Content-Type: application/json" \
  -d '{"maxJobs": 1}'
```

## Best Practices

### Security
- Use a strong, randomly generated `INTEGRATIONS_CRON_SECRET`
- Rotate the cron secret periodically
- Monitor failed authentication attempts
- Restrict admin emails to trusted accounts

### Performance
- Start with conservative job limits (`maxJobs: 10`, `maxUsers: 50`)
- Monitor API rate limits for each integration provider
- Use the worker endpoint for continuous processing
- Use the cron endpoint for job scheduling only

### Reliability
- Set up multiple scheduling sources for redundancy
- Monitor health checks regularly
- Implement alerting for failed sync jobs
- Use the stale job reset operation hourly

### Monitoring
- Track sync job success/failure rates
- Monitor API response times
- Set up alerts for integration failures
- Log all cron job executions
- Review scheduler telemetry in `admin/scheduler/events` (Firestore) or the configured webhook channel.
- Automation UI in Ads Hub highlights the last sync/request timestamps per provider.

### Scheduler Insights

- Each cron or worker invocation records a structured event with counts for processed, queued, and failed jobs.
- Configure `SCHEDULER_ALERT_WEBHOOK_URL` (Slack/Teams compatible) to receive warnings on stuck queues or repeated failures (threshold defaults to 3 errors per run).
- Events older than seven days can be pruned via the existing `cleanup_old_jobs` operation.

## Troubleshooting

### Common Issues

1. **No jobs being processed**:
   - Check `INTEGRATIONS_CRON_SECRET` is set correctly
   - Verify cron jobs are actually running
   - Check health endpoint for connectivity issues

2. **Jobs failing with token errors**:
   - Verify integration tokens are still valid
   - Check if token refresh is working
   - Review provider API quotas and limits

3. **High memory usage**:
   - Reduce `maxJobs` and `maxUsers` parameters
   - Increase processing frequency to smaller batches

4. **Missing data in analytics**:
   - Check if sync jobs are being enqueued
   - Verify job completion status
   - Check for provider API changes

### Getting Help

1. Check the health endpoint: `/api/health`
2. Review application logs for error messages
3. Test manual job scheduling to isolate issues
4. Verify environment variables are set correctly

## Next Steps

After setting up background sync jobs:

1. **Set up monitoring**: Implement alerts for job failures
2. **Add rate limiting**: Protect against abuse of sync endpoints  
3. **Implement caching**: Cache frequently accessed data
4. **Add retry logic**: Handle transient failures gracefully
5. **Scale processing**: Add more worker instances as needed