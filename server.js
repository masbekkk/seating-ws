const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static('src'));

const JWT_SECRET = process.env.JWT_SECRET;

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// JWT auth middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Authentication error: Token not provided"));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded; // Save user data to socket
        next();
    } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
    }
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}, user: ${JSON.stringify(socket.user)}`);

    socket.emit('message', `Welcome ${socket.user.name || 'user'}!`);

    socket.on('subscribe', (eventName) => {
        console.log(`Client ${socket.id} subscribed to: ${eventName}`);
        socket.join(eventName);
    });

    socket.on('publish', ({ eventName, data }) => {
        console.log(`Received event ${eventName} from ${socket.id}:`, data);
        io.to(eventName).emit(eventName, data);
    });

    socket.on('seating-update', (msg) => {
        console.log(`Seating update from ${socket.id}: ${msg}`);
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
