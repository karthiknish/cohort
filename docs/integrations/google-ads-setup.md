# Google Ads API — setup runbook

Use this when connecting a Google Ads account to Cohort.

## Prerequisites

1. A Google Ads **manager account** with the target client account linked under it.
2. OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Authorized redirect URIs:
     - `{APP_URL}/api/integrations/google/oauth/callback`
     - `{APP_URL}/api/integrations/google-analytics/oauth/callback` (if using GA)
3. A Google Ads **developer token** from `https://ads.google.com/aw/apicenter`.

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_ADS_CLIENT_ID` | OAuth client ID |
| `GOOGLE_ADS_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | 22-character developer token |
| `GOOGLE_ADS_OAUTH_REDIRECT_URI` | Optional override; otherwise `{APP_URL}/api/integrations/google/oauth/callback` |
| `GOOGLE_ANALYTICS_CLIENT_ID` / `GOOGLE_ANALYTICS_CLIENT_SECRET` | If syncing GA properties |

## OAuth scopes

- `https://www.googleapis.com/auth/adwords`
- `openid`
- `email`

Google Analytics uses `https://www.googleapis.com/auth/analytics.readonly` instead of `adwords`.

## Developer token access level

- **Test access** can call `api/integrations/google/oauth` flows and use a test account.
- **Basic access** can read ad data (campaigns, metrics, audiences).
- **Standard access** can mutate campaigns, budgets, and targeting.

The app checks the developer token format (22 characters) before every API call. If Google returns `DEVELOPER_TOKEN_NOT_APPROVED` or `DEVELOPER_TOKEN_ERROR`, you must request a higher access level in the API Center.

## Account selection

1. User authorizes via OAuth. The start endpoint generates a PKCE `code_verifier` and stores it in the encrypted state.
2. Callback validates state and exchanges the code with `code_verifier`.
3. `adsIntegrations:listGoogleAdAccounts` lists all accessible accounts.
4. `adsIntegrations:initializeAdAccount` accepts the selected 10-digit customer ID.

### Important

- **Do not select the manager account root** as the sync target. Select a client account under the manager.
- Test accounts are flagged in the UI as `(Test)`.
- The `login-customer-id` header is automatically set to the manager account ID when the selected account is a client.

## Customer ID format

Customer IDs must be 10 digits without dashes:

```
1234567890
```

The integration strips non-digits and validates the length before API calls.

## Checklist after connecting

1. Confirm the account appears under **Ads → Connections**.
2. Run a manual sync; verify campaigns and metrics load.
3. Open the Google Ads campaign list and confirm budget/status are editable.
4. Optional: set up Google Analytics using the same OAuth flow if `GOOGLE_ANALYTICS_CLIENT_ID` is configured.

## Token security

Access, refresh, and ID tokens are currently stored as plaintext in the `adIntegrations` table. The `adIntegrations` `accessToken` field is used by `use node` actions. Encrypting tokens at rest is a planned hardening step and should be enabled before production traffic.

## References

- [Google Ads API call structure](https://developers.google.com/google-ads/api/docs/concepts/call-structure)
- [Developer token](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)
- [OAuth 2.0 for Google Ads API](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [PKCE for OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/native-app#exchange-authorization-code)
