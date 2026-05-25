// sw.js - Service Worker per il funzionamento Offline

const CACHE_NAME = 'spesa-mamma-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './css/glass.css',
    './js/main.js',
    './js/storage.js',
    './js/ui.js',
    './icons/icon.png'
];

// FASE DI INSTALLAZIONE: Salva i file nella memoria del telefono
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache aperta');
            return cache.addAll(ASSETS);
        })
    );
});

// FASE DI LETTURA: Usa i file salvati se manca internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Se trova il file in memoria, usa quello. Altrimenti lo scarica.
            return response || fetch(event.request);
        })
    );
});

// FASE DI AGGIORNAMENTO: Pulisce le vecchie versioni se aggiorniamo l'app
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});