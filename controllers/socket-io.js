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

            socket.on('chat', function (room, userId, chatText) {
                io.sockets.to(room).emit('chat', room, userId, chatText);
                // console.log('Sent message:', chatText);
            });

        } catch (e) {
            console.log("Failed")
        }
    });
}