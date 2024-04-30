let name = null;
let roomNo = null;
let socket = io();
let rooms = [];

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
    console.log('Connecting to room:', chatId);

}


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
    //TODO - Not loading history correctly? Comments only appear after opening for first time (reloading website deletes all message history)
    //Might be something to do with DB...

    let history = document.getElementById('history-' + test.toString());
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}


// register service worker

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("../sw.js")
            .then((registration) => {
                console.log("Service worker registered");
            })
            .catch((error) => {
                console.error("service worker failed to register:", error);
            });
    });
}
