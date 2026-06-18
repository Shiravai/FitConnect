// controllers/adminController.js — site-wide management, accessible to admins only (requirement #21).
const User = require("../models/User");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Message = require("../models/Message");

// GET /api/admin/overview — totals + breakdown by role (for the dashboard cards).
exports.overview = async (req, res, next) => {
  try {
    const [users, groups, posts, messages] = await Promise.all([
      User.countDocuments(),
      Group.countDocuments(),
      Post.countDocuments(),
      Message.countDocuments(),
    ]);
    const roleCounts = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
    const roles = { user: 0, manager: 0, admin: 0 };
    roleCounts.forEach((r) => (roles[r._id] = r.count));
    res.json({ totals: { users, groups, posts, messages }, roles });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users — every user (no password hashes).
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/role — promote/demote a user.
exports.setRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "manager", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role." });
    if (String(req.params.id) === String(req.user._id))
      return res.status(400).json({ message: "You cannot change your own role." });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id — remove a user, their posts, and groups they own.
exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id))
      return res.status(400).json({ message: "You cannot delete your own account here." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await Post.deleteMany({ author: user._id });
    await Group.deleteMany({ owner: user._id });
    await Group.updateMany({}, { $pull: { members: user._id, pendingRequests: user._id } });
    await user.deleteOne();
    res.json({ message: "User deleted." });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/groups — every group.
exports.listGroups = async (req, res, next) => {
  try {
    const groups = await Group.find().populate("owner", "name username").sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/groups/:id — delete any group and its posts.
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found." });
    await Post.deleteMany({ group: group._id });
    await User.updateMany({ groups: group._id }, { $pull: { groups: group._id } });
    await group.deleteOne();
    res.json({ message: "Group deleted." });
  } catch (err) {
    next(err);
  }
};
