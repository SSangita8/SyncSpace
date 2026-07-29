require("dotenv").config();

const http = require("http");

const app = require("./app");

const connectDB = require("./config/db");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// =========================
// CREATE HTTP SERVER
// =========================

const httpServer = http.createServer(app);

// =========================
// CREATE SOCKET.IO SERVER
// =========================

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",

    methods: ["GET", "POST"],
  },
});

// =========================
// SOCKET CONNECTION
// =========================

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // =========================
  // JOIN ROOM
  // =========================

  socket.on("join-room", (roomId) => {
    // Store room ID on socket

    socket.roomId = roomId;

    // Join Socket.io room

    socket.join(roomId);

    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Get current room

    const room = io.sockets.adapter.rooms.get(roomId);

    const userCount = room ? room.size : 0;

    // Send current user count
    // to everyone in the room

    io.to(roomId).emit("room-users", {
      count: userCount,
    });

    // Notify other users

    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
    });
  });

  // =========================
  // DRAW SHAPE
  // =========================

  socket.on("draw-shape", ({ roomId, shape }) => {
    console.log(`Shape drawn in room ${roomId}`);

    // Send shape to everyone
    // except the original sender

    socket.to(roomId).emit("shape-drawn", shape);
  });

  // =========================
  // CURSOR MOVEMENT
  // =========================

  socket.on("cursor-move", (data) => {
    const { roomId, userId, name, color, x, y } = data;

    socket.to(roomId).emit("cursor-update", {
      userId,
      name,
      color,
      x,
      y,
    });
  });

  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const roomId = socket.roomId;

    if (!roomId) {
      return;
    }

    // Get updated room

    const room = io.sockets.adapter.rooms.get(roomId);

    const userCount = room ? room.size : 0;

    // Update online users

    io.to(roomId).emit("room-users", {
      count: userCount,
    });

    // Notify remaining users

    socket.to(roomId).emit("user-left", {
      socketId: socket.id,
    });
  });
});

// =========================
// CONNECT DATABASE
// =========================

connectDB();

// =========================
// START SERVER
// =========================

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
