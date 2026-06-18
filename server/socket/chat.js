// socket/chat.js — real-time chat over Socket.io (requirement #28).
// Each user joins a personal room ("user:<id>") on connect, so they receive new
// messages anywhere on the site — even when the chat window isn't open.
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");

module.exports = function registerChat(io) {
  // Authenticate each socket using the same JWT as the REST API.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Personal room -> lets us push messages to this user globally.
    socket.join(`user:${socket.userId}`);

    // (Optional) explicitly join a 1:1 conversation room.
    socket.on("chat:join", ({ otherUserId }) => {
      const room = Message.roomId(socket.userId, otherUserId);
      socket.join(room);
      socket.emit("chat:joined", { room });
    });

    // Send a message: persist it, then deliver to BOTH users' personal rooms.
    socket.on("chat:message", async ({ otherUserId, text }) => {
      try {
        if (!text || !text.trim()) return;
        const room = Message.roomId(socket.userId, otherUserId);
        const msg = await Message.create({ room, sender: socket.userId, text: text.trim() });
        const sender = await User.findById(socket.userId).select("name username avatarUrl");

        const payload = {
          _id: msg._id,
          room,
          text: msg.text,
          createdAt: msg.createdAt,
          sender,
          to: otherUserId, // recipient id, so clients know which conversation it belongs to
        };

        io.to(`user:${socket.userId}`).to(`user:${otherUserId}`).emit("chat:message", payload);
      } catch (err) {
        socket.emit("chat:error", { message: "Could not send message." });
      }
    });

    socket.on("chat:typing", ({ otherUserId }) => {
      io.to(`user:${otherUserId}`).emit("chat:typing", { from: socket.userId });
    });
  });
};
