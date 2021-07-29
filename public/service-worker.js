const CACHE = "cache-v1";
const DATA_CACHE = "data-cache-v1";
const RUNTIME = "runtime-cache";

const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/index.html",
  "/manifest.webmanifest"
];

// installs
self.addEventListener("install", (e) => {
  e.waitUntil(
    // caches static data  
    caches
    .open(CACHE)
    .then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // lets the browser know to use this service worker once it is installed
  self.skipWaiting();
});

// activates
self.addEventListener("activate", (e) => {
  const currentCaches = [CACHE, DATA_CACHE, RUNTIME];
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName))
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return cahce.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.calim())
  );
});

// fetches
self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches
        .open(DATA_CACHE)
        .then(cache => {
          return fetch(e.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(e.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  e.respondWith(
    caches
      .open(CACHE)
      .then((cache) => {
      return cache.match(e.request).then((response) => {
        return response || fecth(e.request);
      });
    })
  );
});

//     fetch(e.request).catch(function() {
//       return caches.match(e.request).then(function(response) {
//         if (response) {
//           return response;
//         } else if (e.request.headers.get("accept").includes("text/html")) {
//           // return the cached home page for all requests for html pages
//           return caches.match("/");
//         }
//       });
//     })
//   );
// });