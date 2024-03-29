// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

// app.use(cors());
// app.use(express.static('public'));

// const rooms = {};

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('createRoom', () => {
//         const roomCode = generateRoomCode();
//         rooms[roomCode] = { users: [socket.id] };
//         socket.join(roomCode);
//         socket.emit('roomCreated', roomCode);
//     });

//     socket.on('joinRoom', (roomCode) => {
//         if (/^\d+$/.test(roomCode) && rooms[roomCode] && rooms[roomCode].users.length < 2) {
//             rooms[roomCode].users.push(socket.id);
//             socket.join(roomCode);
//             io.to(roomCode).emit('roomJoined', roomCode);
//         } else {
//             socket.emit('roomFull');
//         }
//     });

//     socket.on('message', (message) => {
//         const roomCode = getRoomCodeBySocketId(socket.id);
//         io.to(roomCode).emit('message', message);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//         const roomCode = getRoomCodeBySocketId(socket.id);
//         if (roomCode) {
//             const index = rooms[roomCode].users.indexOf(socket.id);
//             if (index !== -1) {
//                 rooms[roomCode].users.splice(index, 1);
//                 if (rooms[roomCode].users.length === 0) {
//                     delete rooms[roomCode];
//                 }
//             }
//         }
//     });
// });

// function generateRoomCode() {
//     return Math.floor(1000 + Math.random() * 9000).toString();
// }

// function getRoomCodeBySocketId(socketId) {
//     for (const roomCode in rooms) {
//         if (rooms[roomCode].users.includes(socketId)) {
//             return roomCode;
//         }
//     }
//     return null;
// }

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = { users: [socket.id] };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
        console.log(`Room created: ${roomCode}`);
    });

    socket.on('joinRoom', (roomCode) => {
        if (/^\d+$/.test(roomCode) && rooms[roomCode] && rooms[roomCode].users.length < 2) {
            rooms[roomCode].users.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('roomJoined', roomCode);
            console.log(`${socket.id} joined Room: ${roomCode}`);
        } else {
            socket.emit('roomFull');
            console.log(`${socket.id} failed to join Room: ${roomCode}`);
        }
    });

    socket.on('message', (message) => {
        const roomCode = getRoomCodeBySocketId(socket.id);
        io.to(roomCode).emit('message', message);
        console.log(`Message from ${socket.id} in Room: ${roomCode}`);
    });

    socket.on('gameMove', ({ sender, receiver, move }) => {
        const roomCode = getRoomCodeBySocketId(socket.id);
        io.to(roomCode).emit('gameMove', { sender, receiver, move });
        console.log(`Game move from ${sender} in Room: ${roomCode}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const roomCode = getRoomCodeBySocketId(socket.id);
        if (roomCode) {
            const index = rooms[roomCode].users.indexOf(socket.id);
            if (index !== -1) {
                rooms[roomCode].users.splice(index, 1);
                if (rooms[roomCode].users.length === 0) {
                    delete rooms[roomCode];
                    console.log(`Room deleted: ${roomCode}`);
                }
            }
        }
    });
});

function generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function getRoomCodeBySocketId(socketId) {
    for (const roomCode in rooms) {
        if (rooms[roomCode].users.includes(socketId)) {
            return roomCode;
        }
    }
    return null;
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
