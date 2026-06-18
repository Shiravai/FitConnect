// controllers/postController.js — CRUD + advanced search + feed + likes/comments.
const Post = require("../models/Post");
const Group = require("../models/Group");

// Re-usable populate so every response has author + group details.
const withRefs = (q) =>
  q
    .populate("author", "name username avatarUrl")
    .populate("group", "name sportType privacy")
    .populate("comments.author", "name username avatarUrl");

// Returns the ids of groups the user may read posts from (public groups + groups they're in).
async function visibleGroupIds(user) {
  const publicGroups = await Group.find({ privacy: "public" }).select("_id");
  const ids = new Set(publicGroups.map((g) => String(g._id)));
  (user?.groups || []).forEach((g) => ids.add(String(g)));
  return ids;
}

// GET /api/posts  — List posts the current user is allowed to see.
exports.list = async (req, res, next) => {
  try {
    const visible = await visibleGroupIds(req.user);
    const posts = await withRefs(Post.find().sort({ createdAt: -1 }).limit(200));
    const filtered = posts.filter((p) => !p.group || visible.has(String(p.group._id)));
    res.json(filtered);
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/feed — Own posts + friends' posts + posts from groups you joined (requirement #22).
exports.feed = async (req, res, next) => {
  try {
    const me = req.user;
    const authorIds = [me._id, ...me.friends];
    const groupIds = me.groups;

    const posts = await withRefs(
      Post.find({
        $or: [
          { author: { $in: authorIds } },
          { group: { $in: groupIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(200)
    );
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/search?sportType=&keyword=&from=&to=&minDistance=
// Advanced search #1 with 5 parameters (requirement #20).
exports.search = async (req, res, next) => {
  try {
    const { sportType, keyword, from, to, minDistance } = req.query;
    const filter = {};
    if (sportType) filter["workout.sportType"] = sportType;
    if (keyword) filter.text = new RegExp(keyword, "i");
    if (minDistance) filter["workout.distanceKm"] = { $gte: Number(minDistance) || 0 };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + "T23:59:59");
    }

    const visible = await visibleGroupIds(req.user);
    const posts = await withRefs(Post.find(filter).sort({ createdAt: -1 }).limit(200));
    res.json(posts.filter((p) => !p.group || visible.has(String(p.group._id))));
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/user/:userId  — Every post by one user (their own posts page).
exports.byUser = async (req, res, next) => {
  try {
    const posts = await withRefs(Post.find({ author: req.params.userId }).sort({ createdAt: -1 }));
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/group/:groupId  — Posts inside a group (gated for private groups).
exports.byGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const isMember = group.members.some((m) => String(m) === String(req.user._id));
    if (group.privacy === "private" && !isMember && req.user.role !== "admin")
      return res.status(403).json({ message: "This is a private group. Join to see its posts." });

    const posts = await withRefs(Post.find({ group: group._id }).sort({ createdAt: -1 }));
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// POST /api/posts  — Create a post.
exports.create = async (req, res, next) => {
  try {
    const { text, group, mediaType, mediaUrl, workout } = req.body;

    if (!text && !mediaUrl)
      return res.status(400).json({ message: "A post needs text or media." });

    // If posting into a group, the user must be a member of it.
    if (group) {
      const g = await Group.findById(group);
      if (!g) return res.status(404).json({ message: "Group not found." });
      const isMember = g.members.some((m) => String(m) === String(req.user._id));
      if (!isMember) return res.status(403).json({ message: "Join the group before posting in it." });
    }

    const post = await Post.create({
      author: req.user._id,
      group: group || null,
      text: text || "",
      mediaType: mediaType || "none",
      mediaUrl: mediaUrl || "",
      workout: workout || {},
    });
    res.status(201).json(await withRefs(Post.findById(post._id)));
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id  — Update a post (only the author — requirement #21).
exports.update = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "You can only edit your own posts." });

    ["text", "mediaType", "mediaUrl", "workout"].forEach((f) => {
      if (req.body[f] !== undefined) post[f] = req.body[f];
    });
    await post.save();
    res.json(await withRefs(Post.findById(post._id)));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id  — Delete a post (only the author or admin).
exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "You can only delete your own posts." });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like  — Toggle like.
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const liked = post.likes.some((u) => String(u) === String(req.user._id));
    if (liked) post.likes.pull(req.user._id);
    else post.likes.addToSet(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comment  — Add a comment.
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!req.body.text || !req.body.text.trim())
      return res.status(400).json({ message: "Comment cannot be empty." });

    post.comments.push({ author: req.user._id, text: req.body.text.trim() });
    await post.save();
    res.status(201).json(await withRefs(Post.findById(post._id)));
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/upload  — Upload image/video/drawing, returns its public URL.
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    res.json({ url: `/uploads/${req.file.filename}`, mimetype: req.file.mimetype });
  } catch (err) {
    next(err);
  }
};
