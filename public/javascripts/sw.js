//  Install event: cache static assets when SW first installed
const staticAssets = [
    "/",
    "/src/index.html",
    '/views/app.js',
    '/images/seed-icon.png',
    '/public/stylesheets/style.css',
    '404.html',
    'offline.html'
];

// add cacheversion
let cacheVersion = 0;
let cacheName = `cache-v${cacheVersion}`;

function increment() {
    cacheVersion ++;
    cacheName = `cache-v${cacheVersion}`;
}

// Add cache
self.addEventListener("install", (event) => {
    console.log("SW Installing");
    event.waitUntil(
        caches
            .open(cacheName)
            .then((cache) => {
                //Update version
                increment();

                //add files to the cache
                return cache.addAll(staticAssets);
            })
            .catch((error) => console.log(error))
    );
});

// Activate event: Update when SW becomes active
self.addEventListener("activate", (event) => {
    console.log("New SW activating");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((storedCacheName) => {
                    if (storedCacheName !== cacheName) {
                        return caches.delete(storedCacheName);
                    }
                })
            );
        })
    );
});


// Fetch event: allow SW to intercept the request
self.addEventListener("fetch", (event) => {
    console.log("Fetch", event.request.url);

    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                if (response) {
                    console.log("Found ", event.request.url, " in cache");
                    return response;
                }
                return fetch(event.request).then((response) => {
                    if (response.status === 404) {
                        return caches.open(cacheName).then((cache) => {
                            return cache.match("404.html");
                        });
                    }

                    return caches.open(cacheName).then((cache) => {
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                });
            })

            // Error
            .catch(async (error) => {
                console.log("Error, ", error);
                return caches.open(cacheName).then((cache) => {
                    return cache.match("offline.html");
                });
            })
    );
});