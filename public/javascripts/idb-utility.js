// Function to add new plants to IndexedDB and return a promise
const addNewPlantsToIDB = (plantIDB, plants) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");

        const addPromises = plants.map(plant => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = plantStore.add(plant);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + plant.name);
                    resolveAdd();
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error);
                });
            });
        });

        Promise.all(addPromises).then(resolve).catch(reject);
    });
};

// Function to retrieve data from IndexedDB
function retrieveDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        console.log('Attempting to retrieve data from IndexedDB');
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
                console.log('Data retrieved from IndexedDB:', data);
                resolve(new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
            };

            getRequest.onerror = function(event) {
                console.error('Error fetching data from IndexedDB:', event.target.error);
                reject(new Response(null, { status: 500, statusText: 'Error fetching data from IndexedDB' }));
            };
        };
    });
}

function getPlantsFromIDB() {
    return new Promise((resolve, reject) => {
        console.log('Attempting to retrieve data from IndexedDB');
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
                console.log('Data retrieved from IndexedDB:', data);
                resolve(data);
            };

            getRequest.onerror = function(event) {
                console.error('Error fetching data from IndexedDB:', event.target.error);
                reject(new Response(null, { status: 500, statusText: 'Error fetching data from IndexedDB' }));
            };
        };
    });
}



// Functions to handle sync plants as already defined in your code

// Function to open the plants IndexedDB
function openPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target.errorCode}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('plants', { keyPath: '_id' });
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

// Function to open the sync plants IndexedDB
function openSyncPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-plants", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target.errorCode}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('sync-plants', { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

// Function to remove all plants from IndexedDB
const deleteAllExistingPlantsFromIDB = (plantIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");
        const clearRequest = plantStore.clear();

        clearRequest.addEventListener("success", () => {
            resolve();
            console.log('Cleared.')
        });

        clearRequest.addEventListener("error", (event) => {
            reject(event.target.error);
            console.log('Could not complete:', error);
        });
    });
};