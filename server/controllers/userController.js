// controllers/userController.js — CRUD + search for users (requirement #19).
const User = require("../models/User");
const Post = require("../models/Post");

// GET /api/users  — List all users (public profile fields only).
exports.list = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/search?name=&favoriteSport=&role=  — Search users by several fields.
exports.search = async (req, res, next) => {
  try {
    const { name, favoriteSport, role } = req.query;
    const filter = {};
    if (name) filter.$or = [
      { name: new RegExp(name, "i") },
      { username: new RegExp(name, "i") },
    ];
    if (favoriteSport) filter.favoriteSport = new RegExp(`^${favoriteSport}$`, "i");
    if (role) filter.role = role;

    const users = await User.find(filter).select("-passwordHash").limit(100);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id  — A single public profile.
exports.getOne = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate("groups", "name sportType");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me  — Update own profile (only your own — requirement #21).
exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ["name", "bio", "favoriteSport", "avatarUrl"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    // Optional password change
    if (req.body.password) await req.user.setPassword(req.body.password);
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me  — Delete own account (and your posts).
exports.deleteMe = async (req, res, next) => {
  try {
    await Post.deleteMany({ author: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted." });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/friend  — Toggle friend (add/remove a friend).
exports.toggleFriend = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id))
      return res.status(400).json({ message: "You cannot friend yourself." });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });

    const already = req.user.friends.some((f) => String(f) === req.params.id);
    if (already) {
      req.user.friends.pull(req.params.id);
      target.friends.pull(req.user._id);
    } else {
      req.user.friends.push(req.params.id);
      target.friends.push(req.user._id);
    }
    await req.user.save();
    await target.save();
    res.json({ friends: req.user.friends });
  } catch (err) {
    next(err);
  }
};
