// Service Worker for Tree Growth Visualization PWA
// Version 1.0.0

const CACHE_NAME = 'tree-growth-v1.0.0';
const STATIC_CACHE_NAME = 'tree-growth-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'tree-growth-dynamic-v1.0.0';

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/index.html',
  '/stats.html',
  '/admin.html',
  '/manifest.json',
  // External CDN resources
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.min.js'
];

// Dynamic cache patterns
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/images\.unsplash\.com/,
  /^https:\/\/script\.google\.com/,
  /^https:\/\/fonts\./
];

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  dynamic: 24 * 60 * 60 * 1000,    // 1 day
  api: 5 * 60 * 1000               // 5 minutes
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, {
          mode: 'cors',
          credentials: 'omit'
        })));
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('tree-growth-') && 
              !cacheName.includes('v1.0.0')
            )
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isDynamicAsset(request)) {
    event.respondWith(handleDynamicAsset(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_FILES.some(staticUrl => {
    const staticUrlObj = new URL(staticUrl, self.location.origin);
    return url.pathname === staticUrlObj.pathname && url.origin === staticUrlObj.origin;
  });
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.hostname === 'script.google.com' || 
         url.pathname.includes('/api/') ||
         url.searchParams.has('action');
}

// Check if request is for dynamic assets (images, fonts, etc.)
function isDynamicAsset(request) {
  const url = new URL(request.url);
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         /\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Handle static assets - Cache First strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || 0);
      const now = new Date();
      
      if (now - cachedDate < CACHE_EXPIRATION.static) {
        return cachedResponse;
      }
    }
    
    // Fetch from network and update cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cached-date', new Date().toISOString());
      
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for HTML pages
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Handle API requests - Network First strategy with short cache
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses for short period
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cached-date', new Date().toISOString());
      
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] API fetch failed:', error);
    
    // Try to return cached response if recent
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || 0);
      const now = new Date();
      
      if (now - cachedDate < CACHE_EXPIRATION.api) {
        return cachedResponse;
      }
    }
    
    // Return mock data for essential endpoints
    if (request.url.includes('action=count')) {
      return new Response(JSON.stringify({
        totalCount: 0,
        totalParticipants: 0,
        timestamp: new Date().toISOString(),
        offline: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle dynamic assets - Stale While Revalidate strategy
async function handleDynamicAsset(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetch in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cached-date', new Date().toISOString());
      cache.put(request, responseToCache);
    }
    return networkResponse;
  }).catch(error => {
    console.log('[SW] Dynamic asset fetch failed:', error);
    return cachedResponse;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Handle generic requests - Network First strategy
async function handleGenericRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok && networkResponse.status < 400) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cached-date', new Date().toISOString());
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Generic fetch failed:', error);
    
    // Try cached response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any offline actions that need to be synced
  console.log('[SW] Performing background sync');
  
  try {
    // Sync any pending data or configurations
    const pendingActions = await getStoredActions();
    
    for (const action of pendingActions) {
      await processAction(action);
    }
    
    await clearStoredActions();
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper functions for background sync
async function getStoredActions() {
  // Get actions stored in IndexedDB or localStorage
  return [];
}

async function processAction(action) {
  // Process individual actions
  console.log('[SW] Processing action:', action);
}

async function clearStoredActions() {
  // Clear processed actions
  console.log('[SW] Clearing stored actions');
}

// Push notification handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '新しい通知があります',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 'default'
    },
    actions: [
      {
        action: 'view',
        title: '表示',
        icon: '/icon-view.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Tree Growth Visualization', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    console.log('[SW] Performing periodic sync');
    
    // Update cache with fresh content
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    // Refresh critical resources
    const criticalResources = [
      '/api/count',
      '/api/breakdown'
    ];
    
    for (const resource of criticalResources) {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response.clone());
        }
      } catch (error) {
        console.log('[SW] Failed to sync resource:', resource, error);
      }
    }
    
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
  }
}

// Error handler
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error);
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

console.log('[SW] Service Worker loaded successfully');