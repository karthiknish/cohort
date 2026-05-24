# Meta Marketing API coverage (Cohort)

Graph API version: **v25.0** (see `META_API_VERSION`).

## Wired (Convex + UI)

- OAuth, ad account discovery, metrics sync (cron + manual)
- Campaign list, pause/enable, budget, bidding
- **Create campaign** (`adsMetaCampaigns.createMetaCampaign`, exposed as `adsCampaignsApi.createMetaCampaign`) with **special ad categories** UI
- **Ad sets** list/create (optimization/billing + `promoted_object` for leads/engagement/sales), targeting update (`adsAdSets`)
- **Campaign edit** (name/schedule) on campaign insights header — `adsMetaCampaigns.updateMetaCampaign`
- **Custom audiences** attach to ad set targeting (Audience tab)
- **Pixel list** for sales ad sets (`listAdPixels`) + **pixel details/stats** in audience builder
- **Product catalogs / DPA** — catalog + product set pickers on sales ad sets (`listProductCatalogs`, `listProductSets`)
- Creatives list/create/update, **image + video upload** in create-ad dialog; **lead form** on create-ad for leads campaigns
- Targeting read; **write** via ad set `targeting` update
- **Targeting search** (interests, geo typeahead) in Audience tab
- Custom audiences: create empty container, **list**, lookalike create, customer upload in audience builder / campaign targeting
- **Leadgen forms** list/create in leads objective section (when `metaContext` with page ID is provided)
- Campaign/ad insights, ad-level metrics
- **CAPI / offline / batch** — audience builder Meta tools
- **Business Manager** — list businesses + ad accounts (`listBusinesses`, `listBusinessAdAccounts`)
- **Ad Library** — `searchAdLibrary` (requires Ad Library API permission)
- **Ad account webhooks** — `listAdAccountWebhooks`, `updateAdAccountWebhooks`, `clearAdAccountWebhooks`

## Wired (Convex only — no UI yet)
- (none — async insights toggle is in Ads automation controls)

## Recently wired (API + UI)

- Ad set pause/enable — `adsAdSets.updateAdSetStatus` + campaign ads **Ad sets** strip
- Delete custom audience — `adsAudiencesMeta.deleteAudience` + audience panel delete
- Targeting save merges with existing ad set targeting (preserves custom audiences / placements)
- Create campaign schedule fields convert `datetime-local` → UTC ISO for Meta
- **`listMetaAds`** — campaign page **Ads (Meta)** strip with pause/enable (`adsMetaTools.listMetaAds`)
- **Demographics edit** — age min/max + gender save to ad set targeting (Audience tab)
- **Placements edit** — publisher platforms save to ad set (`publisher_platforms`)
- **Customer file upload** — hashed emails to custom audience (`uploadAudienceUsers`)
- **Async insights** — per-workspace toggle on Meta automation card (+ env fallback)
- **Lookalike audiences** — create from source custom audience in audience builder (`createLookalikeAudience`)
- **Catalog sales ad sets** — `PRODUCT_CATALOG_SALES` + `product_catalog_id` / optional `product_set_id` in create ad set
- **Ad review** — `ad_review_feedback` + `issues_info` on campaign **Ads (Meta)** strip
- **CAPI** — `sendCapiEvents` (hashed PII server-side)
- **Offline events** — `sendOfflineEvents` via CAPI `physical_store` action source
- **Batch API** — `executeBatch` (≤50 requests)
- **Pixel stats** — `getPixelStats`, `getPixelDetails`
- **Business / Ad Library / Webhooks** — `meta-advanced-tools-panel` in audience builder

## Not implemented

- (none — Meta Marketing API coverage items from original audit are wired)

## UI notes

- **Create ad set** dialog mounts `ObjectiveRenderer` for leads/engagement (Page picker, lead forms, post/event pickers)
- Geo search saves to ad set targeting (Audience tab → Geography → Edit → Save)
- Location map pins remain approximate (geocoded for display; Meta geo keys are authoritative)
- TikTok campaign bidding updates return a clear error (ad group level in TikTok Ads Manager)
- **Audience builder (Meta)** — audiences, lookalikes, CAPI/offline/batch, pixel/business/ad library/webhooks tools
- **Automation controls** — async insights + CAPI tools when card is mounted on Ads page
