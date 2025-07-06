const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id_post: { type: String, required: true, ref: 'Post' },
  id_usuario: { type: String, required: true, ref: 'Usuario' },
  fecha: { type: Date, default: Date.now }
});

likeSchema.index({ id_post: 1, id_usuario: 1 }, { unique: true });

module.exports = mongoose.model("LikePost", likeSchema, "likes_posts");
