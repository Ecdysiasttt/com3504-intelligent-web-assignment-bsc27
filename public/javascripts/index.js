let name = null;
let roomNo = null;
let socket = io();
let rooms = [];


// var plants = require('../../controllers/plants');
// var comments = require('../../controllers/comments');


window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }
}

function init() {
    name = "User-" + Math.floor(Math.random() * 90000 + 100000);
    // called when a message is received
    socket.on('chat', function (chatId, userId, chatText) {
        writeOnHistory('<b>' + userId + ':</b> ' + chatText, chatId);
    });

}

function sendChatText(text, chatId) {
    if (text.value.toString() !== "") {
        socket.emit('chat', chatId, name, text.value);
    }
    console.log('Sending to room:', chatId);

    // let result = comments.create(chatId, name, text.value);
    // console.log(result);
}

function connectToRoom(chatId, uname) {
    roomNo = chatId;
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', chatId, name);
    // console.log('Connecting to room:', chatId);

}

//TODO - probably want to delete the 'rooms' stuff because it really doesn't do much right now. Leaving in for now as it isn't *harming* anything
function toggleComments(chatId, uname) {
    var chatInterface = document.getElementById("chat_interface-" + chatId.toString());
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

function writeOnHistory(text, test) {
    //TODO - Not loading history correctly? Comments only appear after opening for first time (reloading page deletes all message history)
    //Might be something to do with DB...

    let history = document.getElementById('history-' + test.toString());
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
            return longitude, latitude;
            return location;
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
            console.log('Succesful removal');
            window.location.reload();
        } else {
            console.log('Failed removal');
        }
    }).catch(error => {
        console.log('Removal error:', error);
    });

}