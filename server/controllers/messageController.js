// controllers/messageController.js — chat history, contacts, and unread tracking.
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

// GET /api/messages/:otherUserId  — full 1:1 history; also marks their messages as read.
exports.history = async (req, res, next) => {
  try {
    const room = Message.roomId(req.user._id, req.params.otherUserId);
    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .populate("sender", "name username avatarUrl");

    // Opening the chat = I've read everything the other person sent me.
    await Message.updateMany(
      { room, sender: req.params.otherUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ room, messages });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages  — list of people I can chat with.
exports.contacts = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name username avatarUrl")
      .limit(100);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/unread  — how many unread messages I have, grouped by sender.
exports.unread = async (req, res, next) => {
  try {
    const me = req.user._id;
    const rows = await Message.aggregate([
      { $match: { room: { $regex: String(me) }, sender: { $ne: me }, read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);

    const byUser = {};
    let total = 0;
    rows.forEach((r) => {
      byUser[String(r._id)] = r.count;
      total += r.count;
    });
    res.json({ total, byUser });
  } catch (err) {
    next(err);
  }
};

// POST /api/messages/:otherUserId/read  — mark this conversation as read.
exports.markRead = async (req, res, next) => {
  try {
    const room = Message.roomId(req.user._id, req.params.otherUserId);
    await Message.updateMany(
      { room, sender: new mongoose.Types.ObjectId(req.params.otherUserId), read: false },
      { $set: { read: true } }
    );
    res.json({ message: "ok" });
  } catch (err) {
    next(err);
  }
};
