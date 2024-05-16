importScripts('/javascripts/idb-utility.js');
importScripts('/javascripts/insert.js');

const staticAssets = [
    "/",
    '/plants/add',
    '/plants/validId',
    '/index.js',
    '/javascripts/index.js',
    '/javascripts/insert.js',
    '/javascripts/idb-utility.js',
    '/stylesheets/style.css',
    '/manifest.json',
    '/images/image_icon.png',
    '/sw.js'
];

const cacheVersion = 1;
const cacheName = `cache-v${cacheVersion}`;

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
            const cache = await caches.open(cacheName);
            const plantUrls = await fetchPlantUrls();
            const plantComments = await fetchPlantComments(plantUrls);

            const imageResponse = await fetch('/images/list');
            const imageUrls = await imageResponse.json();


            await cache.addAll([...staticAssets, ...plantUrls, ...plantComments, ...imageUrls]);
            console.log(`Added ${cacheName}`);
        } catch {
            console.log("Error occurred while caching...");
        }
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(event.request);

        console.log('Fetching:', event.request.url);

        if (event.request.url.endsWith('/plants/add') && event.request.method === 'GET'){
            if (cachedResponse)
                return cache.match(event.request);
            else
                try {
                    return await fetch(event.request);
                } catch{
                console.log('Error with getting add plants')
                }
        }

        // NETWORK FIRST APPROACH
        if (navigator.onLine && event.request.url.endsWith('/plants')) {
            console.log('Fetching data for /plants from mongoDB');
            //get latest from mongoDB
            const networkResponse = await fetch(event.request);
            return networkResponse;
        }


        if (navigator.onLine && event.request.url.endsWith('/plants/add') && event.request.method === 'GET') {
            console.log('Add plant to mongoDB');
            const networkResponse = await fetch(event.request);
            return networkResponse;
        }

        if (navigator.onLine && event.request.url.endsWith('/comments') && event.request.method === 'POST') {
            console.log('Adding Comment ONLINE');
            const networkResponse = await fetch(event.request);
            return networkResponse;
        }

        if (navigator.onLine && event.request.url.endsWith('/comments') && event.request.method === 'GET') {
            console.log('Getting Comments ONLINE');
            const networkResponse = await fetch(event.request);
            return networkResponse;
        }


        // Handle the request for /plants separately
        if (!(navigator.onLine) && event.request.url.endsWith('/plants')) {
            console.log('Fetching data for /plants from IndexedDB');
            const db = await openPlantsIDB();
            const data = await retrieveDataFromIndexedDB();
            return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
        }

        if (!(navigator.onLine) && event.request.url.endsWith('/plants/add') && event.request.method === "GET") {
            console.log('Adding plant to iDB');
            //Get network data from this request
            //Add data to plantsiDB
            //redirect to homepage?
            return await cache.match(event.request);
        }

        if (event.request.url.endsWith('/validId')) {
            if (cachedResponse)
                return cachedResponse;
            else{
                console.log('Could not get cached response.');
            }
        }

        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache:', event.request.url);
            return cachedResponse;
        }

        try {
            console.log('Service Worker: Fetching from Network:', event.request.url);
            const networkResponse = await fetch(event.request);

            // Cache the new request if it's an image or manifest.json
            if (event.request.url.includes('/public/images/') || event.request.url.endsWith('/manifest.json')) {
                console.log('Caching new request:', event.request.url);
                cache.put(event.request, networkResponse.clone());
            }

            return networkResponse;
        } catch (error) {
            console.error('Service Worker: Network request failed, error:', error);

            return new Response('Network error and no cache available', { status: 469 });
        }
    })());
});




self.addEventListener('sync', event => {
    if (event.tag === 'sync-plant') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        const db = await openSyncPlantsIDB();
        const syncPlants = await getAllSyncPlants(db);

        for (const plant of syncPlants) {
            await fetch('/plants/add', {
                method: 'POST',
                body: JSON.stringify(plant),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            deleteSyncPlantFromIDB(db, plant._id);
        }
        console.log('All sync plants have been synchronized');
    } catch (error) {
        console.error('Error during synchronization', error);
    }
}

self.addEventListener("activate", (event) => {
    console.log("New SW activating");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((storedCacheName) => {
                    if (storedCacheName !== cacheName) {
                        console.log('Deleting cache:', storedCacheName);
                        return caches.delete(storedCacheName);
                    }
                })
            );
        })
    );
});

