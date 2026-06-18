// models/Message.js — a single chat message (powers the Socket.io chat, requirement #28).
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // A deterministic room id. For 1:1 chat we use the two sorted user ids joined by "_".
    room: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    // For 1:1 chat the recipient is the other participant; "read" flips to true
    // once the recipient opens the conversation (powers the unread badges).
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Builds the same room id no matter who opens the chat first.
messageSchema.statics.roomId = function (idA, idB) {
  return [String(idA), String(idB)].sort().join("_");
};

module.exports = mongoose.model("Message", messageSchema);
