// This file is kept for backward compatibility
// Billing portal is now handled via Convex actions (billingApi.createPortalSession)

export async function createBillingPortalSession(_clientId: string | null): Promise<{ url: string }> {
  throw new Error('Use billingApi.createPortalSession from convex-api instead')
}
