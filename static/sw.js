const CACHE_NAME = 'cache-pwa';
const OFFLINE_URL = '/offline.html';
const FILE_TO_CACHE = [
    '/',
    '/app.js',
    '/style.css',
    '/api/file-type-extensions.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
	await cache.addAll(FILE_TO_CACHE);
        await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        if ('navigationPreload' in self.registration) {
            await self.registration.navigationPreload.enable();
        }
    })());

    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);

            try {
		if (event.preloadResponse) {
	            return await event.preloadResponse;
		}
		else {
                    const resp = fetch(event.request).clone();
	            if (resp && resp.ok) {
		        if (event.request.method == 'GET' && event.request.url.endsWith('/')) {
                            await cache.put(event.request, resp.clone());
	                }
		    }
		    return resp;
		}
            }
	    catch (error) {
	        return await cache.match(event.request) || await cache.match(OFFLINE_URL);
            }
        })());
    }
});

