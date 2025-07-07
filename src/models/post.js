const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  _id: String,
  id_usuario: String,
  imagen_url: String,
  comentario: String,
  fecha: Date
});

module.exports = mongoose.model("Post", postSchema, "posts");
