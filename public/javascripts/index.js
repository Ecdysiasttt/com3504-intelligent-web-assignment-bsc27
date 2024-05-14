let name = null;
let roomNo = null;
// let socket = io();
//
let socket;

if (typeof io === "function") {
    socket = io();
} else {
    console.error("Socket.io is not available.");
}

let rooms = [];
// let map = null;
let marker;
let map;

const insertPlantInList = (plant) => {
    if (plant.name) {
        const container = document.getElementById("plant-container");

        const div = document.createElement("div");
        div.id = `div-${plant._id}`;
        div.classList.add("mb-2", "border", "border-dark", "rounded", "p-2");

        // Construct the HTML content for the plant
        div.innerHTML = `
            <div class="border-bottom border-dark mb-2">
                <div class="d-flex justify-content-between">
                    <h4 class="mb-2">${plant.name}</h4>
                    <a href="/plants/${plant._id}" class="mb-2">View details</a>
                    <button onclick="removePlant('${plant._id}');" href="/">Delete Plant</button>
                </div>
                <div class="d-flex justify-content-between">
                    <p class="mb-2">
                        <i class="fa-solid fa-magnifying-glass align-middle" title="Date spotted"></i> 
                        ${plant.time} - ${plant.date}
                    </p>
                    <p class="mb-2">
                        <i class="fa-solid fa-user align-middle" title="User"></i> ${plant.uname}
                    </p>
                </div>
            </div>
            <div class="d-flex justify-content-between border-bottom border-dark mb-3" id="info-div-${plant._id}">
                <div id="left-panel-${plant._id}">
                    <div id="height-spread-sun-${plant._id}" class="d-flex">
                        <i class="fa-solid fa-ruler-combined" title="Plant spread and height in centimetres"></i>
                        <p class="ml-2 mr-3 align-middle">${plant.spread}x${plant.height}cm</p>
                        <p class="mr-1">
                            <i class="fa-solid fa-cloud-sun align-middle" title="Sun coverage"></i> ${plant.sun}
                        </p>
                    </div>
                    <div class="mb-1">
                        <div class="icon-div d-flex" id="icons-${plant._id}">
                            <i class="fa-solid fa-leaf" title="${plant.leaves ? "Has": "Does not have"} leaves" 
                                style="color: ${plant.leaves ? "#000000": "#9e9e9e"}"></i>
                            <i class="fa-solid fa-lemon" title="${plant.fruit ? "Bears": "Does not bear"} fruit" 
                                style="color: ${plant.fruit ? "#000000": "#9e9e9e"}"></i>
                            <i class="fa-solid fa-seedling" title="${plant.seeds ? "Has": "Does not have"} seeds" 
                                style="color: ${plant.seeds ? "#000000": "#9e9e9e"}"></i>
                            <i class="vs vs-flower" title="${plant.flowers ? "Has": "Does not have"} flowers" 
                                style="color: ${plant.flowers ? "#000000": "#9e9e9e"}"></i>
                        </div>
                        ${plant.flowers ? `
                            <div class="d-flex">
                                <p class="mb-0">${plant.flower_colour}</p>
                                <i class="fa-solid fa-palette align-middle" title="Flower colour" 
                                    style="color: ${plant.flowers ? "#000000": '#9e9e9e'}"></i>
                            </div>` : ''}
                    </div>
                </div>
                <div id="right-panel" class="mb-2">
                    <img src="${plant.photo}" class="mw-100" id="photo-${plant._id}">
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <div>
                    <i class="fa-solid fa-book-atlas align-middle" title="View on DBPedia"></i>
                    <a href="${plant.dbpedia}" target="_blank">View on DBPedia</a>
                </div>
                <p>
                    <i class="fa-regular fa-id-card align-middle" title="Identification status"></i> ${plant.identification}
                </p>
                <script>
                    fixFormat("${plant._id}");
                </script>
            </div>
        `;

        // Append the constructed div to the container
        container.appendChild(div);
    }
};



// var plants = require('../../controllers/plants');
// var comments = require('../../controllers/comments');

// document.addEventListener("DOMContentLoaded", function() {
//     if ('serviceWorker' in navigator) {
//         navigator.serviceWorker.register('/sw.js', {scope: '/'})
//             .then(function (reg) {
//                 console.log('Service Worker Registered!', reg);
//             })
//             .catch(function (err) {
//                 console.log('Service Worker registration failed: ', err);
//             });
//     }
//
//     // Asks for permissions from the user
//     if ("Notification" in window) {
//         if (Notification.permission === "granted") {
//         } else if (Notification.permission !== "denied") {
//             Notification.requestPermission().then(function (permission) {
//                 if (permission === "granted") {
//                     navigator.serviceWorker.ready
//                         .then(function (serviceWorkerRegistration) {
//                             serviceWorkerRegistration.showNotification("Plantpedia",
//                                 {body: "Notifications are enabled!"})
//                                 .then(r =>
//                                     console.log(r)
//                                 );
//                         });
//                 }
//             });
//         }
//     }
//     if (navigator.onLine) {
//         console.log('Online mode')
//         fetch('http://localhost:3000/plants')
//             .then(function (res) {
//                 return res.json();
//             }).then(function (newPlants) {
//             openPlantsIDB().then((db) => {
//                 insertPlantInList(db, newPlants)
//                 deleteAllExistingPlantsFromIDB(db).then(() => {
//                     addNewPlantsToIDB(db, newPlants).then(() => {
//                         console.log("All new todos added to IDB")
//                     })
//                 });
//             });
//         });
//
//     } else {
//         console.log("Offline mode")
//         openPlantsIDB().then((db) => {
//             getAllPlants(db).then((plants) => {
//                 for (const plant of plants) {
//                     insertPlantInList(plant)
//                 }
//             });
//         });
//
//     }
//
// });

function init() {
    //Create user info - unique name and function to add message to history when sent
    name = "User-" + Math.floor(Math.random() * 90000 + 100000);
    // called when a message is received
    socket.on('chat', function (chatId, userId, chatText) {
        writeOnHistory('<b>' + userId + ':</b> ' + chatText, chatId);
    });

}

function loadMap(){
    //Initialise leaflet map
    map = L.map('map').setView([0, 0], 13); //Default long/lat of 0,0

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    marker = L.marker([0,0]).addTo(map);
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

//This is still being called for some reason?
// console.log('here');
// //TODO set the history for the plant to have the comments from the database (and connect to the room?)
// fetch(`/plants/${plantID}/comments`, {
//     method: 'get'
// }).then(response => {
//     if (response.ok) {
//         console.log('Got comments');
//     } else {
//         console.log('Could not fetch comments');
//     }
// }).catch(error => {
//     console.log('Error fetching comments:', error);
// });