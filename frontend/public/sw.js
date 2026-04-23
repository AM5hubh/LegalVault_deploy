/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Service Worker installation
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker activating...');
  self.clients.claim();
});

// Handle fetch events (optional - for caching strategies)
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (event.request.url.includes('http') && !event.request.url.includes(self.location.origin)) {
    return;
  }

  // For development, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Return offline page or cached response if needed
        return new Response('Offline', { status: 503 });
      })
  );
});

export {};
