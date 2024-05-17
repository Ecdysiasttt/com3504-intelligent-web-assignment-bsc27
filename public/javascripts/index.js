let name = null;
let roomNo = null;
// let socket = io();
//
let socket;
// var plants = require('../../controllers/plants');
// var comments = require('../../controllers/comments');

if (typeof io === "function") {
    socket = io();
} else {
    console.log("Socket.io is not available.");
}

let rooms = [];
// let map = null;
let marker;
let map;


//To display plants normally
const insertPlantInList = (plant) => {
    if (!plant) {
        console.error('Plant data is undefined or null');
        return;
    }
    if (!plant.name || !plant._id) {
        console.error('Required properties missing in plant data:', plant);
        return;
    }

    if (plant.name) {
        const container = document.getElementById("plant-container");

        const div = document.createElement("div");
        div.id = `div-${plant._id}`;
        div.classList.add("mb-2", "border", "border-dark", "rounded", "p-2", "plant");

        // Construct the HTML content for the plant
        div.innerHTML = `
            <!-- for filtering -->
            <input type="checkbox" id="filter-flowers" name="flowers" ${plant.flowers ? 'checked' : ''} hidden>
            <input type="checkbox" id="filter-leaves" name="leaves" ${plant.leaves ? 'checked' : ''} hidden>
            <input type="checkbox" id="filter-fruit" name="fruit" ${plant.fruit ? 'checked' : ''} hidden>
            <input type="checkbox" id="filter-seeds" name="seeds" ${plant.seeds ? 'checked' : ''} hidden>
            <!-- meta-info: name, found by, found on... -->
            <div class="border-bottom border-dark mb-2">
                <div class="d-flex justify-content-between align-items-baseline">
                    <h4 class="mb-2">${plant.name}</h4> <!-- plant name -->
                    <i class="fa-solid align-middle ${plant.identification.toLowerCase() === 'complete' ? 'fa-circle-check': 'fa-circle-xmark'}"
                        style="color: ${plant.identification.toLowerCase() === 'complete' ? '#198754': '#9e9e9e'}"
                        title="Plant identification ${plant.identification.toLowerCase()}">
                    </i>
                </div>
                <div class="d-flex justify-content-between">
                    <p class="mb-2">
                        <i class="fa-solid fa-magnifying-glass align-middle" title="Date spotted"></i> ${plant.time} - ${plant.date}
                    </p>
                    <p class="mb-2">
                        ${plant.uname}
                        <i class="fa-solid fa-user align-middle" title="User"></i>
                    </p> <!-- spotted by -->
                </div>
            </div>
            <div class="d-flex justify-content-center border-bottom border-dark mb-3" id="info-div-${plant._id}">
                <div id="right-panel" class="mb-2">
                    <img src="${plant.photo}" class="mw-100" id="photo-${plant._id}">
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <div>
                    <a href="/plants/${plant._id}" class="mb-2 btn btn-outline-primary">View details</a>
                </div>
                <div>

                </div>
            </div>
        `;

        // Append the constructed div to the container
        container.appendChild(div);
    }
};

//This is for offline plants that have been newly added - does not include photo or view details button.
const insertSyncPlantInList = (plant) => {
    if (!plant) {
        console.error('Plant data is undefined or null');
        return;
    }
    if (!plant.name || !plant.id) {
        console.error('Required properties missing in plant data:', plant);
        return;
    }

    if (plant.name) {
        const container = document.getElementById("plant-container");

        const div = document.createElement("div");
        div.id = `div-${plant.id}`;
        div.classList.add("mb-2", "border", "border-dark", "rounded", "p-2", "plant");

        // Construct the HTML content for the plant
        div.innerHTML = `
            <!-- for filtering -->
            <input type="checkbox" id="filter-flowers" name="flowers" ${plant.flowers ? 'checked' : ''} hidden>
            <input type="checkbox" id="filter-leaves" name="leaves" ${plant.leaves ? 'checked' : ''} hidden>
            <input type="checkbox" id="filter-fruit" name="fruit" ${plant.fruit ? 'checked' : ''} hidden>
            <input type="checkbox" id="filter-seeds" name="seeds" ${plant.seeds ? 'checked' : ''} hidden>
            <!-- meta-info: name, found by, found on... -->
            <div class="border-bottom border-dark mb-2">
                <div class="d-flex justify-content-between align-items-baseline">
                    <h4 class="mb-2">${plant.name}</h4> <!-- plant name -->
                    <i class="fa-solid align-middle ${plant.identification.toLowerCase() === 'complete' ? 'fa-circle-check': 'fa-circle-xmark'}"
                        style="color: ${plant.identification.toLowerCase() === 'complete' ? '#198754': '#9e9e9e'}"
                        title="Plant identification ${plant.identification.toLowerCase()}">
                    </i>
                </div>
                <div class="d-flex justify-content-between">
                    <p class="mb-2">
                        <i class="fa-solid fa-magnifying-glass align-middle" title="Date spotted"></i> ${plant.time} - ${plant.date}
                    </p>
                    <p class="mb-2">
                        ${plant.uname}
                        <i class="fa-solid fa-user align-middle" title="User"></i>
                    </p> <!-- spotted by -->
                </div>
            </div>
            <div class="d-flex justify-content-center border-bottom border-dark mb-3" id="info-div-${plant.id}">
                <div id="right-panel" class="mb-2">
                    <p>Photo not available offline</p>
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <div>
<!--                    <a class="mb-2 btn btn-outline-primary">Cannot view details while offline</a>-->
                </div>
                <div>
                </div>
            </div>
        `;

        // Append the constructed div to the container
        container.appendChild(div);
    }
};


