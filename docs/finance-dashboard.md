# Finance Dashboard Module

## Location
- Primary entry point: `src/app/dashboard/finance/page.tsx`
- Shared UI primitives: `src/app/dashboard/finance/components/*`
- State and data orchestration: `src/app/dashboard/finance/hooks/use-finance-data.ts`
- Domain helpers: `src/app/dashboard/finance/utils.ts`
- Client service layer: `src/services/finance.ts`
- Server API handlers: `src/app/api/finance/route.ts`, `src/app/api/finance/costs/route.ts`
- Typed contracts: `src/types/finance.ts`

## High level flow
1. `FinancePage` renders the `FinanceDashboard` client component.
2. `FinanceDashboard` calls `useFinanceData` to pull metrics, invoices, costs, and chart data.
3. `useFinanceData` resolves client selection via `useClientContext`, fetches summaries through the finance service, and derives UI ready slices (stat cards, chart rows, cost totals, upcoming payments).
4. The finance service (`src/services/finance.ts`) wraps API calls with Firebase Auth tokens taken from `authService.getIdToken()`.
5. API routes live under `src/app/api/finance`. They authenticate requests (`authenticateRequest`) against Firebase Admin and read or mutate user scoped Firestore collections (`financeRevenue`, `financeInvoices`, `financeCosts`).
6. Responses are normalized against `FinanceSummaryResponse` and re-used across components through the hook.

## `FinanceDashboard` responsibilities
- Render loading skeleton until the initial fetch resolves (`FinanceDashboardSkeleton`).
- Surface fetch errors with the shared `Alert` component while allowing the rest of the UI to render stale data.
- Delegate visual sections to modular components:
  - `FinanceHeader` handles period selection, refresh, and potential invoice creation entry.
  - `FinanceStatsGrid` renders four KPI cards derived from totals.
  - `FinanceCostsCard` enables CRUD for operating costs (form submission and removal feed back into the hook).
  - `FinanceChartsSection` visualizes revenue vs expenses and expense composition using Recharts.
  - `FinanceInvoiceTable` filters and lists invoices, including export affordances.
  - `FinanceRevenueSidebar` shows top clients and upcoming payments.

Each child only receives the derived props it needs, keeping all business logic inside the hook.

## `useFinanceData` hook
- Hook signature returns state, derived props, and event handlers consumed by the dashboard. All mutations stay here.
- Enumerated return shape:
  - `selectedPeriod`, `setSelectedPeriod`: local UI filter (currently used for helper text; extend to API query by forwarding to `fetchFinanceSummary`).
  - `invoiceStatusFilter`, `setInvoiceStatusFilter`: controls `FinanceInvoiceTable` filtering.
  - `stats.cards`: array of stat descriptors `{ name, value, helper, icon }` passed to `FinanceStatsGrid`.
  - `stats.totalOutstanding`: outstanding balance used by `FinanceRevenueSidebar`.
  - `chartData`: normalized rows for Recharts (includes computed `totalExpenses` and `profit`).
  - `filteredInvoices`: memoized invoices filtered by status.
  - `invoices`: raw invoice array (exposed for future extensions).
  - `costs`: operating costs augmented with `monthlyValue` to support display badges.
  - `monthlyCostTotal`: aggregate used for both stats and chart overlays.
  - `revenueByClient`: top contributors list, derived from revenue records (falls back to invoices when records are absent).
  - `upcomingPayments`: next three due invoices.
  - `newCost`, `setNewCost`: controlled form state for cost creation.
  - `handleAddCost`: validates and posts a new cost via `createFinanceCost`, then reorders the local list.
  - `handleRemoveCost`: deletes a cost through the API and updates local state.
  - `removingCostId`: toggles loading state on the delete button per row.
  - `isSubmittingCost`: disables the submit button while posting a cost.
  - `isLoading`, `hasAttemptedLoad`: drive initial skeleton vs refresh spinner states.
  - `loadError`: message surfaced through the alert.
  - `refresh`: manual trigger that re-runs the finance summary fetch.

### UI state rules
- Initial mount: `hasAttemptedLoad` is false while `isLoading` is true, so the skeleton renders.
- Subsequent refresh: `hasAttemptedLoad` stays true; the same spinner animates inside the header button without hiding content.
- Errors: Hook resets data collections to empty arrays and supplies `loadError` while a toast displays the failure reason.

