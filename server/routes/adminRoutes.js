// routes/adminRoutes.js — every route here requires a logged-in ADMIN (requirement #21).
const express = require("express");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/permissions");
const ctrl = require("../controllers/adminController");

const router = express.Router();
router.use(auth, isAdmin); // gate the whole router

router.get("/overview", ctrl.overview);
router.get("/users", ctrl.listUsers);
router.put("/users/:id/role", ctrl.setRole);
router.delete("/users/:id", ctrl.deleteUser);
router.get("/groups", ctrl.listGroups);
router.delete("/groups/:id", ctrl.deleteGroup);

module.exports = router;
