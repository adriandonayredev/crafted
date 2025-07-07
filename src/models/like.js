const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  _id: String,
  id_post: String,
  id_usuario: String
});

module.exports = mongoose.model("Like", likeSchema, "likes_posts");
