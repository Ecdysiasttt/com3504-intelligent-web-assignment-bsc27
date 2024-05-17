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
            console.log('Opened Sync DB');
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


// Function to get all sync plants from the IndexedDB
const getAllSyncPlants = (syncPlantIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncPlantIDB.transaction(["sync-plants"]);
        const plantStore = transaction.objectStore("sync-plants");
        const getAllRequest = plantStore.getAll();

        getAllRequest.addEventListener("success", () => {
            console.log('Got all to-sync plants');
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

// Function to delete a sync plant from IndexedDB
const deleteSyncPlantFromIDB = (syncPlantIDB, id) => {
    const transaction = syncPlantIDB.transaction(["sync-plants"], "readwrite");
    const plantStore = transaction.objectStore("sync-plants");
    const deleteRequest = plantStore.delete(id);

    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id);
    });

    deleteRequest.addEventListener("error", (event) => {
        console.error("Error deleting sync plant from IDB:", event.target.error);
    });
};

// Function to add a single plant to IndexedDB
const addNewPlantToIDB = (plantIDB, plant, store) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction([store], "readwrite");
        const plantStore = transaction.objectStore(store);

        const addRequest = plantStore.add(plant);

        addRequest.addEventListener("success", () => {
            console.log("Added " + "#" + addRequest.result + ": " + plant.name);
            resolve();
        });

        addRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};


async function openCommentsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-comments", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target.errorCode}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('sync-comments', { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            console.log('Opened comments DB');
            resolve(db);
        };
    });
}
async function addCommentToIDB(comment) {
    const db = await openCommentsIDB();
    const tx = db.transaction('sync-comments', 'readwrite');
    await tx.objectStore('sync-comments').add(comment);
    await tx.complete;
}

async function getCommentsFromIDB() {
    const db = await openCommentsIDB();
    const tx = db.transaction('sync-comments', 'readonly');
    const comments = await tx.objectStore('sync-comments').getAll();
    await tx.complete;
    return comments;
}