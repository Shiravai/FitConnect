// controllers/statsController.js — live aggregations from MongoDB for the D3 graphs (requirement #29).
const Post = require("../models/Post");
const Group = require("../models/Group");

// GET /api/stats/overview  — returns three datasets, all computed live from the DB.
exports.overview = async (req, res, next) => {
  try {
    // 1) Number of posts per sport type (bar chart).
    const bySport = await Post.aggregate([
      { $match: { "workout.sportType": { $nin: ["", null] } } },
      { $group: { _id: "$workout.sportType", count: { $sum: 1 } } },
      { $project: { _id: 0, label: "$_id", value: "$count" } },
      { $sort: { value: -1 } },
    ]);

    // 2) Total calories burned per month (line chart).
    const caloriesByMonth = await Post.aggregate([
      { $match: { "workout.calories": { $gt: 0 } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          calories: { $sum: "$workout.calories" },
        },
      },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              { $toString: "$_id.y" },
              "-",
              { $cond: [{ $lt: ["$_id.m", 10] }, { $concat: ["0", { $toString: "$_id.m" }] }, { $toString: "$_id.m" }] },
            ],
          },
          value: "$calories",
        },
      },
      { $sort: { label: 1 } },
    ]);

    // 3) Number of posts per group (pie chart) — top groups.
    const postsPerGroup = await Post.aggregate([
      { $match: { group: { $ne: null } } },
      { $group: { _id: "$group", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const groupIds = postsPerGroup.map((g) => g._id);
    const groups = await Group.find({ _id: { $in: groupIds } }).select("name");
    const nameById = Object.fromEntries(groups.map((g) => [String(g._id), g.name]));
    const byGroup = postsPerGroup.map((g) => ({
      label: nameById[String(g._id)] || "Unknown",
      value: g.count,
    }));

    res.json({ bySport, caloriesByMonth, byGroup });
  } catch (err) {
    next(err);
  }
};
