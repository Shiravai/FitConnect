// routes/authRoutes.js
const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("username").trim().isLength({ min: 3, max: 20 }).withMessage("Username must be 3-20 characters."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  ],
  validate,
  ctrl.register
);

router.post(
  "/login",
  [
    body("identifier").trim().notEmpty().withMessage("Enter your username or email."),
    body("password").notEmpty().withMessage("Enter your password."),
  ],
  validate,
  ctrl.login
);

router.get("/me", auth, ctrl.me);

module.exports = router;
