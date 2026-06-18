// models/Group.js — a sport community/group.
const mongoose = require("mongoose");

// Shared list of sport types, reused for validation and for UI dropdowns.
const SPORT_TYPES = [
  "Running", "CrossFit", "Yoga", "Cycling", "Swimming", "Gym", "Football", "Basketball",
  "Tennis", "Boxing", "Pilates", "Hiking", "Dancing", "Climbing", "Volleyball",
  "Martial Arts", "Rowing", "Skating", "Surfing", "Golf", "Skiing", "Triathlon",
];

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: "", maxlength: 500 },
    sportType: { type: String, enum: SPORT_TYPES, required: true },
    privacy: { type: String, enum: ["public", "private"], default: "public" },
    coverUrl: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

groupSchema.statics.SPORT_TYPES = SPORT_TYPES;

module.exports = mongoose.model("Group", groupSchema);
module.exports.SPORT_TYPES = SPORT_TYPES;
