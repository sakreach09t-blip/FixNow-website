const CACHE_NAME = "fixnow-shell-v2";
const APP_SHELL = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/behavior.js",
    "/manifest.webmanifest",
    "/offline.html",
    "/assets/fixnow.png",
    "/assets/fixnow-192.png",
    "/assets/fixnow-512.png",
    "/assets/technicains-illustrations.png",
    "/assets/fixnow-maskot.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => (
                        (cacheName.startsWith("fixnow-shell-") || cacheName === "fixnow-v1")
                        && cacheName !== CACHE_NAME
                    ))
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);

    if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
            const response = await fetch(request, { cache: "no-cache" });
            if (response.ok) {
                try {
                    await cache.put(request, response.clone());
                } catch (error) {
                    console.error("Could not update the FixNow offline cache:", error);
                }
            }
            return response;
        } catch (error) {
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }

            if (request.mode === "navigate") {
                const offlinePage = await cache.match("/offline.html");
                if (offlinePage) {
                    return offlinePage;
                }
            }

            throw error;
        }
    })());
});
