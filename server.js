const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.static('src'));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware to check session cookie before allowing connection
io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
        return next(new Error("Unauthorized: No session cookie found"));
    }

    const sessionCookie = cookies.split("; ").find(row => row.startsWith("X-SESSION-ID="));
    if (!sessionCookie) {
        return next(new Error("Unauthorized: Missing session token"));
    }

    console.log(`Client connected with session: ${sessionCookie.split("=")[1]}`);
    next(); // Allow connection
});

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
