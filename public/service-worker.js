// CACHE_NAME is replaced with a unique per-deploy id by scripts/stamp-sw.js
// (postbuild). The literal "__BUILD_ID__" stays in dev so caches never collide
// with a real deploy.
const CACHE_NAME = "poopcheck-admin-__BUILD_ID__";

self.addEventListener("install", (event) => {
  // Activate the new SW immediately rather than waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete every cache that isn't the current one. Because CACHE_NAME changes
  // on every deploy, the previous deploy's cache is wiped here.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isHtmlRequest = (request) => {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // Don't intercept cross-origin requests (e.g. S3 images). The SW is for the
  // app's own assets; cross-origin fetches have their own CORS rules and trying
  // to refetch them here can turn a working no-cors <img> load into a CORS error.
  if (new URL(request.url).origin !== self.location.origin) return;

  // API: network-first with cache fallback for offline use.
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // HTML / navigation requests: network-first. This is the critical fix —
  // a stale index.html locks the bundle hash to an old build and blocks every
  // subsequent deploy from reaching users.
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // Hashed static assets (CRA filenames include a content hash) and other GETs:
  // cache-first, populate on miss. Safe because hashes change on rebuild.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
