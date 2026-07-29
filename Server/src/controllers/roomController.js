const Room = require("../models/Room");
const User = require("../models/User");

// =========================
// CREATE ROOM
// =========================

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Room name is required",
      });
    }

    const room = await Room.create({
      name,
      owner: req.userId,
      members: [req.userId],
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);

    res.status(500).json({
      message: "Server error while creating room",
    });
  }
};

// =========================
// GET USER ROOMS
// =========================

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.userId,
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(200).json({
      rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);

    res.status(500).json({
      message: "Server error while fetching rooms",
    });
  }
};

// =========================
// JOIN ROOM
// =========================

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const alreadyMember = room.members.some(
      (memberId) => memberId.toString() === req.userId.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "You are already a member of this room",
      });
    }

    room.members.push(req.userId);

    await room.save();

    res.status(200).json({
      message: "Joined room successfully",
      room,
    });
  } catch (error) {
    console.error("Join room error:", error);

    res.status(500).json({
      message: "Server error while joining room",
    });
  }
};

// =========================
// LEAVE ROOM
// =========================

const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.owner.toString() === req.userId.toString()) {
      return res.status(400).json({
        message: "Owner cannot leave the room. Delete the room instead.",
      });
    }

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== req.userId.toString(),
    );

    await room.save();

    res.status(200).json({
      message: "Left room successfully",
    });
  } catch (error) {
    console.error("Leave room error:", error);

    res.status(500).json({
      message: "Server error while leaving room",
    });
  }
};

// =========================
// DELETE ROOM
// =========================

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "Only the room owner can delete this room",
      });
    }

    await Room.findByIdAndDelete(roomId);

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);

    res.status(500).json({
      message: "Server error while deleting room",
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  joinRoom,
  leaveRoom,
  deleteRoom,
};
