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

    // Dynamic Event Subscription
    socket.on('subscribe', (eventName) => {
        console.log(`Client ${socket.id} subscribed to: ${eventName}`);
        socket.join(eventName);
    });

    // Dynamic Event Broadcasting
    socket.on('publish', ({ eventName, data }) => {
        console.log(`Received event ${eventName} from ${socket.id}:`, data);
        io.to(eventName).emit(eventName, data); // Send to all subscribers of eventName
    });

    socket.on('seating-update', (msg) => {
        console.log(`Received message from ${socket.id}: ${msg}`);
        io.emit('seating-update', msg);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
