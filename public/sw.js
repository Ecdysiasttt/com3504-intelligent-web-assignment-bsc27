importScripts('/javascripts/idb-utility.js');

//  Install event: cache static assets when SW first installed
const staticAssets = [
    "/",
    "/src/index.ejs",
    '/views/app.js',
    '/javascripts/index.js',
    '/javascripts/index.js', //Should this be /index.js and not /javascripts/index.js again? Or insert.js?
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
    event.waitUntil((async () => {
      console.log('SW: Caching App Shell at the moment...');
      try {
        const cache = await caches.open("static");
        cache.addAll([
          '/',
          '/manifest.json',
          '/javascripts/index.js',
          // '/javascripts/insert.js',
          '/javascripts/idb-utility.js',
          '/stylesheets/style.css',
          '/images/image_icon.png',
          '/plants'
        ]);
        console.log('SW: App Shell cached');
      }
      catch {
        console.log('error occurred while caching...');
      }
    })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      return keys.map(async (cache) => {
        if(cache !== "static") {
          console.log('SW: Removing old cache: ' + cache);
          return await caches.delete(cache);
        }
      })
    })()
  )
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open("static");
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      console.log('SW: Fetching from cache: ', event.request.url);
      return cachedResponse
    }
    console.log('SW: Fetching from URL: ', event.request.url);
    return fetch(event.request);
  })());
});



// event.waitUntil(
//   caches
//     .open(cacheName)
//     .then((cache) => {
//       //Update version
//       increment();
//
//       //add files to the cache
//       return cache.addAll(staticAssets);
//     })
//     .catch((error) => console.log(error))
// );

// // Activate event: Update when SW becomes active
// self.addEventListener("activate", (event) => {
//     console.log("New SW activating");
//
//     event.waitUntil(
//         caches.keys().then((cacheNames) => {
//             return Promise.all(
//                 cacheNames.map((storedCacheName) => {
//                     if (storedCacheName !== cacheName) {
//                         return caches.delete(storedCacheName);
//                     }
//                 })
//             );
//         })
//     );
// });


// Fetch event: allow SW to intercept the request
// self.addEventListener("fetch", (event) => {
//     console.log("Fetch", event.request.url);
//
//     event.respondWith(
//         caches
//             .match(event.request)
//             .then((response) => {
//                 if (response) {
//                     console.log("Found ", event.request.url, " in cache");
//                     return response;
//                 }
//                 return fetch(event.request).then((response) => {
//                     if (response.status === 404) {
//                         return caches.open(cacheName).then((cache) => {
//                             return cache.match("404.html");
//                         });
//                     }
//
//                     return caches.open(cacheName).then((cache) => {
//                         cache.put(event.request.url, response.clone());
//                         return response;
//                     });
//                 });
//             })
//
//             // Error
//             .catch(async (error) => {
//                 console.log("Error, ", error);
//                 return caches.open(cacheName).then((cache) => {
//                     return cache.match("offline.html");
//                 });
//             })
//     );
// });