function init() {
    //Create user info - unique name and function to add message to history when sent
    name = "User-" + Math.floor(Math.random() * 90000 + 100000);
    // called when a message is received
    if (typeof io === "function") {
        socket.on('chat', function (chatId, userId, chatText) {
            writeOnHistory('<b>' + userId + ':</b> ' + chatText, chatId);
        });
    }

}

//Depending on the online status, find where/what to grab
async function fetchPlants() {
    if (navigator.onLine) {
        // Fetch plants from MongoDB and store in IndexedDB
        console.log('Online mode');
        const response = await fetch('http://localhost:3000/plants');
        const newPlants = await response.json();
        const db = await openPlantsIDB();
        await deleteAllExistingPlantsFromIDB(db);
        await addNewPlantsToIDB(db, newPlants);
        return { normalPlants: newPlants, syncPlants: [] };
    } else {
        // Fetch plants from both IndexedDBs
        console.log('Offline mode');
        const normalDB = await openPlantsIDB();
        const syncDB = await openSyncPlantsIDB();
        const normalPlants = await getPlantsFromIDB(normalDB);
        const syncPlants = await getAllSyncPlants(syncDB);
        // syncPlants.forEach(plant => plant.photo = null); // Remove photo for sync plants
        console.log('Normal Plants: ', normalPlants);
        console.log('Sync Plants: ', syncPlants);
        return {normalPlants, syncPlants};
    }
}

//Fetch plants and render index page using them
async function fetchAndRenderIndexPage() {
    const { normalPlants, syncPlants } = await fetchPlants();
    console.log('Online:', navigator.onLine);
    console.log({ normalPlants, syncPlants });
    renderIndexPage({ normalPlants, syncPlants });
}

//Render index page with given plants ('normal' are the online plants, 'sync' are the offline plants)
function renderIndexPage({ normalPlants, syncPlants }) {
    const container = document.getElementById('plant-container');
    container.innerHTML = ''; // Clear existing content
    normalPlants.forEach(insertPlantInList);
    syncPlants.forEach(insertSyncPlantInList);
}


//When page is loaded, get plants and render them to screen.
document.addEventListener('DOMContentLoaded', function () {
    // Call fetchAndRenderIndexPage when the DOM content is loaded
    fetchAndRenderIndexPage();
});

//Initialise the map and relevant data - added try catch to be safe, but should never error as leaflet is cached.
function loadMap(){
    //Initialise leaflet map
    try {
        map = L.map('map').setView([0, 0], 13); //Default long/lat of 0,0

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([0, 0]).addTo(map);
    } catch{
        console.log('Map not created.');
    }
}

//Allows the user to click and place marker on map when this is called. This function is called in /add, but not for viewing
//detailed plants, and as such the user cannot move the marker on viewing plants.
function setMapClickable(){
    //Set click event
    map.on('click', function (e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        setMarker(lat, lng);

        document.getElementById("latitude").value = lat.toFixed(6);
        document.getElementById("longitude").value = lng.toFixed(6);
    })
}


//Set the marker to a given location
function setMarker(latitude, longitude){
    marker.setLatLng([latitude, longitude]);
}


//Set the map view to a given location (event is here to stop the forms from submitting (/add) when the button is pressed - this was an issue)
function setMapView(event, latitude, longitude){
    if(event){
        event.preventDefault();
    }
    if (latitude && longitude)
        map.setView([latitude, longitude], 13);
    else
        map.setView([0, 0], 13);
}


