if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service worker registered:', registration.scope);

            // Ensure the service worker is ready before registering the sync event
            navigator.serviceWorker.ready.then(reg => {
                console.log('Service worker is ready');

                // Register the sync event
                reg.sync.register('sync-plant')
                    .then(() => {
                        console.log('Sync event registered');
                    })
                    .catch(err => {
                        console.error('Failed to register sync event:', err);
                    });
            });
        })
        .catch(error => {
            console.error('Service worker registration failed:', error);
        });
} else {
    console.log('Background sync not supported');
}
