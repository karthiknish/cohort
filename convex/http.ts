import { httpRouter } from 'convex/server'

import { authComponent, createAuth } from './auth'
import { adSyncNotification, externalWebhook, stripeWebhook } from './httpActions'
import { run as adSyncWorker } from './adSyncWorker'

const http = httpRouter()

authComponent.registerRoutes(http, createAuth)

http.route({ path: '/webhooks/stripe', method: 'POST', handler: stripeWebhook })
http.route({ path: '/webhooks/ads-sync', method: 'POST', handler: adSyncNotification })
http.route({ path: '/webhooks/external', method: 'POST', handler: externalWebhook })
http.route({ path: '/cron/ad-sync-worker', method: 'POST', handler: adSyncWorker })

export default http
