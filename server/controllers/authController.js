// controllers/authController.js — register, login, and "who am I".
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, username, password, favoriteSport } = req.body;

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ message: "Email or username already in use." });

    const user = new User({ name, email, username, favoriteSport: favoriteSport || "" });
    await user.setPassword(password);
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login  (accepts username OR email in the "identifier" field)
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: String(identifier).toLowerCase() }, { username: identifier }],
    });
    if (!user) return res.status(401).json({ message: "Wrong username or password." });

    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ message: "Wrong username or password." });

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected) — returns the current logged-in user.
exports.me = async (req, res) => {
  res.json({ user: req.user.toPublic() });
};
