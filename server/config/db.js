// config/db.js — connects the server to MongoDB Atlas using Mongoose.
const dns = require("dns");
const mongoose = require("mongoose");

// Some machines (often due to a VPN or ad-blocker) set the system DNS to 127.0.0.1,
// which refuses the SRV lookups that "mongodb+srv://" needs ("querySrv ECONNREFUSED").
// Forcing public DNS resolvers makes the Atlas connection work regardless of that.
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch {
  /* ignore — fall back to system DNS */
}

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
