// routes/messageRoutes.js
const express = require("express");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/messageController");

const router = express.Router();

router.get("/", auth, ctrl.contacts);                  // people I can chat with
router.get("/unread", auth, ctrl.unread);              // unread counts (before :otherUserId)
router.post("/:otherUserId/read", auth, ctrl.markRead);// mark a conversation read
router.get("/:otherUserId", auth, ctrl.history);       // 1:1 chat history

module.exports = router;
