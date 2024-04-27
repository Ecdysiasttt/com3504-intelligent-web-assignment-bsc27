let name = null;
let roomNo = null;
let socket = io();


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
    socket.on('chat', function (room, userId, chatText) {
        // let who = userId
        // if (userId === name) who = 'Me';
        writeOnHistory('<b>' + userId + ':</b> ' + chatText);
    });

}

function sendChatText(text, chatId) {
    if (text.value.toString() !== "") {
        socket.emit('chat', chatId, name, text.value);
    }
    // console.log('Attempting to send message:', text.value);
}

function connectToRoom(chatId, uname) {
    roomNo = chatId;
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', chatId, name);
    // console.log('Connecting to room:', chatId);

}


function toggleComments(chatId, uname) {
    var chatInterface = document.getElementById("chat_interface-" + chatId.toString());
    if (chatInterface.style.display === "none") {
        chatInterface.style.display = "block";
        connectToRoom(chatId, uname);
    }
    else {
        chatInterface.style.display = "none";
    }
}

/**
 * it appends the given html text to the history div
 * @param text: the text to append
 */
function writeOnHistory(text) {
    //TODO - Not loading history correctly? Comments only appear after opening for first time (reloading website deletes all message history)
    //Might be something to do with DB...

    let history = document.getElementById('history-' + roomNo.toString());
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

