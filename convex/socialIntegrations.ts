/** Public API surface only — internal helpers stay on submodule paths to limit TS depth. */
export { getStatus } from './socialIntegrations/queries'
export { discoverPages } from './socialIntegrations/discovery'
export {
  persistIntegrationTokens,
  confirmSurfaceBinding,
  disconnectIntegration,
} from './socialIntegrations/settings'
export { requestManualSync } from './socialIntegrations/syncJobs'
