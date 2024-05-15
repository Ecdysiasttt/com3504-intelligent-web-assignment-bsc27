importScripts('/javascripts/idb-utility.js');


//  Install event: cache static assets when SW first installed
const staticAssets = [
    "/",
    '/plants/add',
    '/javascripts/index.js',
    '/javascripts/insert.js', //Should this be /index.js and not /javascripts/index.js again? Or insert.js?
    '/stylesheets/style.css'
];

// add cacheversion
let cacheVersion = 1;
let cacheName = `cache-v${cacheVersion}`;

function increment() {
    cacheVersion ++;
    cacheName = `cache-v${cacheVersion}`;
}

async function fetchPlantUrls() {
    try {
        console.log(1)
        const response = await fetch('/plants/api/plants/ids');
        console.log(response)
        const plantIds = await response.json();
        console.log(plantIds)
        return plantIds.map(id => `/plants/${id}`);
    } catch (error) {
        console.error('SW: Error fetching plant IDs', error);
        return [];
    }
}

// Add cache
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        //add the dynamic /plants/ routes

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            increment();
            const cache = await caches.open(cacheName);
            const plantUrls = await fetchPlantUrls();
            await cache.addAll([...staticAssets, ...plantUrls]);
            console.log(`Added ${cacheName}`)
        }
        catch{
            console.log("error occured while caching...")
        }

    })());
});


// Fetch event: Serve from cache or fetch from network
self.addEventListener('fetch', function(event) {

    console.log('Service Worker: Fetch', event.request.url);

    console.log("Url", event.request.url);

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
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
                        console.log('Deleting cache:', storedCacheName)
                        return caches.delete(storedCacheName);
                    }
                })
            );
        })
    );
});

