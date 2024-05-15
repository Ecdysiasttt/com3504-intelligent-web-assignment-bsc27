if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service worker registered:', registration.scope);
    }).catch((error) => {
        console.error('Service worker registration failed:', error);
    });
} else {
    console.log('Background sync not supported');
}