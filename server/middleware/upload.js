// middleware/upload.js — handles image/video file uploads with multer.
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `media-${unique}${safeExt}`);
  },
});

// Accept only images and videos; reject anything else (validation, requirement #24).
function fileFilter(req, file, cb) {
  if (/^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image or video files are allowed."));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

module.exports = upload;
