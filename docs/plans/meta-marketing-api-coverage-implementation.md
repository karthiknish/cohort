# Meta Marketing API Coverage — Implementation Plan

## Goal

Close the coverage audit in `docs/integrations/meta-marketing-api-coverage.md` for the Cohort Meta (Facebook) integration: targeting, audiences, conversions, tools, context-aware UI, and operational hooks (webhooks stored; CAPI/offline manual UI).

## Constraints & Preferences

- Graph API **v25.0** (`META_API_VERSION`); Meta provider id **`facebook`**
- Convex: `Errors.*`, `withErrorHandling`; frontend: `reportConvexFailure` / `notifyFailure`
- Targeting saves **merge** with existing ad set (`mergeMetaTargetingWithExisting`, `fetchMetaAdSetTargeting`) — partial UI saves must not drop audiences/placements
- Create campaign stays **classic** (no Advantage+ API mutations)
- CAPI hashing runs in Convex **`use node`** actions (dynamic import of `meta-capi-user-hash`)
- No commits unless user asks
- Minimize scope; match repo conventions

## Progress

### Done (prior sessions)

- Agent insights UI — charts in `agent-message-data.ts`, `agent-data-sections.tsx`, `agent-message-card.tsx`
- Excel export — Sheet 1 data, Sheet 2 charts
- Meta P0 — targeting merge, ad set pause/enable, audience delete, `metaDatetimeLocalToIso`
- Leads/engagement ad sets — `ObjectiveRenderer`, `promoted_object`, page posts/events
- Lead form on create creative; geo persist; audience `type: 'custom'`
- Sales pixel + `promoted_object`; custom audience attach; `updateMetaCampaign` + edit dialog
- Special ad categories on create campaign; `listMetaAds` + Meta ads strip; demographics edit
- Placements, customer file, async insights (`metaUseAsyncInsights`)
- Lookalikes — `createMetaLookalikeAudience`, UI, `subtype` on list
- Catalogs / DPA — `listProductCatalogs`, sales catalog mode, `PRODUCT_CATALOG_SALES`
- Ad review — `ad_review_feedback`, badges on `meta-ads-strip.tsx`
- CAPI, offline events, batch API — `adsMetaEvents.ts`, `meta-events-tools-panel.tsx`
- Pixel, Business Manager, Ad Library, webhooks — extended APIs, `meta-advanced-tools-panel.tsx`, inbound webhook storage
- Placement positions — `meta-placement-positions.ts`, audience controller draft + serialize
- Context-aware Meta UI — `meta-campaign-ui.ts`, conditional panels on campaign/account
- Meeting summary UX — consent, AI guardrails, recording prompt, markdown display

### Done (this session)

- [x] `docs/plans/meta-marketing-api-coverage-implementation.md` (this file)
- [x] Thermo-nuclear fix plan + archive/slugify/workforce splits (from parallel thread)
- [x] `salesOptimizationMode` passed into `CreateCreativeDialog` from campaign page (`campaign-insights-page-sections.tsx`)
- [x] `ObjectiveRenderer` on create campaign (`create-meta-campaign-dialog.tsx` + `objective-renderer.tsx`)
- [x] `docs/integrations/meta-permissions.md` (already existed)

### In Progress

- [ ] Webhook **consumer** (process `metaWebhookEvents` → sync campaigns/ads)
- [ ] Automated CAPI from product events/CRM (beyond manual tools panel)
- [ ] End-to-end QA on Meta flows (create campaign → ad set → creative → insights)

### Blocked

- Advantage+ campaign creation API (explicitly out of scope)
- Automated CAPI pipeline (manual UI only today)

## Key Decisions

- **Two-sheet Excel export**: Data sheet 1, charts sheet 2
- **Targeting merge on partial saves**: Preserves `custom_audiences`, placements, positions via `mergeMetaTargetingWithExisting`
- **Lead form on creative** (`leadgenFormId`), not ad set; ad set `promoted_object` uses `page_id` for leads
- **Catalog sales**: `PRODUCT_CATALOG_SALES` when `salesOptimizationMode === 'catalog'`; `DYNAMIC` creative only in catalog mode
- **CAPI PII**: Hash in Convex action via dynamic import; `capi.ts` accepts pre-hashed `hashedUserData` only
- **Account vs campaign tools**: `scope: 'account'` hides CAPI/offline in audience builder/automation; full tools on campaign insights with objective
- **Webhooks**: Verify token + `X-Hub-Signature-256` with `META_APP_SECRET`; payload stored in `metaWebhookEvents` (no downstream automation yet)

## Next Steps

1. Wire webhook consumer for campaign/ad status changes (optional automation)
2. QA Meta create campaign → ad set → creative → insights with objective-specific UI
3. Document env: `META_WEBHOOK_VERIFY_TOKEN`, `META_APP_SECRET`, webhook URL on deployment
4. Consider automated CAPI if product defines event sources

## Critical Context

| Area | Key paths |
|------|-----------|
| Coverage doc | `docs/integrations/meta-marketing-api-coverage.md` |
| Permissions | `docs/integrations/meta-permissions.md` |
| UI visibility | `src/lib/meta-campaign-ui.ts` |
| Targeting | `meta-targeting-serialize.ts`, `meta-placement-positions.ts`, `audience-control-section-controller.ts` |
| Audiences | `campaign-modules/audiences.ts`, `adsAudiencesMeta.ts`, `meta-audiences-panel.tsx` |
| Sales / DPA | `catalogs.ts`, `meta-ad-set-objective.ts`, `sales-objective-section.tsx` |
| CAPI / batch | `capi.ts`, `batch.ts`, `adsMetaEvents.ts`, `meta-events-tools-panel.tsx` |
| Advanced tools | `meta-advanced-tools-panel.tsx`, `campaign-meta-tools-section.tsx` |
| Webhooks | `convex/httpActions/metaWebhook.ts`, `convex/metaWebhookEvents.ts`, `convex/lib/metaWebhookAuth.ts` |
| Create campaign UI | `create-meta-campaign-dialog.tsx`, `objective-renderer.tsx` |
| Campaign insights | `campaign-insights-page-sections.tsx` (`salesOptimizationMode` → `CreateCreativeDialog`) |

**Original audit “Not implemented” — now largely wired**; intentional limits: Advantage+, automated CAPI consumer, webhook event processing.

## Verification

- `bun run typecheck`
- `bunx convex codegen` / deploy
- `src/lib/meta-campaign-ui.test.ts`, `meta-targeting-serialize.test.ts`, `meta-ad-set-objective.test.ts`
- Meeting / operations sheet tests where applicable