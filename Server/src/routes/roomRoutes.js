const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createRoom,
  getRooms,
  joinRoom,
  leaveRoom,
  deleteRoom,
} = require("../controllers/roomController");

const router = express.Router();

// Create room

router.post("/", protect, createRoom);

// Get user's rooms

router.get("/", protect, getRooms);

// Join room

router.post("/join", protect, joinRoom);

// Leave room

router.post("/:roomId/leave", protect, leaveRoom);

// Delete room

router.delete("/:roomId", protect, deleteRoom);

module.exports = router;
