// middleware/permissions.js — role / ownership checks (requirement #21).
const Group = require("../models/Group");

// Only site admins.
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admins only." });
}

// Only the owner (manager) of the group in :groupId  — or an admin.
async function isGroupManager(req, res, next) {
  try {
    const group = await Group.findById(req.params.groupId || req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const isOwner = String(group.owner) === String(req.user._id);
    if (isOwner || req.user.role === "admin") {
      req.group = group; // pass it along so the controller doesn't refetch
      return next();
    }
    return res.status(403).json({ message: "Only the group manager can do this." });
  } catch (err) {
    next(err);
  }
}

module.exports = { isAdmin, isGroupManager };