### Client awareness
`useFinanceData` reads `selectedClientId` from `useClientContext` to scope requests to a specific client. When no client is selected, it queries all user data. The API filters by `clientId` where applicable.

## Finance service (`src/services/finance.ts`)
- Centralizes authenticated fetches using the shared `authService` to avoid repeated ID token lookups at call sites.
- Exposes:
  - `fetchFinanceSummary({ clientId? })`: GET `api/finance`, optional `clientId` search param.
  - `createFinanceCost({ category, amount, cadence, clientId? })`: POST `api/finance/costs`.
  - `deleteFinanceCost(costId)`: DELETE `api/finance/costs?id=...`.
- Applies `cache: 'no-store'` to avoid stale data while refreshing.
- Throws descriptive errors consumed by the hook to power toast messaging.

## API routes
### `GET /api/finance`
- Authenticated via `authenticateRequest` (Firebase Admin custom logic).
- Reads from `users/{uid}/financeRevenue`, `financeInvoices`, and `financeCosts` collections, applying sane limits (`MAX_*` constants).
- Filters by `clientId` when provided. Costs always include shared (null client) entries.
- Serializes Firestore timestamps into ISO strings to match `FinanceSummaryResponse`.

### `POST /api/finance/costs`
- Requires the caller to be an authenticated admin (`assertAdmin`).
- Validates payload using `zod` (category, amount, cadence, optional client ID).
- Writes the doc with server timestamps and returns the normalized cost entry.

### `DELETE /api/finance/costs?id=...`
- Same admin auth.
- Removes a cost document and returns `{ ok: true }` on success.

All API failures propagate descriptive `error` strings to aid toast messaging.

## Utilities
- `formatCurrency(value, options?)`: wraps `Intl.NumberFormat` (USD default) to keep formatting consistent across stats, charts, and lists.
- `normalizeMonthly(amount, cadence)`: converts quarterly or annual spend into monthly equivalents for chart overlays.
- `formatCadence(cadence)`: human readable label for the cost list.

## Type definitions (`src/types/finance.ts`)
- `FinanceCostEntry`: describes stored costs, including optional `createdAt` and `updatedAt` ISO strings.
- `FinanceInvoice`: covers invoice metadata surfaced in the table.
- `FinanceRevenueRecord`: monthly revenue entries used for charting.
- `FinanceSummaryResponse`: bundle returned by `/api/finance`.
- Consuming components rely on these types for TypeScript safety; services cast API payloads accordingly.

## Extending the module
- Period filtering: plumb `selectedPeriod` into the API query (and Firestore collection filters) to reduce payload size when needed.
- Invoice actions: hook currently stubs view/download buttons; wire them to actual routes or storage URLs once invoices are persisted.
- Export tooling: `FinanceInvoiceTable` exposes an "Export CSV" button. Implement a handler leveraging `filteredInvoices` to generate actual CSV downloads.
- Permissions: Costs currently limited to admins. If contributors need access, adjust the `assertAdmin` guard and update storage rules.
- Client level dashboards: `useClientContext` already scopes data; add UI affordances (e.g., dropdown or breadcrumbs) to surface this filter above the finance dashboard.
- Invoice lifecycle: `POST /api/billing/webhook` processes Stripe invoice events (`invoice.finalized`, `invoice.paid`, `invoice.payment_failed`, `invoice.voided`) and keeps `financeInvoices` plus client aggregates fresh. If webhooks are unavailable, fall back to a scheduled polling job (e.g., Cloud Scheduler calling a cron endpoint) that walks `stripe.invoices.list` for recent activity and applies the same updates.

## Testing considerations
- Mock `authService.getIdToken()` when unit testing the finance service to avoid real Firebase calls.
- Provide stubbed `FinanceSummaryResponse` fixtures for hook/component tests; ensure derived metrics (totals, percentages) match expectations.
- Verify error states: simulate rejected fetches and confirm skeleton, alert, and toast behavior line up.

## Related modules
- `src/contexts/client-context.tsx`: Supplies client lists and chosen client ID for the finance hook.
- `src/components/ui/*`: Shared UI system reused across dashboards.
- `src/services/auth.ts`: Source of authenticated ID tokens used by finance service.

This document should provide enough context to troubleshoot data issues, add features, or onboard new contributors to the finance dashboard stack.
