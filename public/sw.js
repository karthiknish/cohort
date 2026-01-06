const CACHE_NAME = 'cohorts-pwa-v2'
const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
]

// Paths that should never be cached (dynamic content)
const NEVER_CACHE_PATTERNS = [
  /\/_next\/data\//,      // Next.js data requests
  /\/api\//,              // API routes
  /\?_rsc=/,              // RSC query params
]

// Check if request should bypass cache
function shouldBypassCache(request) {
  const url = new URL(request.url)
  
  // RSC requests have special headers - never cache these
  if (request.headers.get('RSC') === '1' || request.headers.get('Next-Router-State-Tree')) {
    return true
  }
  
  // Check URL patterns that should never be cached
  for (const pattern of NEVER_CACHE_PATTERNS) {
    if (pattern.test(url.pathname) || pattern.test(url.search)) {
      return true
    }
  }
  
  // Next.js prefetch requests should go to network
  if (request.headers.get('Next-Router-Prefetch') === '1') {
    return true
  }
  
  return false
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  // Never intercept requests that should bypass cache (RSC, API, etc.)
  if (shouldBypassCache(request)) {
    return
  }

  // For navigations, try network first, then offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(OFFLINE_URL)
        return cached || Response.error()
      })
    )
    return
  }

  // For static assets only (JS, CSS, images, fonts), use cache-first
  const url = new URL(request.url)
  if (url.origin === self.location.origin) {
    const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)
    
    // Only cache static assets, not HTML or dynamic content
    if (isStaticAsset) {
      event.respondWith(
        caches.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            // Only cache successful responses
            if (response.ok) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return response
          }).catch(() => Response.error())
        })
      )
    }
  }
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING' && self.skipWaiting) {
    self.skipWaiting()
  }
})
