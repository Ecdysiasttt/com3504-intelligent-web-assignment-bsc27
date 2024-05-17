importScripts('/javascripts/idb-utility.js');
importScripts('/javascripts/insert.js');
// importScripts('/javascripts/index.js');

const staticAssets = [
    "/",
    '/plants/add',
    '/plants/validId',
    // '/plants/offline',
    // '/plants/upload',
    '/index.js',
    '/javascripts/index.js',
    '/javascripts/insert.js',
    '/javascripts/idb-utility.js',
    '/stylesheets/style.css',
    '/manifest.json',
    '/images/image_icon.png',
    '/sw.js'
];

const externalResources = [
    'https://unpkg.com/leaflet/dist/leaflet.js',
    'https://unpkg.com/leaflet/dist/leaflet.css'
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


            await cache.addAll([...staticAssets, ...externalResources, ...plantUrls, ...plantComments, ...imageUrls]);
            console.log(`Added ${cacheName}`);
        } catch (error){
            console.log("Error occurred while caching...", error);
        }
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(event.request);

        console.log('Fetching:', event.request.url);

        if (event.request.url.endsWith('/plants') && event.request.method === 'GET') {
            await fetchAndCacheNewPlantPages(); // Fetch and cache new plant pages on demand
        }

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



        if (event.request.url.endsWith('/upload')){
            await fetch(event.request)
                .then(function(response) {
                    return response;
                })
                .catch(function() {
                    console.log('Using cache upload instead')
                  return caches.match(event.request);
                })
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
            try {
                const networkResponse = await fetch(event.request);
                await cache.put(event.request, networkResponse.clone()); // Recache the comments page with updated data.
                return networkResponse;
            } catch{
                return cachedResponse;
            }
        }

        if (!navigator.onLine && event.request.url.endsWith('/comments') && event.request.method === "GET") {
            console.log('Getting Comments OFFLINE');
            //Get both iDB and
            return cachedResponse;
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
    if (!navigator.onLine) {
        console.warn('Network is offline. Sync postponed.');
        return;
    }

    try {
        const db = await openSyncPlantsIDB();
        const syncPlants = await getAllSyncPlants(db);
        const commentDb = await openCommentsIDB();
        const comments = await getCommentsFromIDB(commentDb);

        for (const plant of syncPlants) {
            try {
                const response = await fetch('/plants/sync', {
                    method: 'POST',
                    body: JSON.stringify(plant),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with status ${response.status}: ${errorText}`);
                }

                await deleteSyncPlantFromIDB(db, plant.id);


                console.log(`Plant synchronized and deleted from IDB: ${plant.id}`);
            } catch (fetchError) {
                console.error(`Failed to sync plant ${plant.id}:`, fetchError);
            }
        }

        //For each comment in comments, add to the plant.comments with the matching plant._id === comment.plantId
        //        const requestBody = {
        //             text: comment,
        //             user: name,
        //             plantId: plantID,
        //             chatId: chatId
        //         };

        for (const comment of comments) {
            try {
                const plantID = comment.plantId;
                const commentText = comment.text;
                const chatId = comment.chatId;
                const name = comment.user;
                await addCommentToPlantDB(plantID, commentText, chatId, name);

                await deleteCommentFromIDB(commentDb, comment.id);
            }catch (fetcherror){
                console.error(`Failed to sync comment ${comment.commentText}:`, fetcherror);
            }
        }

        console.log('All sync plants have been processed');
    } catch (error) {
        console.error('Error during synchronization', error);
    }
}

async function fetchAndCacheNewPlantPages() {
    try {
        const response = await fetch('/plants/api/plants/ids');
        const plantIds = await response.json();
        const newPlantPageUrls = plantIds.map(id => `/plants/${id}`);
        const cache = await caches.open(cacheName);

        for (const url of newPlantPageUrls) {
            const cachedResponse = await cache.match(url);
            if (!cachedResponse) {
                const newPlantPageResponse = await fetch(url);
                await cache.put(url, newPlantPageResponse.clone());
                console.log(`Added ${url} to cache`);
            }
        }
    } catch (error) {
        console.error('Error fetching and caching new plant pages:', error);
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

