// Function to handle adding a new plant to the sync store
const addNewPlantToSync = (syncPlantIDB, plantData) => {
    if (plantData.uname !== "") {
        const transaction = syncPlantIDB.transaction(["sync-plants"], "readwrite");
        const plantStore = transaction.objectStore("sync-plants");
        const addRequest = plantStore.add({ plantData });

        addRequest.addEventListener("success", () => {
            console.log("Added " + "#" + addRequest.result + ": " + plantData.uname);
            navigator.serviceWorker.ready.then((sw) => {
                sw.sync.register("sync-plant")
                    .then(() => {
                        console.log("Sync registered");
                    }).catch((err) => {
                    console.log("Sync registration failed: " + JSON.stringify(err));
                });
            });
        });

        addRequest.addEventListener("error", (event) => {
            console.error("Error adding plant to sync store:", event.target.error);
        });
    }
};

// Function to add new plants to IndexedDB and return a promise
const addNewPlantsToIDB = (plantIDB, plants) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");

        // console.log(plants);

        const addPromises = plants.map(plant => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = plantStore.add(plant);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + plant.name);
                    const getRequest = plantStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        // console.log("Found " + JSON.stringify(getRequest.result));
                        // Assume insertPlantInList is defined elsewhere
                        // insertPlantInList(getRequest.result);
                        resolveAdd(); // Resolve the add promise
                    });
                    getRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error); // Reject the add promise if there's an error
                    });
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error); // Reject the add promise if there's an error
                });
            });
        });

        // Resolve the main promise when all add operations are completed
        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};

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

// Function to get all plants from the IndexedDB
const getAllPlants = (plantIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"]);
        const plantStore = transaction.objectStore("plants");
        const getAllRequest = plantStore.getAll();

        getAllRequest.addEventListener("success", (event) => {
            resolve(event.target.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
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
