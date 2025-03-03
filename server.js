const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use(express.static('src'));

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.emit('message', 'Welcome to the WebSocket server!');

    socket.on('seating-update', (msg) => {
        console.log(`Received message from ${socket.id}: ${msg}`);
        io.emit('seating-update', msg);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Socket.io WebSocket server running on http://localhost:${PORT}`);
});
