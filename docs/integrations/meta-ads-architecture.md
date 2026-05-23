# Meta Ads integration architecture

Layer map for Meta (Facebook) ads in Cohort. Read top-down when adding a feature.

## Layers

```
UI (src/features/dashboard/ads/**)
  → hooks (use-ads-connections, campaign dialogs, audience controller)
  → convex-api (src/lib/convex-api.ts → api.ads*)
Convex (convex/ads*.ts, adsIntegrations/, adsMeta*)
  → withErrorHandling + Errors.*
Services (src/services/integrations/meta-ads/**)
  → Graph API modules (campaigns, adsets, creatives, audiences, capi, webhooks)
Lib (src/lib/meta-*.ts)
  → serialization, placements, CAPI user data, campaign UI helpers
```

## Key modules

| Concern | Location |
|---------|----------|
| OAuth + account linking | `convex/adsIntegrations/`, `use-ads-connections` |
| Campaign / ad set CRUD | `convex/adsMetaCampaigns.ts`, `adsAdSets.ts`, `meta-ads/campaign-modules/` |
| Creatives | `convex/adsCreatives.ts` → `adsCreativesActions/`, `meta-ads/creatives/` |
| Targeting serialize | `meta-targeting-serialize.ts`, `audience-control-*` |
| Audiences | `convex/adsAudiencesMeta.ts`, `meta-audiences-panel` |
| Metrics | `meta-ads/metrics.ts`, insights UI sections |
| CAPI / pixels | `meta-ads/capi.ts`, `pixels.ts`, `src/lib/meta-capi-*` |
| Webhooks | `convex/http.ts`, `metaWebhookEvents.ts`, `meta-webhook-fields.ts` |

## Conventions

- Throw `Errors.*` in Convex handlers; never bare `throw new Error`.
- UI mutations: `reportConvexFailure` / `notifyWarning`.
- Idempotency for creative create: `buildCreateCreativeIdempotencyKey` in `adsCreativesActions/shared.ts`.
- Preview mode: skip Convex loads (`isPreviewMode` on audience/campaign surfaces).
