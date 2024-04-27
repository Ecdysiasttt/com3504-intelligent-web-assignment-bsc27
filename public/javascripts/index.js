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
    // it sets up the interface so that userId and room are selected
    console.log('ASDAKLSJDLKAJSD');

    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}

function sendChatText(text) {
    let chatText = document.getElementById('chat_input').value;
    socket.emit('chat', roomNo, name, text.value);
    console.log('Attempting to send message:', text.value);
}

function connectToRoom(chatId, uname) {
    name = uname;
    roomNo = chatId;
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', chatId, name);
    console.log('Connecting to room:', chatId);

}


function toggleComments(chatId, uname) {
    var toCheck = "chat_interface-" + chatId.toString();
    console.log(toCheck)
    var chatInterface = document.getElementById(toCheck);
    console.log(chatInterface);
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
    let history = document.getElementById('history-' + roomNo.toString());
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

