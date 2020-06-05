const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  password: { type: String, require: true },
  bio: { type: String },
  username: { type: String, require: true },
  following: [],
  followers: [],
  articles: [{}],
  userImage: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
