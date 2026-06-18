// config/db.js — connects the server to MongoDB Atlas using Mongoose.
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(
      "\n[FitConnect] MONGO_URI is missing. Create server/.env from .env.example and paste your Atlas connection string.\n"
    );
    process.exit(1);
  }

  try {
    // Mongoose 8 has sensible defaults; no extra options needed.
    await mongoose.connect(uri);
    console.log("[FitConnect] MongoDB connected ✔");
  } catch (err) {
    console.error("[FitConnect] MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
