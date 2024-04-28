exports.init = function(io) {
    io.sockets.on('connection', function (socket) {
        console.log("try");
        try {
            /**
             * create or joins a room
             */
            socket.on('create or join', function (room, userId) {
                socket.join(room);
                io.sockets.to(room).emit('joined', room, userId);
                // console.log('Joined room:', room);
            });

            socket.on('chat', function (chatId, userId, chatText) {
                io.sockets.to(chatId).emit('chat', chatId, userId, chatText);
                console.log('Sent to room:', chatId);
                // console.log('Sent message:', chatText);
            });

            // socket.on('connect to all', function (rooms, userId) {
            //     for (var i = 0; i<rooms.length; i++){
            //         io.sockets.to(rooms[i]).emit('joined', rooms[i], userId);
            //     }
            // });

        } catch (e) {
            console.log("Failed")
        }
    });
}