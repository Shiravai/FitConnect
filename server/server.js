// server.js — application entry point.
// Boots Express (REST API), serves uploaded media, and attaches Socket.io for live chat.
require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const registerChat = require("./socket/chat");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const statsRoutes = require("./routes/statsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ---- Global middleware ----
// Allow any origin so both the web client and the Expo / React Native mobile app can connect.
app.use(cors());
app.use(express.json({ limit: "15mb" })); // larger limit allows base64 canvas drawings
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images/videos statically at /uploads/<file>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple health check
app.get("/api/health", (req, res) => res.json({ status: "ok", app: "FitConnect" }));

// ---- REST API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);

// 404 for unknown API routes
app.use("/api", (req, res) => res.status(404).json({ message: "API route not found" }));

// ---- Central error handler (requirement #24 — never crash) ----
app.use(errorHandler);

// ---- HTTP + Socket.io server ----
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
registerChat(io); // wire up real-time chat (requirement #28)

// Safety nets so an unexpected error never kills the process
process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err));
process.on("uncaughtException", (err) => console.error("[uncaughtException]", err));

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`[FitConnect] Server running on http://localhost:${PORT}`));
});
