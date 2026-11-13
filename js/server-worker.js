
const CACHE_NAME = "fixnow-v1";

const APP_FILES = [
    "/",
    "/offline.html",
    "/go-offline.html"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request).catch(async () => {
            const cached = await caches.match(event.request);

            if (cached) {
                return cached;
            }

            const url = new URL(event.request.url);
            if (url.pathname === "/go-offline.html") {
                return caches.match("/go-offline.html");
            }

            return caches.match("/offline.html");
        })
    );
});
