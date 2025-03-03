const http = require('http');
const express = require('express');
const socketIo = require('socket.io'); // v2.5.0 requires this import

const app = express();
const server = http.createServer(app);

// Initialize Socket.io (v2.5.0 Syntax)
const io = socketIo(server, {
    origins: "*:*", // Allow all origins (deprecated in v3+ but needed in v2.5.0)
});

// Handle client connections
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send a message to the connected client
    socket.emit('message', 'Welcome to the WebSocket server (v2.5.0)!');

    // Listen for messages from clients
    socket.on('seating_update', (msg) => {
        console.log(`Message from ${socket.id}: ${msg}`);
        io.emit('seating_update', msg);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Socket.io v2.5.0 WebSocket server running on http://localhost:${PORT}`);
});
