# Google Ads integration architecture

Layer map for Google Ads in Cohort. Read top-down when adding a feature.

## Layers

```
UI (src/features/dashboard/ads/**)
  → hooks (use-ads-connections, use-ads-provider-setup, google-setup-dialog)
  → convex-api (src/lib/convex-api.ts → api.adsIntegrations)
Convex (convex/domains/marketing/ads*.ts, adsIntegrations/)
  → withErrorHandling + Errors.*
Services (src/services/integrations/google-ads/**)
  → client.ts (googleAdsSearch, executeGoogleAdsApiRequest, rate-limit helpers)
  → campaign-crud.ts, campaign-modules/ (campaign mutations)
  → audience-targeting.ts (audience CRUD)
  → metrics.ts (fetchGoogleAdsMetrics, fetchGoogleAdAccounts, health check)
Lib (src/lib/integration-token-refresh-google.ts, src/lib/ads-admin.ts)
  → token refresh, credential persistence, sync scheduling
```

## Key modules

| Concern | Location |
|---------|----------|
| OAuth + account linking | `convex/adsIntegrations/`, `src/services/google-oauth.ts`, `use-ads-connections` |
| Account discovery / setup | `adsIntegrations/discovery.ts`, `adsIntegrations/accountInit.ts`, `google-setup-dialog.tsx` |
| Campaign CRUD | `adsCampaigns.ts`, `google-ads/campaign-crud.ts`, `google-ads/campaign-modules/` |
| Audiences | `adsAudiences.ts`, `adsTargeting.ts`, `google-ads/audience-targeting.ts` |
| Creatives | `adsCreativesActions/`, `google-ads/creative-modules/` |
| Metrics | `adsAdMetrics.ts`, `adsCampaignInsights.ts`, `google-ads/metrics.ts` |
| Token refresh | `src/lib/integration-token-refresh-google.ts`, `src/lib/ads-admin.ts` |
| Sync workers | `adSyncWorkerActions.ts` |

## Conventions

- Throw `Errors.*` in Convex handlers; never bare `throw new Error`.
- UI mutations: `reportConvexFailure` / `notifyWarning`.
- Google Ads customer IDs are normalized to 10 digits in `normalizeGoogleAdsAccountId` (`adsIntegrations/shared.ts`).
- Manager accounts are surfaced for visibility but cannot be selected as the sync target; choose a client account under the manager.
- Developer tokens are validated to be a 22-character string before any API call.
- OAuth uses PKCE (`code_challenge` / `code_verifier`) for both Ads and Google Analytics flows.
