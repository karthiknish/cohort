# Meta Marketing API — permissions runbook

Use this when connecting a Meta app to Cohort ads features. Permissions are granted at the **Meta app** level and reflected in the user OAuth token stored on `adIntegrations`.

## Core ads (required for campaigns, ad sets, creatives, targeting)

| Permission | Used for |
|------------|----------|
| `ads_management` | Create/update campaigns, ad sets, ads, creatives |
| `ads_read` | List campaigns, insights, targeting, review status |
| `business_management` | Resolve ad accounts under Business Manager |

## Audiences & targeting

| Permission | Used for |
|------------|----------|
| `ads_management` | Custom audiences, lookalikes, customer file upload |
| — | Geo/interest search uses Marketing API targeting search (same token) |

## Pixels, CAPI, offline events

| Permission | Used for |
|------------|----------|
| `ads_read` | List pixels, pixel stats |
| — | CAPI (`/events`) and offline event sets use the pixel/offline dataset token from the connected ad account |

Configure test events with a **test event code** from Events Manager when validating CAPI from **Meta tools → Events**.

## Business Manager & Ad Library

| Permission | Used for |
|------------|----------|
| `business_management` | List businesses and owned ad accounts |
| `ads_read` | Ad Library search (public ads; some filters need additional access) |

## Webhooks

1. **Subscribe** (in app): **Meta tools → Pixels & webhooks** uses `subscribed_apps` on the ad account.
2. **Receive** (server): Point Meta to your Convex HTTP URL:

   `https://<deployment>.convex.site/webhooks/meta`

   Environment variables:

   | Variable | Purpose |
   |----------|---------|
   | `META_WEBHOOK_VERIFY_TOKEN` | Must match **Verify Token** in Meta App Dashboard → Webhooks |
   | `META_APP_SECRET` | Validates `X-Hub-Signature-256` on POST payloads |

   GET handles Meta subscription verification (`hub.challenge`). POST events are stored in `metaWebhookEvents` for inspection (no automatic sync yet).

## Automation & insights

| Setting | Permission / notes |
|---------|-------------------|
| Async insights (`metaUseAsyncInsights` on integration) | `ads_read`; large accounts may need async report jobs |
| Ad sync worker | `ads_read` + valid refresh token |

## Advantage+ campaigns

Meta no longer supports creating **Advantage+** campaign types via Marketing API mutations in this integration. Create classic campaigns in Cohort; use Meta Ads Manager for Advantage+ shopping/app campaigns.

## Checklist after connecting

1. Confirm ad account appears under **Ads → Connections**.
2. Run a manual sync; verify campaigns and insights load.
3. Open a Meta campaign → **Audience targeting** → edit placements (platforms + positions).
4. Optional: send a test CAPI event; subscribe webhooks and confirm GET verification succeeds.

## References

- [Marketing API permissions](https://developers.facebook.com/docs/marketing-api/overview/authorization)
- [Webhooks for ad accounts](https://developers.facebook.com/docs/marketing-api/guides/webhooks)
- In-repo coverage: `docs/integrations/meta-marketing-api-coverage.md`
