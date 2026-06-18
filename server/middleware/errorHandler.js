// middleware/errorHandler.js — central error handler so the server never crashes (requirement #24).
module.exports = function errorHandler(err, req, res, next) {
  console.error("[API error]", err.message);

  // Mongoose validation errors -> 400 with readable messages.
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(" ") });
  }

  // Duplicate key (e.g. email/username already taken).
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || { value: "" })[0];
    return res.status(409).json({ message: `That ${field} is already taken.` });
  }

  // Bad ObjectId in the URL.
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id format." });
  }

  // Multer / upload errors.
  if (err.message && /file|multipart|Only image/.test(err.message)) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({ message: err.message || "Something went wrong on the server." });
};
