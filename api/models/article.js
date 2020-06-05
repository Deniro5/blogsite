const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, require: true },
  author: { type: String, require: true },
  description: { type: String, require: true },
  date: { type: String, require: true },
  likedBy: [],
  likes: { type: Number, require: true },
  blocks: [{}],
  comments: [{}],
});

module.exports = mongoose.model("Article", articleSchema);