//set the view to the current longitude and latitude
function setAtGetMapPos(event){
    var latitude = document.getElementById("latitude").value;
    var longitude = document.getElementById("longitude").value;

    setMapView(event, latitude, longitude);
}


//set the marker to the current longitude and latitude
function setAtGetPos() {
    var latitude = document.getElementById("latitude").value;
    var longitude = document.getElementById("longitude").value;

    setMarker(latitude, longitude);
}



//---Comments stuff---

//Sends the chat via socket so all users can see it
function sendChatText(text, chatId) {
    if (text.value.toString() !== "") {
        socket.emit('chat', chatId, name, text.value);
    }
    console.log('Sending to room:', chatId);
}

//Connects to the plant-specific chatroom for live chatting
function connectToRoom(chatId) {
    roomNo = chatId;
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', chatId, name);
}

//Toggle the comments section visible/invisible to the user (when selecting 'view comments')
//rooms was an old variable, but I am leaving it here for longevity - it may prove useful
function toggleComments(chatId, uname) {
    const chatInterface = document.getElementById("chat_interface-" + chatId.toString());
    if (chatInterface.style.display === "none") {
        chatInterface.style.display = "block";
        connectToRoom(chatId, uname);
        if (!rooms.includes(chatId))
            rooms.push(chatId);
    }
    else {
        chatInterface.style.display = "none";
        let pos = rooms.indexOf(chatId);
        delete rooms[pos];
        rooms = rooms.filter(function(e){return e}); //Removes EMPTY elements in rooms array after deletion
        console.log(rooms);
    }
}

//Add the new chat message to the comment history and set the value in the user's chat box to empty (they don't need to
//delete the chat entry themselves before sending another)
function writeOnHistory(text, id) {
    let history = document.getElementById('history-' + id.toString());
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}


//Gets the current location of the navigator and sets this to the values for the map stuff above
function getLocation(event) {
    event.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Get the latitude and longitude from the position object
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            let location = { latitude, longitude };
            console.log(location)
            document.getElementById("longitude").value = location.longitude;
            document.getElementById("latitude").value = location.latitude;
            setAtGetPos();
            return longitude, latitude;
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        return 0, 0;
    }
}


//THIS IS NOT USED IN SUBMISSION BUILD
//I have kept it here as I don't see a reason to remove it - but it is unused for the build of the web page we are submitting
//(not in requirements to delete plants, it was just useful for debugging and testing things)
function removePlant(id){

    fetch(`/plants/${id}`, {
        method: 'delete'
    }).then(response => {
        if (response.ok) {
            console.log('Successful removal');
            window.location.reload();
        } else {
            console.log('Failed removal');
        }
    }).catch(error => {
        console.log('Removal error:', error);
    });

}

//Adds the given comment to the plant in the database with the matching plantID through a fetch request.
//This differs from the function 'addCommentToPlantDB' in idb-utility as this only uses 3 params.
async function addCommentToPlantDBIndex(plantID, comment, chatId) {

    console.log('Fetching comment post...', comment)

    //When user is online, perform normal database posting operations
    if (navigator.onLine) {
        console.log('Online commenting');
        const requestBody = {
            text: comment,
            user: name
        };

        fetch(`/plants/${plantID}/comments`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)

        }).then(response => {
            if (response.ok) {
                console.log('Got plant');
            } else {
                console.log('Could not fetch post for comment');
            }
        }).catch(error => {
            console.log('Error fetching post for comment:', error);
        });

    // When user is offline, create a new kind of request body and add this to the comments iDB, then manually add comment to chat history
        //must be manual as socket will not respond
    } else {
        const requestBody = {
            text: comment,
            user: name,
            plantId: plantID,
            chatId: chatId
        };
        console.log('Offline Commenting');
        await addCommentToIDB(requestBody);
        const newComment = requestBody;
        writeOnHistory(`<b> ${newComment.user}: </b> ${newComment.text}`, newComment.chatId);

    }
}


