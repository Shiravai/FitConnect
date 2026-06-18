// routes/userRoutes.js
const express = require("express");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/userController");

const router = express.Router();

router.get("/", auth, ctrl.list);            // List
router.get("/search", auth, ctrl.search);    // Search
router.put("/me", auth, ctrl.updateMe);      // Update own profile
router.delete("/me", auth, ctrl.deleteMe);   // Delete own account
router.post("/:id/friend", auth, ctrl.toggleFriend);
router.get("/:id", auth, ctrl.getOne);       // Single profile

module.exports = router;
