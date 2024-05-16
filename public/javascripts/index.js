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


// TODO no references - delete this?
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
                    <button onclick="removePlant('${plant._id}');" href="/" class="btn btn-outline-danger">
                        Delete
                    </button>
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

    //check if online. if online, save current plants to iDB

    // if (navigator.onLine) {
    //     //fetch plants from mongoDB
    //     //store in iDB
    //     console.log('Online mode')
    //     fetch('http://localhost:3000/plants')
    //         .then(function (res) {
    //             return res.json();
    //         }).then(function (newPlants) {
    //         openPlantsIDB().then((db) => {
    //             // console.log(newPlants);
    //             deleteAllExistingPlantsFromIDB(db).then(() => {
    //                 addNewPlantsToIDB(db, newPlants).then(() => {
    //                     console.log("All new plants added to IDB")
    //                 })
    //             });
    //         });
    //     });
    //     // fetch('http://localhost:3000/').then(function(res) {
    //     //    res.render()
    //     // });
    //
    // } else {
    //     //fetch plants from iDB
    //     //use these instead
    //     console.log("Offline mode")
    //     // fetch('http://localhost:3000/fetch')
    //     // openPlantsIDB().then((db) => {
    //     //     getAllPlants(db).then((plants) => {
    //     //         for (const plant of plants) {
    //     //             insertPlantInList(plant)
    //     //         }
    //     //     });
    //     // });

    // }

}

async function fetchPlants() {
    if (navigator.onLine) {
        // Fetch plants from MongoDB and store in IndexedDB
        console.log('Online mode');
        const response = await fetch('http://localhost:3000/plants');
        const newPlants = await response.json();
        const db = await openPlantsIDB();
        await deleteAllExistingPlantsFromIDB(db);
        await addNewPlantsToIDB(db, newPlants);
        return newPlants;
    } else {
        // Fetch plants from IndexedDB
        console.log('Offline mode');
        const db = await openPlantsIDB();
        let newPlants = await getPlantsFromIDB();
        console.log('NEW PLANTS: ', newPlants);
        return newPlants;
    }
}

async function fetchAndRenderIndexPage() {
    const plants = await fetchPlants();
    console.log('Online:', navigator.onLine);
    console.log(plants);
    renderIndexPage(plants);
}

function renderIndexPage(plants) {
    const container = document.getElementById('plant-container');
    container.innerHTML = ''; // Clear existing content
    plants.forEach(insertPlantInList);
}

document.addEventListener('DOMContentLoaded', function () {
    // Call fetchAndRenderIndexPage when the DOM content is loaded
    fetchAndRenderIndexPage();
});
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

function setMarker(latitude, longitude){
    marker.setLatLng([latitude, longitude]);
}

function setMapView(event, latitude, longitude){
    if(event){
        event.preventDefault();
    }
    if (latitude && longitude)
        map.setView([latitude, longitude], 13);
    else
        map.setView([0, 0], 13);
}

function setAtGetMapPos(event){
    var latitude = document.getElementById("latitude").value;
    var longitude = document.getElementById("longitude").value;

    setMapView(event, latitude, longitude);
}


function setAtGetPos() {
    var latitude = document.getElementById("latitude").value;
    var longitude = document.getElementById("longitude").value;

    setMarker(latitude, longitude);
}



function sendChatText(text, chatId) {
    if (text.value.toString() !== "") {
        socket.emit('chat', chatId, name, text.value);
    }
    console.log('Sending to room:', chatId);

    // let result = comments.create(chatId, name, text.value);
    // console.log(result);
}

function connectToRoom(chatId) {
    roomNo = chatId;
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', chatId, name);
    // console.log('Connecting to room:', chatId);

}

//TODO - probably want to delete the 'rooms' stuff because it really doesn't do much right now. Leaving in for now as it isn't *harming* anything
function toggleComments(chatId, uname) {
    const chatInterface = document.getElementById("chat_interface-" + chatId.toString());
    if (chatInterface.style.display === "none") {
        chatInterface.style.display = "block";
        connectToRoom(chatId, uname);
        if (!rooms.includes(chatId))
            rooms.push(chatId);

        console.log(rooms);

        // socket.emit('connect to all', rooms, name);
    }
    else {
        chatInterface.style.display = "none";
        let pos = rooms.indexOf(chatId);
        delete rooms[pos];
        rooms = rooms.filter(function(e){return e}); //Removes EMPTY elements in rooms array after deletion
        console.log(rooms);
    }
}

function writeOnHistory(text, id) {
    //TODO - Not loading history correctly? Comments only appear after opening for first time (reloading page deletes all message history)
    //Might be something to do with DB...

    let history = document.getElementById('history-' + id.toString());
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}


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


function addCommentToPlantDB(plantID, comment) {

    console.log('Fetching comment post...', comment)

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
}


function loadComments(plantID){
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

const addNewPlantButtonEventListener = () => {
    if (!validateForm()) {
        return; // Exit function if form validation fails
    }
    fetch('/plants/validId') // Fetch request to generate a valid chat ID
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to generate a valid chat ID');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            // Once a valid chat ID is received, proceed with adding the plant to IndexedDB
            openSyncPlantsIDB().then((db) => {

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
                // Create an object representing the plant data
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
                    photo: document.getElementById('photo').value,
                    uname: document.getElementById('uname').value,
                    chatId: data.chatId,
                    comments: null,
                    longitude: document.getElementById('longitude').value,
                    latitude: document.getElementById('latitude').value
                };

                // Add the plant data to IndexedDB
                addNewPlantToIDB(db, plantData, "sync-plants")
                    .then(() => {
                        // After successfully adding the plant, redirect to the homepage
                        if ('serviceWorker' in navigator && 'SyncManager' in window) {
                            navigator.serviceWorker.ready.then(swRegistration => {
                                swRegistration.sync.register('sync-plant')
                                    .then(() => {
                                        console.log('Sync event registered');
                                        window.location.href = '/';
                                    })
                                    .catch(err => {
                                        console.error('Sync registration failed', err);
                                    });
                            });
                        } else {
                            window.location.href = '/';
                        }
                    })
                    .catch(error => {
                        console.error('Error adding plant to IndexedDB:', error);
                    });
            });
        });
};


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
        // Display an alert or some indication to the user that required fields are missing
        alert('Please fill out all required fields.');
        return false; // Prevent form submission
    }

    // Additional validation logic can be added here if needed

    return true; // Allow form submission
}
