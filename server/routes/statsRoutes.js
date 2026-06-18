// routes/statsRoutes.js
const express = require("express");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/statsController");

const router = express.Router();

router.get("/overview", auth, ctrl.overview); // live data for D3 graphs (req #29)

module.exports = router;
