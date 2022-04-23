const mongoose = require("mongoose");
const userModel = require("./userModel");

let blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  postLinkTitle: { type: String, required: true },
  desc: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: { type: String, default: Date.now },
});

module.exports = mongoose.model("blog", blogSchema);
