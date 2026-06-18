// routes/groupRoutes.js
const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { isGroupManager } = require("../middleware/permissions");
const ctrl = require("../controllers/groupController");

const router = express.Router();

router.get("/", auth, ctrl.list);          // List
router.get("/search", auth, ctrl.search);  // Advanced search (req #20)

router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Group name is required."),
    body("sportType").notEmpty().withMessage("Choose a sport type."),
  ],
  validate,
  ctrl.create
);

router.get("/:id", auth, ctrl.getOne);     // Single

// Membership actions
router.post("/:id/join", auth, ctrl.requestJoin);
router.post("/:id/leave", auth, ctrl.leave);

// Manager-only actions (isGroupManager checks ownership)
router.put("/:id", auth, isGroupManager, ctrl.update);
router.delete("/:id", auth, isGroupManager, ctrl.remove);
router.post("/:groupId/approve/:userId", auth, isGroupManager, ctrl.approve);
router.post("/:groupId/reject/:userId", auth, isGroupManager, ctrl.reject);
router.delete("/:groupId/members/:userId", auth, isGroupManager, ctrl.removeMember);

module.exports = router;
