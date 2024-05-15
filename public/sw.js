importScripts('/javascripts/idb-utility.js');

const staticAssets = [
    "/",
    '/plants/add',
    '/javascripts/index.js',
    '/javascripts/insert.js',
    '/stylesheets/style.css'
];

let cacheVersion = 1;
let cacheName = `cache-v${cacheVersion}`;

function increment() {
    cacheVersion++;
    cacheName = `cache-v${cacheVersion}`;
}

async function fetchPlantUrls() {
    try {
        const response = await fetch('/plants/api/plants/ids');
        const plantIds = await response.json();
        return plantIds.map(id => `/plants/${id}`);
    } catch (error) {
        console.error('SW: Error fetching plant IDs', error);
        return [];
    }
}

async function fetchPlantComments(urls) {
    const commentURLs = (await urls).map(url => url + '/comments');
    return commentURLs;
}

self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell...');
        try {
            increment();
            const cache = await caches.open(cacheName);
            const plantUrls = await fetchPlantUrls();
            const plantComments = await fetchPlantComments(plantUrls);
            await cache.addAll([...staticAssets, ...plantUrls, ...plantComments]);
            console.log(`Added ${cacheName}`)
        } catch {
            console.log("Error occurred while caching...")
        }
    })());
});

self.addEventListener('fetch', function (event) {


    const isOnline = navigator.onLine;

    let mustSync = false;

    if (isOnline){

        if (mustSync){
            // Check if IndexedDB contains offline changes
            // If not empty, sync data with MongoDB and clear IndexedDB
            mustSync = false;
        }

        event.respondWith(
            fetch(event.request)
        );
    }
    else{

        mustSync = true;

        // Check for POST requests and store them in IndexedDB
        // Other requests are served from cache when offline

        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response;
            })
        );
    }

});

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
