/** Public API surface only — internal helpers stay on submodule paths to limit TS depth. */
export { getStatus } from './domains/marketing/socialIntegrations/queries'
export { discoverPages } from './domains/marketing/socialIntegrations/discovery'
export {
  persistIntegrationTokens,
  confirmSurfaceBinding,
  disconnectIntegration,
} from './domains/marketing/socialIntegrations/settings'
export { requestManualSync } from './domains/marketing/socialIntegrations/syncJobs'
