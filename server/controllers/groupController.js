// controllers/groupController.js — CRUD + advanced search + membership management.
const Group = require("../models/Group");
const User = require("../models/User");
const Post = require("../models/Post");

// GET /api/groups  — List all groups.
exports.list = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate("owner", "name username")
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/search?sportType=&name=&privacy=&minMembers=
// Advanced search #2 with 4 parameters (requirement #20).
exports.search = async (req, res, next) => {
  try {
    const { sportType, name, privacy, minMembers } = req.query;
    const filter = {};
    if (sportType) filter.sportType = sportType;
    if (privacy) filter.privacy = privacy;
    if (name) filter.name = new RegExp(name, "i");

    let groups = await Group.find(filter).populate("owner", "name username");

    // minMembers filtered in memory (members is an array).
    if (minMembers) {
      const min = Number(minMembers) || 0;
      groups = groups.filter((g) => g.members.length >= min);
    }
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id  — One group. Hides member list for private groups you're not in.
exports.getOne = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner", "name username avatarUrl")
      .populate("members", "name username avatarUrl")
      .populate("pendingRequests", "name username avatarUrl");
    if (!group) return res.status(404).json({ message: "Group not found." });
    res.json(group);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups  — Create a group. Creator becomes manager + member.
exports.create = async (req, res, next) => {
  try {
    const { name, description, sportType, privacy, coverUrl } = req.body;
    const group = await Group.create({
      name,
      description: description || "",
      sportType,
      privacy: privacy || "public",
      coverUrl: coverUrl || "",
      owner: req.user._id,
      members: [req.user._id],
    });

    // The creator gets the "manager" role if they were a plain user.
    if (req.user.role === "user") {
      req.user.role = "manager";
    }
    req.user.groups.addToSet(group._id);
    await req.user.save();

    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

// PUT /api/groups/:id  — Update group (manager only; enforced by middleware).
exports.update = async (req, res, next) => {
  try {
    const group = req.group; // set by isGroupManager middleware
    ["name", "description", "sportType", "privacy", "coverUrl"].forEach((f) => {
      if (req.body[f] !== undefined) group[f] = req.body[f];
    });
    await group.save();
    res.json(group);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id  — Delete group (manager only) + its posts.
exports.remove = async (req, res, next) => {
  try {
    const group = req.group;
    await Post.deleteMany({ group: group._id });
    await User.updateMany({ groups: group._id }, { $pull: { groups: group._id } });
    await group.deleteOne();
    res.json({ message: "Group deleted." });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/join  — Request to join (public = instant, private = pending).
exports.requestJoin = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found." });

    if (group.members.some((m) => String(m) === String(req.user._id)))
      return res.status(400).json({ message: "You are already a member." });

    if (group.privacy === "public") {
      group.members.addToSet(req.user._id);
      req.user.groups.addToSet(group._id);
      await req.user.save();
      await group.save();
      return res.json({ message: "Joined group.", status: "member" });
    }

    // private -> pending approval by the manager
    group.pendingRequests.addToSet(req.user._id);
    await group.save();
    res.json({ message: "Join request sent. Waiting for manager approval.", status: "pending" });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/approve/:userId  — Manager approves a pending request.
exports.approve = async (req, res, next) => {
  try {
    const group = req.group; // manager-checked
    const { userId } = req.params;
    if (!group.pendingRequests.some((u) => String(u) === userId))
      return res.status(400).json({ message: "No pending request from this user." });

    group.pendingRequests.pull(userId);
    group.members.addToSet(userId);
    await group.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });
    res.json({ message: "Member approved." });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:groupId/reject/:userId  — Manager rejects a pending request.
exports.reject = async (req, res, next) => {
  try {
    const group = req.group;
    group.pendingRequests.pull(req.params.userId);
    await group.save();
    res.json({ message: "Request rejected." });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/leave  — A member leaves the group.
exports.leave = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found." });
    if (String(group.owner) === String(req.user._id))
      return res.status(400).json({ message: "The manager cannot leave their own group. Delete it instead." });

    group.members.pull(req.user._id);
    req.user.groups.pull(group._id);
    await group.save();
    await req.user.save();
    res.json({ message: "You left the group." });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:groupId/members/:userId  — Manager removes a member.
exports.removeMember = async (req, res, next) => {
  try {
    const group = req.group;
    const { userId } = req.params;
    if (String(group.owner) === userId)
      return res.status(400).json({ message: "Cannot remove the manager." });
    group.members.pull(userId);
    await group.save();
    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });
    res.json({ message: "Member removed." });
  } catch (err) {
    next(err);
  }
};
