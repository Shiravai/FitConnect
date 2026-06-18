// models/Post.js — a workout post in the feed.
const mongoose = require("mongoose");
const { SPORT_TYPES } = require("./Group");

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 300 },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text: { type: String, default: "", trim: true, maxlength: 1000 },
    // "drawing" = an image produced by the Canvas drawing tool (requirement #26).
    mediaType: { type: String, enum: ["none", "image", "video", "drawing"], default: "none" },
    mediaUrl: { type: String, default: "" },
    workout: {
      sportType: { type: String, enum: [...SPORT_TYPES, ""], default: "" },
      durationMin: { type: Number, default: 0, min: 0 },
      distanceKm: { type: Number, default: 0, min: 0 },
      calories: { type: Number, default: 0, min: 0 },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Helpful indexes for search/feed performance.
postSchema.index({ "workout.sportType": 1, createdAt: -1 });
postSchema.index({ text: "text" });

module.exports = mongoose.model("Post", postSchema);
