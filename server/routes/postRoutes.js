// routes/postRoutes.js
const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/postController");

const router = express.Router();

router.get("/", auth, ctrl.list);                 // List (visible posts)
router.get("/feed", auth, ctrl.feed);             // Personal feed (req #22)
router.get("/search", auth, ctrl.search);         // Advanced search (req #20)
router.get("/user/:userId", auth, ctrl.byUser);   // Posts by one user
router.get("/group/:groupId", auth, ctrl.byGroup);// Posts in a group

router.post("/upload", auth, upload.single("file"), ctrl.upload); // media/drawing upload
router.post("/", auth, ctrl.create);              // Create
router.put("/:id", auth, ctrl.update);            // Update (own)
router.delete("/:id", auth, ctrl.remove);         // Delete (own)

router.post("/:id/like", auth, ctrl.toggleLike);
router.post("/:id/comment", auth, ctrl.addComment);

module.exports = router;