//given the plantID for a plant, load its comments
//if online, use the fetch request only
//if offline, use fetch request (for cached response) and load relevant comments from comments iDB
async function loadComments(plantID){

    //Check online status
    fetch(`/plants/${plantID}/comments`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            return response.json();
        })
        .then(data => {
            const comments = data.comments;
            const chatId = data.chatId;
            let history = document.getElementById('history-' + plantID.toString());
            comments.forEach(comment => {
                writeOnHistory(`<b> ${comment.userId}: </b> ${comment.text}`, chatId);
                // console.log('Comment added to history');
            });
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });

    if(!navigator.onLine){
        //do the same, but have sw respond with cached comments
        //then add getCommentsFromIDB to it
            try{
                const db = await openCommentsIDB();
                const idbComments = await getCommentsFromIDB(db);
                const filteredComments = idbComments.filter(comment => comment.plantId === plantID);
                const comments = filteredComments

                comments.forEach(comment => {
                    writeOnHistory(`<b> ${comment.user}: </b> ${comment.text}`, comment.chatId);
                });
            }
            catch(error){
                console.error('Error fetching comments from IndexedDB:', error);
            }
    }
}

// Date formatting function
function formatDate(datetime) {
    const date = datetime.split("T")[0];
    const splitDate = date.split("-");
    var year = splitDate[0];
    var month = splitDate[1];
    var day = splitDate[2];
    return day + "/" + month + "/" + year;
}

// Time formatting function
function formatTime(datetime) {
    return datetime.split("T")[1];
}


//Used for saving image data - needed for offline post functionality so that when syncing, images could be saved as expected
//using their image data.
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


//When the button to add a new plant is pressed, check if the form fields are all complete, then do all necessary set up
const addNewPlantButtonEventListener = async () => {
    if (!validateForm()) {
        return; // Exit function if form validation fails
    }

    // Read the image file as base64
    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];
    const photoBase64 = await readFileAsBase64(photoFile);

    fetch('/plants/validId') // Fetch request to generate a valid chat ID
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to generate a valid chat ID');
            }
            return response.json(); // Parse the JSON response
        })
        .then(async data => {
            // Once a valid chat ID is received, proceed with adding the plant to IndexedDB
            const db = await openSyncPlantsIDB();
            // const iDB = await openPlantsIDB();

            const dateTime = document.getElementById('date_time').value.toString();

            const sunRadios = document.querySelectorAll('input[name="sun"]');
            const idRadios = document.querySelectorAll('input[name="identification"]');

            let sunValue;
            let idValue;

            sunRadios.forEach(radio => {
                if (radio.checked) {
                    sunValue = radio.value;
                }
            });

            idRadios.forEach(radio => {
                if (radio.checked) {
                    idValue = radio.value;
                }
            });

            try {
                // Prepare plant data with the photo base64 string
                const plantData = {
                    date: formatDate(dateTime),
                    time: formatTime(dateTime),
                    height: document.getElementById('height').value,
                    spread: document.getElementById('spread').value,
                    flowers: document.getElementById('flowers').checked,
                    flower_colour: document.getElementById('flower_colour').value,
                    leaves: document.getElementById('leaves').checked,
                    fruit: document.getElementById('fruit').checked,
                    seeds: document.getElementById('seeds').checked,
                    sun: sunValue,
                    name: document.getElementById('name').value,
                    identification: idValue,
                    dbpedia: document.getElementById('dbpedia').value,
                    uname: document.getElementById('uname').value,
                    chatId: data.chatId,
                    comments: null,
                    longitude: document.getElementById('longitude').value,
                    latitude: document.getElementById('latitude').value,
                    photo: photoBase64 // Use the base64-encoded image
                };

                // Add the plant data to IndexedDB
                await addNewPlantToIDB(db, plantData, "sync-plants");

                // Register sync event if service worker is supported
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    const swRegistration = await navigator.serviceWorker.ready;
                    await swRegistration.sync.register('sync-plant');
                    console.log('Sync event registered');
                }

                // Redirect to homepage
                window.location.href = '/';
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to add plant. Please try again.');
            }
        });
};


//Checks that the form fields are all populated
function validateForm() {
    // Get references to form fields
    const uname = document.getElementById('uname');
    const dateTime = document.getElementById('date_time');
    const height = document.getElementById('height');
    const spread = document.getElementById('spread');
    const photo = document.getElementById('photo');
    const latitude = document.getElementById('latitude');
    const longitude = document.getElementById('longitude');
    const name = document.getElementById('name');
    const dbpedia = document.getElementById('dbpedia');

    // Check if any required field is empty
    if (
        uname.value === '' ||
        dateTime.value === '' ||
        height.value === '' ||
        spread.value === '' ||
        photo.value === '' ||
        latitude.value === '' ||
        longitude.value === '' ||
        name.value === '' ||
        dbpedia.value === ''
    ) {
        // Display an alert to the user that required fields are missing
        alert('Please fill out all required fields.');
        return false; // Prevent form submission
    }

    return true;
}
