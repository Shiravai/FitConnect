// seed/seed.js — fills the database with realistic demo data (requirement #23).
// Run with:  npm run seed
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Group = require("../models/Group");
const Post = require("../models/Post");
const Message = require("../models/Message");
const imagePosts = require("./imagePosts");

const SEED_IMG_DIR = path.join(__dirname, "images");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const SPORTS = ["Running", "CrossFit", "Yoga", "Cycling", "Swimming", "Gym", "Football", "Basketball"];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

const POST_TEXTS = [
  "Crushed my morning workout! 💪",
  "New personal record today, so happy!",
  "Rest days are part of the plan too 😴",
  "Who's joining the weekend session?",
  "Felt tough but finished strong.",
  "Consistency beats motivation every time.",
  "Tried a new route today, loved it!",
  "Recovery smoothie earned 🥤",
  "Small progress is still progress.",
  "Pushed past my limits this evening.",
];

async function run() {
  await connectDB();
  console.log("Clearing old data...");
  await Promise.all([User.deleteMany({}), Group.deleteMany({}), Post.deleteMany({}), Message.deleteMany({})]);

  // ---- Users (1 admin, 2 managers, rest regular) ----
  const usersData = [
    { name: "Admin User", email: "admin@fit.com", username: "admin", role: "admin", favoriteSport: "Gym" },
    { name: "Maya Cohen", email: "maya@fit.com", username: "maya", role: "manager", favoriteSport: "Running" },
    { name: "Daniel Levi", email: "daniel@fit.com", username: "daniel", role: "manager", favoriteSport: "CrossFit" },
    { name: "Noa Bar", email: "noa@fit.com", username: "noa", role: "user", favoriteSport: "Yoga" },
    { name: "Yossi Mizrahi", email: "yossi@fit.com", username: "yossi", role: "user", favoriteSport: "Cycling" },
    { name: "Tamar Shani", email: "tamar@fit.com", username: "tamar", role: "user", favoriteSport: "Swimming" },
    { name: "Omer Katz", email: "omer@fit.com", username: "omer", role: "user", favoriteSport: "Football" },
    { name: "Lior Peretz", email: "lior@fit.com", username: "lior", role: "user", favoriteSport: "Basketball" },
    { name: "Shira Golan", email: "shira@fit.com", username: "shira", role: "user", favoriteSport: "Running" },
  ];

  const users = [];
  for (const u of usersData) {
    const user = new User({ ...u, bio: `Hi, I'm ${u.name.split(" ")[0]} and I love ${u.favoriteSport}.` });
    await user.setPassword("123456"); // demo password for everyone
    await user.save();
    users.push(user);
  }
  console.log(`Created ${users.length} users (all passwords: 123456).`);

  const byName = (n) => users.find((u) => u.username === n);

  // ---- Friendships ----
  const mutual = async (a, b) => {
    a.friends.addToSet(b._id);
    b.friends.addToSet(a._id);
  };
  await mutual(byName("maya"), byName("noa"));
  await mutual(byName("maya"), byName("shira"));
  await mutual(byName("daniel"), byName("yossi"));
  await mutual(byName("noa"), byName("tamar"));
  await mutual(byName("omer"), byName("lior"));
  await Promise.all(users.map((u) => u.save()));

  // ---- Groups (>=5) ----
  const groupsData = [
    { name: "Tel Aviv Runners", sportType: "Running", privacy: "public", owner: byName("maya"), description: "Morning runs along the beach." },
    { name: "CrossFit Warriors", sportType: "CrossFit", privacy: "public", owner: byName("daniel"), description: "No pain, no gain." },
    { name: "Calm Yoga Circle", sportType: "Yoga", privacy: "private", owner: byName("maya"), description: "Private group for mindful practice." },
    { name: "City Cyclists", sportType: "Cycling", privacy: "public", owner: byName("daniel"), description: "Weekend rides around the city." },
    { name: "Pool Sharks", sportType: "Swimming", privacy: "public", owner: byName("maya"), description: "Swim training and tips." },
    { name: "Iron Gym Club", sportType: "Gym", privacy: "public", owner: byName("daniel"), description: "Strength training community." },
  ];

  const groups = [];
  for (const g of groupsData) {
    const group = await Group.create({
      name: g.name,
      sportType: g.sportType,
      privacy: g.privacy,
      description: g.description,
      owner: g.owner._id,
      members: [g.owner._id],
    });
    g.owner.groups.addToSet(group._id);
    await g.owner.save();
    groups.push(group);
  }
  console.log(`Created ${groups.length} groups.`);

  // ---- Memberships (add some regular users to groups) ----
  const addMember = async (group, user) => {
    group.members.addToSet(user._id);
    user.groups.addToSet(group._id);
    await group.save();
    await user.save();
  };
  await addMember(groups[0], byName("noa"));
  await addMember(groups[0], byName("shira"));
  await addMember(groups[0], byName("omer"));
  await addMember(groups[1], byName("yossi"));
  await addMember(groups[1], byName("lior"));
  await addMember(groups[3], byName("yossi"));
  await addMember(groups[4], byName("tamar"));
  await addMember(groups[5], byName("omer"));
  await addMember(groups[5], byName("lior"));
  // A pending request on the private yoga group:
  groups[2].pendingRequests.addToSet(byName("tamar")._id);
  await groups[2].save();

  // ---- Posts (>=30) spread over the last ~5 months ----
  const posts = [];
  for (let i = 0; i < 40; i++) {
    const author = rand(users);
    // 60% of posts belong to a group the author is in (else a personal post).
    const authorGroups = groups.filter((g) => g.members.some((m) => String(m) === String(author._id)));
    const group = authorGroups.length && Math.random() < 0.6 ? rand(authorGroups) : null;
    const sport = group ? group.sportType : author.favoriteSport || rand(SPORTS);
    const createdAt = daysAgo(randInt(0, 150));

    const mediaRoll = Math.random();
    let mediaType = "none";
    let mediaUrl = "";
    if (mediaRoll < 0.12) {
      mediaType = "video";
      mediaUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // sample video for the React Video component
    }

    const post = await Post.create({
      author: author._id,
      group: group ? group._id : null,
      text: rand(POST_TEXTS),
      mediaType,
      mediaUrl,
      workout: {
        sportType: sport,
        durationMin: randInt(20, 90),
        distanceKm: ["Running", "Cycling", "Swimming"].includes(sport) ? randInt(2, 30) : 0,
        calories: randInt(150, 800),
      },
      createdAt,
      updatedAt: createdAt,
    });
    posts.push(post);
  }

  // ---- Real photo posts (matched to the sport in each image) ----
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  let photoCount = 0;
  for (const ip of imagePosts) {
    const srcFile = path.join(SEED_IMG_DIR, ip.file);
    if (!fs.existsSync(srcFile)) continue; // skip if the image isn't present
    fs.copyFileSync(srcFile, path.join(UPLOADS_DIR, ip.file)); // publish to /uploads

    const author = byName(ip.author);
    const group = ip.group ? groups.find((g) => g.name === ip.group) : null;
    const createdAt = daysAgo(randInt(0, 60));

    const post = await Post.create({
      author: author._id,
      group: group ? group._id : null,
      text: ip.text,
      mediaType: "image",
      mediaUrl: `/uploads/${ip.file}`,
      workout: {
        sportType: ip.sport,
        durationMin: ip.workout?.durationMin || 0,
        distanceKm: ip.workout?.distanceKm || 0,
        calories: ip.workout?.calories || 0,
      },
      createdAt,
      updatedAt: createdAt,
    });
    posts.push(post);
    photoCount++;
  }
  console.log(`Added ${photoCount} real photo posts.`);

  // ---- Likes + comments on random posts ----
  for (const post of posts) {
    const likers = users.filter(() => Math.random() < 0.4);
    post.likes = likers.map((u) => u._id);
    if (Math.random() < 0.5) {
      post.comments.push({ author: rand(users)._id, text: rand(["Awesome!", "Keep it up!", "Inspiring 🔥", "Well done!", "Let's go!"]), date: post.createdAt });
    }
    await post.save();
  }
  console.log(`Created ${posts.length} posts with likes & comments.`);

  // ---- A few chat messages ----
  const room = Message.roomId(byName("maya")._id, byName("noa")._id);
  await Message.create([
    { room, sender: byName("maya")._id, text: "Hey Noa, joining the run tomorrow?" },
    { room, sender: byName("noa")._id, text: "For sure! What time?" },
    { room, sender: byName("maya")._id, text: "7am at the beach 🏃‍♀️" },
  ]);

  console.log("\n✔ Seed complete! Demo logins (password for all = 123456):");
  console.log("   admin  / 123456   (site admin)");
  console.log("   maya   / 123456   (group manager)");
  console.log("   daniel / 123456   (group manager)");
  console.log("   noa, yossi, tamar, omer, lior, shira  / 123456 (regular users)\n");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
