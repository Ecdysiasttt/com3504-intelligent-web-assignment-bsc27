importScripts('/javascripts/idb-utility.js');
let mustSync = false;

const staticAssets = [
    "/",
    '/plants/add',
    '/index.js',
    '/javascripts/index.js',
    '/javascripts/insert.js',
    '/javascripts/idb-utility.js',
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



// self.addEventListener('fetch', event => {
//     event.respondWith((async () => {
//         const cache = await caches.open(cacheName);
//         const cachedResponse = await cache.match(event.request);
//         if (cachedResponse) {
//             console.log('Service Worker: Fetching from Cache: ', event.request.url);
//             return cachedResponse;
//         }
//         console.log('Service Worker: Fetching from URL: ', event.request.url);
//         return fetch(event.request);
//     })());
// });

self.addEventListener('fetch', function(event) {
    const isOnline = navigator.onLine;

    if (!isOnline){
        if (event.request.url.endsWith('/plants')) {
            // If offline and request is for plants, respond with data from IndexedDB
            console.log('Offline plants request')
            // event.respondWith(1);
            event.respondWith(retrieveDataFromIndexedDB());
        }
        else if (event.request.url.endsWith('/add') && event.request.method === 'POST') {
            // Check if post method
            console.log('Trying offline post');
            event.respondWith(
                (async function() {
                    try {
                        const requestData = await event.request.json(); // Extract plant data from the request
                        // Open the IndexedDB for sync plants
                        const plantIdb = await openPlantsIDB();
                        // Add the new plant data to the sync store
                        await addNewPlantsToIDB(plantIdb, requestData);
                        // Respond with a success message
                        return new Response(JSON.stringify({ message: 'Plant added to sync store for later synchronization.' }), {
                            status: 200,
                            statusText: 'OK',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (error) {
                        console.error('Error processing offline post:', error);
                        // Respond with an error message
                        return new Response(JSON.stringify({ error: 'Error processing offline post: ' + error.message }), {
                            status: 500,
                            statusText: 'Internal Server Error',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                })()
            );
        }

        else {
            event.respondWith(
                caches.match(event.request).then(function(response) {
                    return response;
                })
            );
        }

    } else {
        // Otherwise, serve requests from cache or fetch from network
        event.respondWith(
                fetch(event.request)
        );
    }
});

function retrieveDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        // Open IndexedDB and retrieve data
        const request = indexedDB.open('plants', 1);

        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.error);
            reject(new Response(null, { status: 500, statusText: 'IndexedDB error' }));
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['plants'], 'readonly');
            const objectStore = transaction.objectStore('plants');
            const getRequest = objectStore.getAll();

            getRequest.onsuccess = function(event) {
                const data = event.target.result;
                // Resolve with the retrieved data
                resolve(new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
            };

            getRequest.onerror = function(event) {
                console.error('Error fetching data from IndexedDB:', event.target.error);
                reject(new Response(null, { status: 500, statusText: 'Error fetching data from IndexedDB' }));
            };
        };
    });
}


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
